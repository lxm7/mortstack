// Node MlsCryptoApi adapter — pairs Node's built-in webcrypto (digest +
// random) with @noble/ed25519 (sign). Structurally matches MlsCryptoApi in
// @repo/chat-mls-core/client.

import { webcrypto } from "node:crypto";
import * as ed25519 from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha2.js";

// @noble/ed25519 v2 doesn't bundle sha512 — install a sync provider via
// `etc.sha512Sync` so `sign()` works without going async.
ed25519.etc.sha512Sync = (...messages: Uint8Array[]) =>
  sha512(ed25519.etc.concatBytes(...messages));

export const nodeMlsCrypto = {
  digestSha256: async (bytes: Uint8Array): Promise<Uint8Array> => {
    const buf = await webcrypto.subtle.digest(
      "SHA-256",
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    );
    return new Uint8Array(buf);
  },
  getRandomBytes: (n: number): Uint8Array => {
    const out = new Uint8Array(n);
    webcrypto.getRandomValues(out);
    return out;
  },
  signEd25519Detached: (message: Uint8Array, seed: Uint8Array): Uint8Array => {
    // @noble/ed25519 sign takes the 32-byte seed (private key) — matches the
    // M3 identity_seed semantics in chat-crypto.
    return ed25519.sign(message, seed);
  },
};
