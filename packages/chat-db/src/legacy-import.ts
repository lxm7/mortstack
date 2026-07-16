import { open, type DB } from "@op-engineering/op-sqlite";

import { runMigrations } from "./migrations";

// One-time import of the shared-file era database ("chat.sqlite") into a fresh
// per-account file. Before the per-account split every signed-in user on an
// install shared one DB, so the legacy file holds the union of their data —
// crucially each account's mls_engine_state snapshot, which is unrecoverable
// if dropped (MLS group state can't be re-derived; there is no re-Welcome
// mechanism yet), and the plaintext message cache (forward secrecy means old
// v=2 ciphertexts can never be re-decrypted).

export const LEGACY_DB_NAME = "chat.sqlite";

// Tables copied verbatim. Cursor + queue tables are deliberately absent:
//   - backfill_cursors / sync_cursor start at zero for the account — the
//     shared-file cursors are exactly the cross-account poisoning this split
//     fixes (account B inheriting account A's high-water mark skips messages
//     B has never seen).
//   - pending_outbox rows aren't account-attributable; a queued send must
//     never dispatch under a different signed-in user.
const COPY_TABLES: ReadonlyArray<{ table: string; cols: string[] }> = [
  {
    table: "chats",
    cols: [
      "id",
      "kind",
      "title",
      "created_at",
      "updated_at",
      "last_message_id",
      "mls_group_id",
    ],
  },
  {
    table: "messages",
    cols: [
      "id",
      "chat_id",
      "sender_id",
      "ciphertext",
      "nonce",
      "sent_at",
      "received_at",
      "status",
      "plaintext",
      "client_msg_id",
    ],
  },
  {
    table: "members",
    cols: ["chat_id", "account_id", "role", "joined_at", "identity_pubkey"],
  },
  {
    table: "key_material",
    cols: ["account_id", "identity_pub", "identity_priv", "created_at"],
  },
  {
    table: "peer_keys",
    cols: [
      "account_id",
      "device_id",
      "ed25519_pub",
      "x25519_pub",
      "refreshed_at",
      "server_updated_at",
    ],
  },
  {
    table: "mls_engine_state",
    cols: ["account_id", "snapshot", "updated_at"],
  },
  {
    table: "mls_group",
    cols: ["group_id", "chat_id", "last_applied_epoch", "joined_at"],
  },
];

export interface LegacyImportResult {
  imported: boolean;
  rows: number;
}

// Copy the legacy DB's rows into `fresh`. INSERT OR IGNORE keeps this
// idempotent — a crash between the copy and the caller's marker write only
// causes a harmless re-run. Opening the legacy name creates an empty file
// when none exists; user_version 0 identifies that case (no schema ever ran)
// and we skip without copying.
export async function importLegacyChatDb(
  fresh: DB,
  passphrase: string,
): Promise<LegacyImportResult> {
  const legacy = open({ name: LEGACY_DB_NAME, encryptionKey: passphrase });
  try {
    const vres = await legacy.execute("PRAGMA user_version");
    const version = (vres.rows?.[0]?.user_version as number) ?? 0;
    if (version === 0) return { imported: false, rows: 0 };

    // Bring the legacy file up to the current schema so the column lists
    // below are valid — same forward-only runner the shared-file era used.
    await runMigrations(legacy);

    let copied = 0;
    await fresh.execute("BEGIN IMMEDIATE");
    try {
      for (const { table, cols } of COPY_TABLES) {
        const res = await legacy.execute(
          `SELECT ${cols.join(", ")} FROM ${table}`,
        );
        const rows = (res.rows ?? []) as Array<Record<string, unknown>>;
        if (rows.length === 0) continue;
        const sql = `INSERT OR IGNORE INTO ${table} (${cols.join(", ")})
                     VALUES (${cols.map(() => "?").join(", ")})`;
        for (const row of rows) {
          await fresh.execute(
            sql,
            cols.map((c) => row[c]) as Parameters<DB["execute"]>[1],
          );
          copied++;
        }
      }
      await fresh.execute("COMMIT");
    } catch (err) {
      await fresh.execute("ROLLBACK");
      throw err;
    }
    return { imported: true, rows: copied };
  } finally {
    await legacy.close();
  }
}
