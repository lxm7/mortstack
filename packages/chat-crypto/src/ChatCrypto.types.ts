export type ChatCryptoModuleEvents = Record<string, never>;

// All byte arrays cross the JSI bridge as Uint8Array. Length invariants are
// enforced on the native side and re-asserted here in dev mode.

export const SEED_BYTES = 32;
export const ED25519_PUBLIC_KEY_BYTES = 32;
export const X25519_PUBLIC_KEY_BYTES = 32;
export const NONCE_BYTES = 24;
export const ED25519_SIGNATURE_BYTES = 64;
export const BOX_MAC_BYTES = 16;

export interface DerivedPublicKeys {
  ed25519Pub: Uint8Array;
  x25519Pub: Uint8Array;
}

export interface BoxResult {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
}
