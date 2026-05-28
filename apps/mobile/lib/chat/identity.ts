import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import {
  ChatCrypto,
  ED25519_PUBLIC_KEY_BYTES,
  SEED_BYTES,
  X25519_PUBLIC_KEY_BYTES,
} from "@repo/chat-crypto";

export type IdentitySource = "loaded" | "generated";

export interface ChatIdentity {
  seed: Uint8Array;
  ed25519Pub: Uint8Array;
  x25519Pub: Uint8Array;
  deviceId: string;
  source: IdentitySource;
}

// deviceId is a public, non-secret identifier (appears in DB rows and on the
// wire), so it lives in expo-secure-store with the app's default access group
// — NOT the shared `io.sessions.chat` group used for the seed. Sensitivity
// class matches storage class.
const DEVICE_ID_ALIAS = "chat-device-id-v1";

async function getOrCreateDeviceId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_ID_ALIAS, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
  if (existing) return existing;
  const fresh = Crypto.randomUUID();
  await SecureStore.setItemAsync(DEVICE_ID_ALIAS, fresh, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
  return fresh;
}

// Module-level singleton Promise so concurrent callers at boot (auth, db,
// transport) all share one keychain read + at most one seed generation.
// Replaced atomically by clearChatIdentity() so the next caller re-resolves.
let cached: Promise<ChatIdentity> | null = null;

export function getOrCreateChatIdentity(): Promise<ChatIdentity> {
  if (cached) return cached;
  cached = resolve();
  cached.catch(() => {
    cached = null;
  });
  return cached;
}

export const getChatIdentity = getOrCreateChatIdentity;

export async function clearChatIdentity(): Promise<boolean> {
  cached = null;
  await SecureStore.deleteItemAsync(DEVICE_ID_ALIAS);
  return ChatCrypto.clearSeed();
}

async function resolve(): Promise<ChatIdentity> {
  const deviceId = await getOrCreateDeviceId();

  const existing = ChatCrypto.loadSeed();
  if (existing) {
    assertLength(existing, SEED_BYTES, "loaded seed");
    return deriveAndPack(existing, deviceId, "loaded");
  }

  const fresh = ChatCrypto.generateIdentitySeed();
  assertLength(fresh, SEED_BYTES, "generated seed");
  ChatCrypto.saveSeed(fresh);
  return deriveAndPack(fresh, deviceId, "generated");
}

function deriveAndPack(
  seed: Uint8Array,
  deviceId: string,
  source: IdentitySource,
): ChatIdentity {
  const keys = ChatCrypto.derivePublicKeys(seed);
  assertLength(keys.ed25519Pub, ED25519_PUBLIC_KEY_BYTES, "ed25519Pub");
  assertLength(keys.x25519Pub, X25519_PUBLIC_KEY_BYTES, "x25519Pub");
  return {
    seed,
    ed25519Pub: keys.ed25519Pub,
    x25519Pub: keys.x25519Pub,
    deviceId,
    source,
  };
}

function assertLength(bytes: Uint8Array, expected: number, name: string): void {
  if (bytes.length !== expected) {
    throw new Error(
      `[chat/identity] ${name} length mismatch: expected ${expected}, got ${bytes.length}`,
    );
  }
}
