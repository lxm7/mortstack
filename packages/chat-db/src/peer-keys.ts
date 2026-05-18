import type { DB } from "@op-engineering/op-sqlite";
import type { PeerDeviceRow } from "./schema";

export interface PeerDeviceInput {
  accountId: string;
  deviceId: string;
  ed25519Pub: Uint8Array;
  x25519Pub: Uint8Array;
  serverUpdatedAt: number;
}

// op-sqlite returns BLOB columns as ArrayBuffer (which has byteLength but no
// length). Wrap in Uint8Array so callers get the type the schema advertises.
function toBytes(v: unknown): Uint8Array {
  if (v instanceof Uint8Array) return v;
  if (v instanceof ArrayBuffer) return new Uint8Array(v);
  // Some platforms surface BLOBs as ArrayBuffer-like objects with .buffer.
  if (
    typeof v === "object" &&
    v !== null &&
    "buffer" in v &&
    (v as { buffer: unknown }).buffer instanceof ArrayBuffer
  ) {
    return new Uint8Array((v as { buffer: ArrayBuffer }).buffer);
  }
  throw new Error(
    `chat-db.peer_keys: BLOB column has unexpected type ${typeof v}`,
  );
}

// Fetch every cached row for the given account IDs in a single query.
// Empty input returns an empty array without touching the DB.
export async function getByAccountIds(
  db: DB,
  accountIds: string[],
): Promise<PeerDeviceRow[]> {
  if (accountIds.length === 0) return [];
  const placeholders = accountIds.map(() => "?").join(",");
  const result = await db.execute(
    `SELECT account_id, device_id, ed25519_pub, x25519_pub, refreshed_at, server_updated_at
       FROM peer_keys
      WHERE account_id IN (${placeholders})`,
    accountIds,
  );
  const raw = (result.rows ?? []) as unknown as Array<{
    account_id: string;
    device_id: string;
    ed25519_pub: unknown;
    x25519_pub: unknown;
    refreshed_at: number;
    server_updated_at: number;
  }>;
  return raw.map((r) => ({
    account_id: r.account_id,
    device_id: r.device_id,
    ed25519_pub: toBytes(r.ed25519_pub),
    x25519_pub: toBytes(r.x25519_pub),
    refreshed_at: r.refreshed_at,
    server_updated_at: r.server_updated_at,
  }));
}

// Returns the subset of accountIds whose cache is stale or absent. An account
// is stale if it has no cached rows OR the freshest row was refreshed before
// `staleBefore`. Used to minimise byUserIds traffic — callers pass only the
// stale subset to the server, then merge results with the still-fresh cache.
export async function getStaleAccountIds(
  db: DB,
  accountIds: string[],
  staleBefore: number,
): Promise<string[]> {
  if (accountIds.length === 0) return [];
  const placeholders = accountIds.map(() => "?").join(",");
  const result = await db.execute(
    `SELECT account_id, MAX(refreshed_at) AS max_refreshed
       FROM peer_keys
      WHERE account_id IN (${placeholders})
      GROUP BY account_id`,
    accountIds,
  );
  const seen = new Map<string, number>();
  for (const r of (result.rows ?? []) as unknown as Array<{
    account_id: string;
    max_refreshed: number;
  }>) {
    seen.set(r.account_id, r.max_refreshed);
  }
  const stale: string[] = [];
  for (const id of accountIds) {
    const refreshed = seen.get(id);
    if (refreshed === undefined || refreshed < staleBefore) stale.push(id);
  }
  return stale;
}

// Replace the cache for one or more accounts atomically. For each account in
// `byAccount`, deletes any existing rows then inserts the provided devices,
// stamping refreshed_at = `refreshedAt`. An empty array for an account is a
// valid signal that the peer has no devices (e.g. cleared identity) — the
// cache becomes empty for that account, not unchanged.
export async function replaceForAccounts(
  db: DB,
  byAccount: Map<string, PeerDeviceInput[]>,
  refreshedAt: number = Date.now(),
): Promise<void> {
  if (byAccount.size === 0) return;
  await db.execute("BEGIN");
  try {
    for (const [accountId, devices] of byAccount) {
      await db.execute("DELETE FROM peer_keys WHERE account_id = ?", [
        accountId,
      ]);
      for (const d of devices) {
        await db.execute(
          `INSERT INTO peer_keys
             (account_id, device_id, ed25519_pub, x25519_pub, refreshed_at, server_updated_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            accountId,
            d.deviceId,
            d.ed25519Pub,
            d.x25519Pub,
            refreshedAt,
            d.serverUpdatedAt,
          ],
        );
      }
    }
    await db.execute("COMMIT");
  } catch (err) {
    await db.execute("ROLLBACK");
    throw err;
  }
}

// Wipe entries for specific accounts (or all when `accountIds` is omitted).
// Useful for explicit invalidation and test cleanup.
export async function clear(db: DB, accountIds?: string[]): Promise<void> {
  if (!accountIds) {
    await db.execute("DELETE FROM peer_keys");
    return;
  }
  if (accountIds.length === 0) return;
  const placeholders = accountIds.map(() => "?").join(",");
  await db.execute(
    `DELETE FROM peer_keys WHERE account_id IN (${placeholders})`,
    accountIds,
  );
}
