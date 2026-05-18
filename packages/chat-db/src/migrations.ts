import type { DB } from "@op-engineering/op-sqlite";

interface Migration {
  version: number;
  up: string[];
}

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    up: [
      `CREATE TABLE chats (
        id TEXT PRIMARY KEY NOT NULL,
        kind TEXT NOT NULL CHECK (kind IN ('direct','group')),
        title TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        last_message_id TEXT
      ) WITHOUT ROWID`,

      `CREATE TABLE messages (
        id TEXT PRIMARY KEY NOT NULL,
        chat_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        ciphertext BLOB NOT NULL,
        nonce BLOB NOT NULL,
        sent_at INTEGER NOT NULL,
        received_at INTEGER,
        status TEXT NOT NULL CHECK (status IN ('pending','sent','delivered','failed'))
      ) WITHOUT ROWID`,
      `CREATE INDEX idx_messages_chat_sent ON messages (chat_id, sent_at DESC)`,

      `CREATE TABLE members (
        chat_id TEXT NOT NULL,
        account_id TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('owner','admin','member')),
        joined_at INTEGER NOT NULL,
        identity_pubkey BLOB NOT NULL,
        PRIMARY KEY (chat_id, account_id)
      ) WITHOUT ROWID`,

      `CREATE TABLE sync_cursor (
        chat_id TEXT PRIMARY KEY NOT NULL,
        last_seen_message_id TEXT,
        last_synced_at INTEGER NOT NULL
      ) WITHOUT ROWID`,

      `CREATE TABLE pending_outbox (
        id TEXT PRIMARY KEY NOT NULL,
        chat_id TEXT NOT NULL,
        payload BLOB NOT NULL,
        idempotency_key TEXT NOT NULL UNIQUE,
        attempts INTEGER NOT NULL DEFAULT 0,
        next_attempt_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        last_error TEXT
      ) WITHOUT ROWID`,
      `CREATE INDEX idx_outbox_next_attempt ON pending_outbox (next_attempt_at)`,

      `CREATE TABLE key_material (
        account_id TEXT PRIMARY KEY NOT NULL,
        identity_pub BLOB NOT NULL,
        identity_priv BLOB NOT NULL,
        created_at INTEGER NOT NULL
      ) WITHOUT ROWID`,
    ],
  },
  {
    version: 2,
    up: [
      // Local mirror of the server pubkey directory (UserDevice). One row per
      // (peer account, device). 24h TTL applied at read time via refreshed_at.
      `CREATE TABLE peer_keys (
        account_id TEXT NOT NULL,
        device_id TEXT NOT NULL,
        ed25519_pub BLOB NOT NULL,
        x25519_pub BLOB NOT NULL,
        refreshed_at INTEGER NOT NULL,
        server_updated_at INTEGER NOT NULL,
        PRIMARY KEY (account_id, device_id)
      ) WITHOUT ROWID`,
      `CREATE INDEX idx_peer_keys_refreshed ON peer_keys (refreshed_at)`,
    ],
  },
];

const LAST = MIGRATIONS[MIGRATIONS.length - 1];
if (!LAST) throw new Error("chat-db: no migrations defined");
export const LATEST_VERSION = LAST.version;

export async function runMigrations(db: DB): Promise<{
  from: number;
  to: number;
  applied: number;
}> {
  const result = await db.execute("PRAGMA user_version");
  const current = (result.rows?.[0]?.user_version as number) ?? 0;
  if (current >= LATEST_VERSION) {
    return { from: current, to: current, applied: 0 };
  }

  const pending = MIGRATIONS.filter((m) => m.version > current);
  await db.execute("BEGIN");
  try {
    for (const migration of pending) {
      for (const stmt of migration.up) await db.execute(stmt);
      await db.execute(`PRAGMA user_version = ${migration.version}`);
    }
    await db.execute("COMMIT");
  } catch (err) {
    await db.execute("ROLLBACK");
    throw err;
  }

  return {
    from: current,
    to: LATEST_VERSION,
    applied: pending.length,
  };
}
