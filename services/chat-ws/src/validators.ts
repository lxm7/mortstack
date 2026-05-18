// Wire-frame validators for inbound `send` envelopes. Pure functions — no
// I/O, no DO references — so they can be unit-tested without spinning up a
// Worker. Called from UserInbox.handleSend before forwarding to Chat DO.
//
// Per README §M3 chunk 7:
//   - len(nonce) == 24       (XSalsa20 nonce = 24 bytes)
//   - len(ciphertext) >= 17  (crypto_box MAC = 16 + at least 1 byte plaintext)
//   - `unencrypted: true` bypasses BOTH length checks — see envelope.ts for
//     when callers may set the flag (group sends only, pre-M3.5).

export const NONCE_BYTES = 24;
export const BOX_MAC_BYTES = 16;
export const MIN_CIPHERTEXT_BYTES = BOX_MAC_BYTES + 1;

export interface SendShape {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  unencrypted?: boolean;
}

export type ValidateResult = { ok: true } | { ok: false; reason: string };

export function validateSendFrame(frame: SendShape): ValidateResult {
  if (frame.unencrypted === true) {
    // Plaintext group msg until M3.5. The byte arrays may be any length —
    // server is content-blind. Empty allowed (treated as empty group msg).
    if (!(frame.ciphertext instanceof Uint8Array)) {
      return { ok: false, reason: "ciphertext must be Uint8Array" };
    }
    if (!(frame.nonce instanceof Uint8Array)) {
      return { ok: false, reason: "nonce must be Uint8Array" };
    }
    return { ok: true };
  }

  if (!(frame.nonce instanceof Uint8Array)) {
    return { ok: false, reason: "nonce must be Uint8Array" };
  }
  if (frame.nonce.byteLength !== NONCE_BYTES) {
    return {
      ok: false,
      reason: `nonce must be ${NONCE_BYTES} bytes, got ${frame.nonce.byteLength}`,
    };
  }

  if (!(frame.ciphertext instanceof Uint8Array)) {
    return { ok: false, reason: "ciphertext must be Uint8Array" };
  }
  if (frame.ciphertext.byteLength < MIN_CIPHERTEXT_BYTES) {
    return {
      ok: false,
      reason: `ciphertext must be at least ${MIN_CIPHERTEXT_BYTES} bytes (MAC + 1), got ${frame.ciphertext.byteLength}`,
    };
  }

  return { ok: true };
}
