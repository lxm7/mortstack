import { NativeModule, requireNativeModule } from "expo";

import type {
  BoxResult,
  ChatCryptoModuleEvents,
  DerivedPublicKeys,
} from "./ChatCrypto.types";

declare class ChatCryptoModule extends NativeModule<ChatCryptoModuleEvents> {
  // Returns 32 random bytes from the platform CSPRNG (libsodium randombytes).
  // This is the master identity seed — store it in the secure keychain group.
  generateIdentitySeed(): Uint8Array;

  // Deterministically derives the Ed25519 (sign) and X25519 (encrypt) public
  // keys from the master seed. Safe to call on every app launch; private
  // material is re-derived inside native code and never crosses the bridge.
  derivePublicKeys(seed: Uint8Array): DerivedPublicKeys;

  // Authenticated public-key encryption (crypto_box_easy). Produces
  // ciphertext + the random 24-byte nonce used. Both are stored opaquely by
  // the transport layer.
  box(
    plaintext: Uint8Array,
    peerX25519Pub: Uint8Array,
    seed: Uint8Array,
  ): BoxResult;

  // Decrypts ciphertext produced by `box`. Throws on MAC failure / wrong key.
  boxOpen(
    ciphertext: Uint8Array,
    nonce: Uint8Array,
    peerX25519Pub: Uint8Array,
    seed: Uint8Array,
  ): Uint8Array;

  // Detached Ed25519 signature over `message`. Used to self-sign published key
  // bundles so the server can validate publishes without ever holding privkey.
  signDetached(message: Uint8Array, seed: Uint8Array): Uint8Array;

  // Verifies a detached Ed25519 signature.
  verifyDetached(
    message: Uint8Array,
    signature: Uint8Array,
    peerEd25519Pub: Uint8Array,
  ): boolean;

  // Random 24-byte XSalsa20 nonce. Exposed for callers that need a nonce
  // ahead of time (e.g. content-key envelopes in M5 media).
  randomNonce(): Uint8Array;

  // Persist the 32-byte identity seed to platform secure storage.
  // iOS: Keychain item in the `io.sessions.chat` shared access group,
  //   AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY, service `chat-identity-seed-v1`.
  //   Readable by the M7 Notification Service Extension without re-prompt.
  // Android: AES/GCM wrapped with an AndroidKeystore-bound 256-bit key,
  //   ciphertext in app-private SharedPreferences (`io.sessions.chat.identity`).
  // Overwrites any existing seed at the same alias.
  saveSeed(seed: Uint8Array): void;

  // Returns the persisted seed, or `null` if no seed has been stored on this
  // device yet (fresh install / after `clearSeed`). Throws on storage errors
  // (e.g. keychain corruption, GCM auth failure) — those are not silently
  // recoverable since identity would be rotated.
  loadSeed(): Uint8Array | null;

  // Removes the persisted seed and the wrapping Keystore/Keychain entry.
  // Returns `true` if an entry existed and was removed, `false` if there was
  // nothing to remove. Intended for debug screens and test resets — calling
  // this on a real install destroys the device identity.
  clearSeed(): boolean;
}

export default requireNativeModule<ChatCryptoModule>("ChatCrypto");
