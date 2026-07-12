// Node MlsCryptoApi adapter — the three primitives MlsClient needs out of band
// of the MLS engine. Mirrors packages/chat-mls-core/test/lib/node-crypto.ts,
// but installs the ed25519 sha512 sync provider via node:crypto so this file
// carries no @noble/hashes dependency.

import { createHash, generateKeyPairSync, webcrypto } from "node:crypto";
import * as ed25519 from "@noble/ed25519";

// @noble/ed25519 v2 doesn't bundle sha512 — provide a sync implementation so
// `sign()` works without going async. node:crypto's sha512 is exact-parity
// with the @noble/hashes provider the test harness uses.
ed25519.etc.sha512Sync = (...messages: Uint8Array[]) =>
  new Uint8Array(
    createHash("sha512")
      .update(Buffer.from(ed25519.etc.concatBytes(...messages)))
      .digest(),
  );

export const nodeMlsCrypto = {
  digestSha256: async (bytes: Uint8Array): Promise<Uint8Array> => {
    // A Uint8Array is a valid BufferSource (ArrayBufferView); digest hashes
    // exactly the view's range, so no manual slice is needed.
    const buf = await webcrypto.subtle.digest("SHA-256", bytes);
    return new Uint8Array(buf);
  },
  getRandomBytes: (n: number): Uint8Array => {
    const out = new Uint8Array(n);
    webcrypto.getRandomValues(out);
    return out;
  },
  signEd25519Detached: (message: Uint8Array, seed: Uint8Array): Uint8Array =>
    // @noble/ed25519 sign takes the 32-byte seed (private key) — matches the
    // M3 identity_seed semantics used by chat-crypto on device.
    ed25519.sign(message, seed),
};

// The Ed25519 public half of the identity seed — the device bundle's signing
// key. Sync because crypto.ts installs the sha512Sync provider above.
export function ed25519PubFromSeed(seed: Uint8Array): Uint8Array {
  return ed25519.getPublicKey(seed);
}

// A fresh raw (32-byte) X25519 public key. The device bundle format carries an
// x25519 pub for the v=1 pairwise path; the bot only ever speaks v=2 (MLS), so
// the private half is discarded — this key exists solely to satisfy the bundle
// shape the server stores. Generated once and persisted so re-registration is
// idempotent on the same key.
export function newX25519PubRaw(): Uint8Array {
  const { publicKey } = generateKeyPairSync("x25519");
  // SPKI DER for X25519 is a fixed 44-byte structure ending in the 32-byte key.
  const der = publicKey.export({ type: "spki", format: "der" });
  return new Uint8Array(der.subarray(der.length - 32));
}
