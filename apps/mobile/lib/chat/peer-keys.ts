import { getChatDb, peerKeys, type PeerDeviceInput } from "@repo/chat-db";
import { trpc } from "@/lib/trpc/client";

// Per README §M3 — 24h TTL on the local pubkey directory mirror. Long enough
// to cut noise on chat-heavy days, short enough to pick up key rotations
// within a day. Tunable; not exposed to callers yet.
const TTL_MS = 24 * 60 * 60 * 1000;

export interface PeerDevice {
  deviceId: string;
  ed25519Pub: Uint8Array;
  x25519Pub: Uint8Array;
  serverUpdatedAt: number;
}

export type PeerDeviceMap = Map<string, PeerDevice[]>;

function decodeB64(b64: string): Uint8Array {
  // RN/Hermes ships atob globally; result is a binary-string.
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// Fetches devices for a batch of peer accounts, using the local cache first
// and falling back to the server for any account that's missing or stale
// (older than TTL_MS). On server failure, falls back to whatever's cached —
// even if stale — to keep messaging working when offline / API is down.
//
// Caller responsibility: pass already-deduplicated accountIds. Empty input
// is a no-op.
export async function getPeerDevices(
  accountIds: string[],
): Promise<PeerDeviceMap> {
  const result: PeerDeviceMap = new Map();
  if (accountIds.length === 0) return result;

  const { db } = await getChatDb();
  const now = Date.now();
  const staleBefore = now - TTL_MS;

  const stale = await peerKeys.getStaleAccountIds(db, accountIds, staleBefore);

  if (stale.length > 0) {
    try {
      const serverBatch = await trpc.user.keys.byUserIds.query({
        accountIds: stale,
      });

      const toWrite = new Map<string, PeerDeviceInput[]>();
      for (const accountId of stale) {
        const devices = serverBatch[accountId] ?? [];
        toWrite.set(
          accountId,
          devices.map((d) => ({
            accountId,
            deviceId: d.deviceId,
            ed25519Pub: decodeB64(d.ed25519PubB64),
            x25519Pub: decodeB64(d.x25519PubB64),
            serverUpdatedAt: new Date(d.updatedAt).getTime(),
          })),
        );
      }
      await peerKeys.replaceForAccounts(db, toWrite, now);
    } catch (err) {
      console.warn(
        "[chat/peer-keys] byUserIds fetch failed, serving cached",
        err,
      );
    }
  }

  const rows = await peerKeys.getByAccountIds(db, accountIds);
  for (const accountId of accountIds) result.set(accountId, []);
  for (const r of rows) {
    const list = result.get(r.account_id);
    if (!list) continue;
    list.push({
      deviceId: r.device_id,
      ed25519Pub: r.ed25519_pub,
      x25519Pub: r.x25519_pub,
      serverUpdatedAt: r.server_updated_at,
    });
  }
  return result;
}

// Explicit invalidation — useful when a sender is told their message couldn't
// be decrypted by a peer or when the user manually triggers a directory
// refresh. Passing no arg wipes everything.
export async function invalidatePeerDevices(
  accountIds?: string[],
): Promise<void> {
  const { db } = await getChatDb();
  await peerKeys.clear(db, accountIds);
}
