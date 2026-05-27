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
  // NB: pre-launch M3.5 added a signal_device_id column on peer_keys and a
  // chat_versions table (migrations 3 + 4). Both removed per ADR-015 — the
  // libsignal stack was replaced by OpenMLS before any user ran it. If your
  // local chat.db has user_version >= 3, delete it before launching this
  // branch; the runner is forward-only and will not roll back.
  {
    version: 3,
    up: [
      // Single-row whole-blob snapshot of the OpenMLS engine state, written
      // after every mutating engine call (Chunk 5). The custom StorageProvider
      // landing in M8 (ADR-015 follow-up) replaces this with a kv-per-entry
      // model when typical-user storage profiles outgrow ~50 groups.
      `CREATE TABLE mls_engine_state (
        account_id TEXT PRIMARY KEY NOT NULL,
        snapshot BLOB NOT NULL,
        updated_at INTEGER NOT NULL
      ) WITHOUT ROWID`,

      // Local registry of MLS groups this device has joined. last_applied_epoch
      // is the cursor for fetchPendingCommits paging — we pull commits with
      // epoch > last_applied_epoch on each poll. chat_id may be null while the
      // group exists but no Chat row has been created yet (rare; only during
      // a multi-step group create where the Chat write follows the MLS create).
      `CREATE TABLE mls_group (
        group_id BLOB PRIMARY KEY NOT NULL,
        chat_id TEXT,
        last_applied_epoch INTEGER NOT NULL DEFAULT 0,
        joined_at INTEGER NOT NULL
      ) WITHOUT ROWID`,
      `CREATE INDEX idx_mls_group_chat ON mls_group (chat_id)`,

      // mls_group_id links a chats row to its MLS group. Nullable because v=1
      // libsodium 1:1 chats predate MLS and don't have one; v=2 chats always
      // populate it. See ADR-015 §7 — chats outlive groups, so this column
      // can be rewritten if a group is destroyed and recreated under same
      // chat_id with a fresh GroupId.
      `ALTER TABLE chats ADD COLUMN mls_group_id BLOB`,
    ],
  },
  {
    version: 4,
    up: [
      // M4-followup #25: persistent plaintext for cold-start rehydration.
      // MLS forward secrecy advances the ratchet on first decrypt — without
      // a cached plaintext, opening the app cold loses every prior message.
      // Column is nullable; existing rows stay null until they're re-sent
      // or migrated, but Phase 1 has no live v=2 messages pre-M4 anyway.
      //
      // client_msg_id mirrors the sender's local id so we can match an
      // optimistic-send entry to its server-assigned row on confirm.
      `ALTER TABLE messages ADD COLUMN plaintext TEXT`,
      `ALTER TABLE messages ADD COLUMN client_msg_id TEXT`,
      `CREATE INDEX idx_messages_client_msg_id ON messages (client_msg_id)`,
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
