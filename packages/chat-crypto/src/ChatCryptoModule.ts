import { NativeModule, requireNativeModule } from "expo";

import type {
  BoxResult,
  ChatCryptoModuleEvents,
  DerivedPublicKeys,
  SignalAddress,
  SignalCiphertext,
  SignalLocalBundle,
  SignalPreKeyBundle,
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

  // ── M3.5: Signal Protocol (PQXDH) ────────────────────────────────────
  // Wraps libsignal (PQXDH variant — Kyber post-quantum prekeys alongside
  // X3DH). Native impl lives in SignalEngine.swift / .kt; the 5 protocol
  // stores (Session/Identity/PreKey/SignedPreKey/KyberPreKey) persist into
  // a libsodium-AEAD-wrapped SQLite file outside the M2 chat-db.

  // Random uint32 for libsignal addressing. Caller persists alongside the
  // identity seed so it survives only if the seed does (a re-install gets a
  // new registration id, which is the desired Signal behavior). Range is
  // [0, 0x3FFF] — libsignal's signed registration-id field is 14 bits.
  signalGenerateRegistrationId(): number;

  // One-shot setup. Derives the libsignal identity keypair from the M3 seed
  // (BLAKE2b sub-seed under context "sessions/signal-identity/v1"), persists
  // local address + registrationId + identity keypair in the protocol store,
  // generates + persists the signed prekey, one-time prekeys, and kyber
  // prekey, and returns the public-only bundle for the caller to publish to
  // the server prekey directory.
  //
  // Must be called once per install before any encrypt/decrypt call — those
  // throw `signal engine not initialized` until this runs.
  //
  // localName + localDeviceId form our own ProtocolAddress, used as the
  // sender side on every signalEncrypt / signalDecryptPreKey call.
  signalCreateBundle(
    localName: string,
    localDeviceId: number,
    registrationId: number,
    signedPreKeyId: number,
    oneTimePreKeyIdBase: number,
    oneTimePreKeyCount: number,
    kyberPreKeyId: number,
  ): SignalLocalBundle;

  // Bootstraps an outbound session against a peer's published bundle. Server
  // should have atomically removed the consumed one-time prekey before
  // returning the bundle — caller is responsible for not double-consuming.
  signalProcessPreKeyBundle(
    address: SignalAddress,
    bundle: SignalPreKeyBundle,
  ): void;

  // Encrypts plaintext for the addressed recipient (specific peer device).
  // Auto-routes ciphertext kind: first message in a new session emits
  // `pre-key`; subsequent emit `whisper`. Mirrors libsignal's signalEncrypt.
  signalEncrypt(
    address: SignalAddress,
    plaintext: Uint8Array,
  ): SignalCiphertext;

  // Decrypts a ciphertext from the addressed sender. The `kind` discriminator
  // selects the underlying libsignal call (signalDecryptPreKey vs
  // signalDecrypt). Throws on MAC failure, missing session for `whisper`,
  // or exhausted one-time prekey for `pre-key`.
  signalDecrypt(
    address: SignalAddress,
    ciphertext: SignalCiphertext,
  ): Uint8Array;

  // Cheap session-state lookups for the encrypted-transport wrapper to pick
  // v1 vs v2 frames per send, and for the prekey top-up worker to know when
  // to refill the one-time-prekey batch.
  signalHasSession(address: SignalAddress): boolean;
  signalDeleteSession(address: SignalAddress): void;
  signalRemainingOneTimePreKeys(): number;
}

export default requireNativeModule<ChatCryptoModule>("ChatCrypto");
