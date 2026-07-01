import type { DB } from "@op-engineering/op-sqlite";
import type { ChatDbHandle } from "./client";
import type { MlsEngineStateRow, MlsGroupRow } from "./schema";

// op-sqlite returns BLOB columns as ArrayBuffer (sometimes ArrayBuffer-like
// with a .buffer). Wrap so callers get the schema-declared Uint8Array.
function toBytes(v: unknown): Uint8Array {
  if (v instanceof Uint8Array) return v;
  if (v instanceof ArrayBuffer) return new Uint8Array(v);
  if (
    typeof v === "object" &&
    v !== null &&
    "buffer" in v &&
    (v as { buffer: unknown }).buffer instanceof ArrayBuffer
  ) {
    return new Uint8Array((v as { buffer: ArrayBuffer }).buffer);
  }
  throw new Error(`chat-db.mls: BLOB column has unexpected type ${typeof v}`);
}

// ── mls_engine_state ────────────────────────────────────────────────────────
// One row per account. The whole-engine snapshot blob produced by
// ChatMlsCore.dumpState(). See migrations v3 + ADR-015 follow-up for why this
// is single-row instead of per-entry (StorageProvider impl lands in M8).

export async function loadEngineSnapshot(
  db: DB,
  accountId: string,
): Promise<MlsEngineStateRow | null> {
  const result = await db.execute(
    "SELECT account_id, snapshot, updated_at FROM mls_engine_state WHERE account_id = ?",
    [accountId],
  );
  const row = (result.rows?.[0] ?? null) as {
    account_id: string;
    snapshot: unknown;
    updated_at: number;
  } | null;
  if (!row) return null;
  return {
    account_id: row.account_id,
    snapshot: toBytes(row.snapshot),
    updated_at: row.updated_at,
  };
}

export async function saveEngineSnapshot(
  db: DB,
  accountId: string,
  snapshot: Uint8Array,
  updatedAt: number = Date.now(),
): Promise<void> {
  // UPSERT keyed on account_id — the table is a single row per account.
  await db.execute(
    `INSERT INTO mls_engine_state (account_id, snapshot, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(account_id) DO UPDATE SET
       snapshot   = excluded.snapshot,
       updated_at = excluded.updated_at`,
    [accountId, snapshot, updatedAt],
  );
}

export async function clearEngineSnapshot(
  db: DB,
  accountId: string,
): Promise<void> {
  await db.execute("DELETE FROM mls_engine_state WHERE account_id = ?", [
    accountId,
  ]);
}

// ── mls_group ───────────────────────────────────────────────────────────────
// Local group registry — one row per joined MLS group on this device. The
// last_applied_epoch cursor drives fetchPendingCommits paging (next poll asks
// for `sinceEpoch = last_applied_epoch + 1`).

export interface MlsGroupUpsert {
  groupId: Uint8Array;
  chatId?: string | null;
  /** Defaults to 0 on create — the founder's createGroup transitions epoch 0
   *  into local state without a Commit. */
  initialEpoch?: number;
}

/** Lightweight projection returned by listGroups — drops the blob join_at
 *  noise from the debug screen path. */
export interface MlsGroupListItem {
  groupId: Uint8Array;
  chatId: string | null;
  lastAppliedEpoch: number;
}

export async function upsertGroup(
  db: DB,
  input: MlsGroupUpsert,
  joinedAt: number = Date.now(),
): Promise<void> {
  // ON CONFLICT: don't clobber last_applied_epoch — the caller may be
  // re-registering an existing group (e.g. snapshot restore on cold start)
  // and we'd lose the epoch cursor.
  await db.execute(
    `INSERT INTO mls_group (group_id, chat_id, last_applied_epoch, joined_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(group_id) DO UPDATE SET
       chat_id = COALESCE(excluded.chat_id, mls_group.chat_id)`,
    [input.groupId, input.chatId ?? null, input.initialEpoch ?? 0, joinedAt],
  );
}

export async function setLastAppliedEpoch(
  db: DB,
  groupId: Uint8Array,
  epoch: number,
): Promise<void> {
  await db.execute(
    `UPDATE mls_group
        SET last_applied_epoch = ?
      WHERE group_id = ?`,
    [epoch, groupId],
  );
}

export async function getGroup(
  db: DB,
  groupId: Uint8Array,
): Promise<MlsGroupRow | null> {
  const result = await db.execute(
    "SELECT group_id, chat_id, last_applied_epoch, joined_at FROM mls_group WHERE group_id = ?",
    [groupId],
  );
  const row = (result.rows?.[0] ?? null) as {
    group_id: unknown;
    chat_id: string | null;
    last_applied_epoch: number;
    joined_at: number;
  } | null;
  if (!row) return null;
  return {
    group_id: toBytes(row.group_id),
    chat_id: row.chat_id,
    last_applied_epoch: row.last_applied_epoch,
    joined_at: row.joined_at,
  };
}

export async function listGroups(db: DB): Promise<MlsGroupListItem[]> {
  const result = await db.execute(
    "SELECT group_id, chat_id, last_applied_epoch FROM mls_group",
  );
  const rows = (result.rows ?? []) as unknown as Array<{
    group_id: unknown;
    chat_id: string | null;
    last_applied_epoch: number;
  }>;
  return rows.map((r) => ({
    groupId: toBytes(r.group_id),
    chatId: r.chat_id,
    lastAppliedEpoch: r.last_applied_epoch,
  }));
}

// Wipe every row in mls_group. Used by MlsClient.reset() during
// multi-account swap on the same install (README §M3.5 acceptance). The
// chats.mls_group_id columns are intentionally left in place — chat rows
// outlive groups per ADR-015 §7.
export async function clearAllGroups(db: DB): Promise<void> {
  await db.execute("DELETE FROM mls_group");
}

