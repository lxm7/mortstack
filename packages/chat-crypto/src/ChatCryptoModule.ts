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
}

export default requireNativeModule<ChatCryptoModule>("ChatCrypto");
