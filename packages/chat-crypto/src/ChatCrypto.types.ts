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

// ── M3.5: Signal Protocol types ──────────────────────────────────────────
// Native libsignal binding (PQXDH variant — includes Kyber post-quantum
// prekeys alongside classic X3DH). Implementation lands in chunk 1C; these
// types exist now so chunks 2-5 (schema, tRPC, signal-pipe, frame switch)
// can be drafted against a stable contract.

// Per-spec libsignal addressing. We bind `name` to Account.id (cuid) so the
// address is opaque and stable; `deviceId` is a uint32 the native module
// allocates per UserDevice row (libsignal needs numeric device ids; our
// UserDevice.deviceId is a UUID, so the native layer maintains a stable
// uuid→u32 map).
export interface SignalAddress {
  name: string;
  deviceId: number;
}

// uint32 random per install; persisted alongside the M3 identity seed.
// libsignal embeds this in PreKeySignalMessage so receivers can disambiguate
// devices that share an identity key (we never do, but the spec needs it).
export type SignalRegistrationId = number;

// Public-only material that gets uploaded to the server's prekey directory
// and consumed by senders starting a new session. byte fields arrive at JS
// as Uint8Array; wire format on tRPC is base64 (same convention as M3's
// user.keys.byUserIds).
export interface SignalPreKeyBundle {
  registrationId: SignalRegistrationId;
  deviceId: number;
  identityKey: Uint8Array;
  signedPreKeyId: number;
  signedPreKeyPublic: Uint8Array;
  signedPreKeySignature: Uint8Array;
  preKeyId: number;
  preKeyPublic: Uint8Array;
  kyberPreKeyId: number;
  kyberPreKeyPublic: Uint8Array;
  kyberPreKeySignature: Uint8Array;
}

// Result of signalCreateBundle — the local generation step before publishing
// to the server. The signed + kyber prekey go to the bundle directory; the
// one-time prekey batch becomes individual rows in OneTimePrekey.
export interface SignalLocalBundle {
  identityKey: Uint8Array;
  signedPreKey: {
    id: number;
    publicKey: Uint8Array;
    signature: Uint8Array;
  };
  oneTimePreKeys: Array<{ id: number; publicKey: Uint8Array }>;
  kyberPreKey: {
    id: number;
    publicKey: Uint8Array;
    signature: Uint8Array;
  };
}

// Output of signalEncrypt. `kind` drives the receiver's decrypt path —
// `pre-key` consumes the matching one-time + kyber prekey on the receiver
// side and establishes a fresh session; `whisper` rides an established
// session and only needs SessionStore + IdentityStore.
export interface SignalCiphertext {
  kind: "pre-key" | "whisper";
  serialized: Uint8Array;
}

// Signal protocol fixed-width fields. Used for length asserts at the JS
// boundary; the native side is the source of truth.
export const SIGNAL_IDENTITY_KEY_BYTES = 33; // 0x05 prefix + 32-byte Curve25519
export const SIGNAL_PREKEY_PUBLIC_BYTES = 33;
export const SIGNAL_SIGNATURE_BYTES = 64;
export const SIGNAL_KYBER_PUBLIC_BYTES = 1568; // ML-KEM-1024 / Kyber-1024
export const SIGNAL_KYBER_CIPHERTEXT_BYTES = 1568;

// Frame version negotiated per chat. M3 = 0x01 (libsodium box), M3.5 = 0x02
// (signal/PQXDH). The dual-decrypt path lives in packages/chat/src/
// crypto-pipe.ts via the `v` field on the plaintext frame.
export const SIGNAL_FRAME_VERSION = 0x02;
