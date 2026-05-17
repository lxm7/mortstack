import { ChatCrypto } from "@repo/chat-crypto";
import { trpc } from "@/lib/trpc/client";
import { getOrCreateChatIdentity, type ChatIdentity } from "./identity";

// Canonical bundle bytes the server re-verifies. Must match
// `canonicalBundleBytes` in services/api/src/routers/user.ts exactly.
// Format: 0x01 ‖ deviceId-utf8 ‖ ed25519Pub ‖ x25519Pub
const BUNDLE_VERSION = 0x01;

function canonicalBundleBytes(id: ChatIdentity): Uint8Array {
  const deviceIdBytes = new TextEncoder().encode(id.deviceId);
  const out = new Uint8Array(
    1 + deviceIdBytes.length + id.ed25519Pub.length + id.x25519Pub.length,
  );
  out[0] = BUNDLE_VERSION;
  out.set(deviceIdBytes, 1);
  out.set(id.ed25519Pub, 1 + deviceIdBytes.length);
  out.set(id.x25519Pub, 1 + deviceIdBytes.length + id.ed25519Pub.length);
  return out;
}

function toB64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i] ?? 0);
  }
  // RN provides global btoa via Hermes.
  return btoa(bin);
}

// Publishes this device's pubkeys to the server. Idempotent — server upsert
// on (accountId, deviceId). Caller is responsible for ensuring a Better Auth
// bearer session exists (trpc.client reads the token via loadSessionToken).
//
// MVP strategy: fire from _layout.tsx on every launch where identity + session
// are both ready. Cost ≈ one Lambda invocation per launch per device, server
// upsert is cheap. Add a `lastPublishedAt` short-circuit later if needed.
export async function publishMyChatDevice(): Promise<{
  deviceId: string;
  updatedAt: Date;
}> {
  const id = await getOrCreateChatIdentity();
  const bundle = canonicalBundleBytes(id);
  const signature = ChatCrypto.signDetached(bundle, id.seed);

  const row = await trpc.user.keys.publish.mutate({
    deviceId: id.deviceId,
    ed25519PubB64: toB64(id.ed25519Pub),
    x25519PubB64: toB64(id.x25519Pub),
    bundleSigB64: toB64(signature),
  });

  return { deviceId: row.deviceId, updatedAt: new Date(row.updatedAt) };
}
