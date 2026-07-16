import { open, type DB } from "@op-engineering/op-sqlite";

import { getOrCreatePassphrase, type PassphraseSource } from "./key";
import { runMigrations, LATEST_VERSION } from "./migrations";
import { importLegacyChatDb } from "./legacy-import";

// One DB file PER SIGNED-IN ACCOUNT, keyed by the Better Auth user id. The
// shared-file era ("chat.sqlite") leaked state across accounts on the same
// install: backfill cursors poisoned each other (account B inherited account
// A's high-water mark and permanently skipped messages), the plaintext cache
// crossed account boundaries, and the outbox could dispatch one account's
// queued sends under another's session. The SQLCipher passphrase stays
// install-wide (device-at-rest threat model doesn't change per account).
//
// The active account is pushed in by the auth store via setActiveChatDbUser();
// getChatDb() callers all run post-auth, so a call that arrives before the
// first sign-in simply waits for it.

export interface ChatDbHandle {
  db: DB;
  version: number;
  keySource: PassphraseSource;
}

function dbNameForUser(userId: string): string {
  // Auth user ids are url-safe today; sanitise anyway — a file name must
  // never depend on that staying true.
  return `chat-${userId.replace(/[^A-Za-z0-9_-]/g, "_")}.sqlite`;
}

let activeUserId: string | null = null;
let cached: { userId: string; handle: ChatDbHandle } | null = null;
let opening: { userId: string; promise: Promise<ChatDbHandle> } | null = null;
let gate: Array<() => void> = [];

function closeQuietly(handle: ChatDbHandle): void {
  void Promise.resolve()
    .then(() => handle.db.close())
    .catch((err: unknown) => {
      console.warn("[chat-db] close failed", err);
    });
}

/** Auth-store hook point. Call with the Better Auth user id on sign-in and
 *  null on sign-out. Switching users closes the previous handle; consumers
 *  re-resolve via getChatDb() and land on the new account's file. */
export function setActiveChatDbUser(userId: string | null): void {
  if (userId === activeUserId) return;
  activeUserId = userId;
  opening = null;
  if (cached) {
    const stale = cached;
    cached = null;
    closeQuietly(stale.handle);
  }
  if (userId) {
    const waiters = gate;
    gate = [];
    for (const release of waiters) release();
  }
}

function waitForActiveUser(): Promise<void> {
  return new Promise((resolve) => gate.push(resolve));
}

async function openForUser(userId: string): Promise<ChatDbHandle> {
  const { passphrase, source } = await getOrCreatePassphrase();
  const db = open({ name: dbNameForUser(userId), encryptionKey: passphrase });

  await db.execute("PRAGMA foreign_keys = ON");
  await db.execute("PRAGMA journal_mode = WAL");

  await runMigrations(db);

  // One-time import from the shared-file era. The marker lives outside the
  // import transaction; a crash in between only re-runs the idempotent copy
  // (INSERT OR IGNORE). An import failure throws — better a loud open failure
  // than silently abandoning the account's MLS engine snapshot.
  await db.execute(
    "CREATE TABLE IF NOT EXISTS legacy_import (done INTEGER PRIMARY KEY NOT NULL)",
  );
  const marker = await db.execute("SELECT done FROM legacy_import LIMIT 1");
  if ((marker.rows ?? []).length === 0) {
    const { imported, rows } = await importLegacyChatDb(db, passphrase);
    await db.execute("INSERT OR IGNORE INTO legacy_import (done) VALUES (1)");
    if (imported) {
      console.log("[chat-db] imported legacy shared DB", { userId, rows });
    }
  }

  return { db, version: LATEST_VERSION, keySource: source };
}

export async function getChatDb(): Promise<ChatDbHandle> {
  for (;;) {
    if (!activeUserId) {
      await waitForActiveUser();
      continue;
    }
    const userId = activeUserId;
    if (cached?.userId === userId) return cached.handle;

    if (!opening || opening.userId !== userId) {
      opening = { userId, promise: openForUser(userId) };
    }
    const current = opening;
    let handle: ChatDbHandle;
    try {
      handle = await current.promise;
    } catch (err) {
      if (opening === current) opening = null;
      throw err;
    }
    if (opening === current) opening = null;

    // Account switched while the open was in flight — discard and retry.
    if (activeUserId !== userId) {
      if (cached?.handle !== handle) closeQuietly(handle);
      continue;
    }
    cached = { userId, handle };
    return handle;
  }
}

export async function closeChatDb(): Promise<void> {
  if (!cached) return;
  const stale = cached;
  cached = null;
  await stale.handle.db.close();
}