// ── chats.mls_group_id link ─────────────────────────────────────────────────
// Set or replace the MLS GroupId for an existing chat row. UPSERT-style: if
// the chat row doesn't exist this is a no-op (returns updates: 0). The
// debug harness uses ensureChat below to seed a row first.

export async function setChatMlsGroupId(
  db: DB,
  chatId: string,
  groupId: Uint8Array,
): Promise<{ updates: number }> {
  const result = await db.execute(
    "UPDATE chats SET mls_group_id = ? WHERE id = ?",
    [groupId, chatId],
  );
  return { updates: result.rowsAffected ?? 0 };
}

// Convenience for the debug harness: creates a minimal `chats` row if one
// doesn't already exist for `chatId`. The M4 chat UI owns chat creation
// proper — production callers should NOT use this; it bypasses normal
// metadata and member setup.
export async function ensureChatForDebug(
  db: DB,
  chatId: string,
  kind: "direct" | "group" = "group",
  now: number = Date.now(),
): Promise<{ created: boolean }> {
  const existing = await db.execute("SELECT id FROM chats WHERE id = ?", [
    chatId,
  ]);
  if ((existing.rows?.length ?? 0) > 0) return { created: false };
  await db.execute(
    `INSERT INTO chats (id, kind, title, created_at, updated_at, last_message_id, mls_group_id)
     VALUES (?, ?, NULL, ?, ?, NULL, NULL)`,
    [chatId, kind, now, now],
  );
  return { created: true };
}

// Production chat-row upsert (ADR-016) — the M4 chat UI's source of truth for
// the local `chats` mirror. Unlike ensureChatForDebug it carries name +
// mls_group_id and refreshes them on conflict, so a chat.list sync keeps the
// row current and links the MLS group. resolveChatGroupId reads mls_group_id
// off this row. COALESCE preserves an existing link if a later sync omits it.
export async function upsertChat(
  db: DB,
  input: {
    id: string;
    kind: "direct" | "group";
    name?: string | null;
    mlsGroupId?: Uint8Array | null;
  },
  now: number = Date.now(),
): Promise<void> {
  await db.execute(
    `INSERT INTO chats (id, kind, title, created_at, updated_at, last_message_id, mls_group_id)
     VALUES (?, ?, ?, ?, ?, NULL, ?)
     ON CONFLICT(id) DO UPDATE SET
       title        = excluded.title,
       updated_at   = excluded.updated_at,
       mls_group_id = COALESCE(excluded.mls_group_id, chats.mls_group_id)`,
    [
      input.id,
      input.kind,
      input.name ?? null,
      now,
      now,
      input.mlsGroupId ?? null,
    ],
  );
}

// Reverse of chats.mls_group_id: the chatId for a joined GroupId, or null.
// Lets the join path map a Welcome's group back to its server chat row once
// chat.list has synced the mapping (ADR-016).
export async function chatIdByGroupId(
  db: DB,
  groupId: Uint8Array,
): Promise<string | null> {
  const result = await db.execute(
    "SELECT id FROM chats WHERE mls_group_id = ? LIMIT 1",
    [groupId],
  );
  const row = (result.rows?.[0] ?? null) as { id: string } | null;
  return row?.id ?? null;
}

// Point an already-joined group's row at its real chat. No-op if the group
// isn't in mls_group yet (won't create a phantom) — used by the chat.list sync
// to heal a group that joined under the interim harness chatId before the
// server mapping was known.
export async function relinkGroupChatId(
  db: DB,
  groupId: Uint8Array,
  chatId: string,
): Promise<void> {
  await db.execute("UPDATE mls_group SET chat_id = ? WHERE group_id = ?", [
    chatId,
    groupId,
  ]);
}

// ── Pre-bound store for MlsClient DI ────────────────────────────────────────
// Returns an object whose methods are the namespace functions above with the
// DB handle already curried. Structurally matches @repo/chat-mls-core's
// MlsStoreApi (duck-typed — keeps the import edge one-way: chat-mls-core →
// chat-db, never reverse).
export function createBoundMlsStore(handle: ChatDbHandle) {
  const db = handle.db;
  return {
    loadEngineSnapshot: (accountId: string) =>
      loadEngineSnapshot(db, accountId),
    saveEngineSnapshot: (accountId: string, snapshot: Uint8Array) =>
      saveEngineSnapshot(db, accountId, snapshot),
    clearEngineSnapshot: (accountId: string) =>
      clearEngineSnapshot(db, accountId),
    upsertGroup: (input: MlsGroupUpsert) => upsertGroup(db, input),
    setLastAppliedEpoch: (groupId: Uint8Array, epoch: number) =>
      setLastAppliedEpoch(db, groupId, epoch),
    getGroup: (groupId: Uint8Array) => getGroup(db, groupId),
    listGroups: () => listGroups(db),
    clearAllGroups: () => clearAllGroups(db),
    setChatMlsGroupId: (chatId: string, groupId: Uint8Array) =>
      setChatMlsGroupId(db, chatId, groupId),
    ensureChatForDebug: (chatId: string, kind: "direct" | "group" = "group") =>
      ensureChatForDebug(db, chatId, kind),
    upsertChat: (input: {
      id: string;
      kind: "direct" | "group";
      name?: string | null;
      mlsGroupId?: Uint8Array | null;
    }) => upsertChat(db, input),
    chatIdByGroupId: (groupId: Uint8Array) => chatIdByGroupId(db, groupId),
    relinkGroupChatId: (groupId: Uint8Array, chatId: string) =>
      relinkGroupChatId(db, groupId, chatId),
  };
}
