// Wire-frame validators for inbound `send` envelopes. Pure functions — no
// I/O, no DO references — so they can be unit-tested without spinning up a
// Worker. Called from UserInbox.handleSend before forwarding to Chat DO.
//
// Frame versions (first byte of ciphertext):
//   v=1 (0x01) — libsodium box; nonce must be 24B; ciphertext >= 17B.
//   v=2 (0x02) — MLS application message (ADR-015 + Chunk 6). MLS embeds
//                its own AEAD nonce inside the bytes, so outer nonce MUST
//                be zero-length. ciphertext >= 2B (version byte + at least
//                one MLS byte). Server stays content-blind beyond length.
//   unencrypted: true — bypasses BOTH version checks. Plaintext group msgs
//                pre-M3.5; will be retired after the v=2 rollout completes.

export const NONCE_BYTES = 24;
export const BOX_MAC_BYTES = 16;
export const MIN_CIPHERTEXT_BYTES = BOX_MAC_BYTES + 1;
export const FRAME_VERSION_V1 = 0x01;
export const FRAME_VERSION_V2 = 0x02;
/** v=2 minimum: 1 version byte + at least 1 MLS byte. */
export const MIN_MLS_CIPHERTEXT_BYTES = 2;

export interface SendShape {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  unencrypted?: boolean;
}

export type ValidateResult = { ok: true } | { ok: false; reason: string };

export function validateSendFrame(frame: SendShape): ValidateResult {
  if (frame.unencrypted === true) {
    // Plaintext group msg — pre-M3.5 legacy. Server stays content-blind.
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
  if (!(frame.ciphertext instanceof Uint8Array)) {
    return { ok: false, reason: "ciphertext must be Uint8Array" };
  }
  if (frame.ciphertext.byteLength === 0) {
    return { ok: false, reason: "ciphertext empty (no version byte)" };
  }

  const version = frame.ciphertext[0];

  if (version === FRAME_VERSION_V2) {
    // MLS application message — outer nonce MUST be zero-length (MLS carries
    // its own AEAD nonce inside the bytes).
    if (frame.nonce.byteLength !== 0) {
      return {
        ok: false,
        reason: `v=2 nonce must be 0 bytes, got ${frame.nonce.byteLength}`,
      };
    }
    if (frame.ciphertext.byteLength < MIN_MLS_CIPHERTEXT_BYTES) {
      return {
        ok: false,
        reason: `v=2 ciphertext must be at least ${MIN_MLS_CIPHERTEXT_BYTES} bytes, got ${frame.ciphertext.byteLength}`,
      };
    }
    return { ok: true };
  }

  if (version === FRAME_VERSION_V1) {
    if (frame.nonce.byteLength !== NONCE_BYTES) {
      return {
        ok: false,
        reason: `v=1 nonce must be ${NONCE_BYTES} bytes, got ${frame.nonce.byteLength}`,
      };
    }
    if (frame.ciphertext.byteLength < MIN_CIPHERTEXT_BYTES) {
      return {
        ok: false,
        reason: `v=1 ciphertext must be at least ${MIN_CIPHERTEXT_BYTES} bytes (MAC + 1), got ${frame.ciphertext.byteLength}`,
      };
    }
    return { ok: true };
  }

  return {
    ok: false,
    reason: `unknown frame version byte: 0x${(version ?? 0).toString(16).padStart(2, "0")}`,
  };
}

// --- Backfill request (`bf`) ------------------------------------------------
//
// One `bf` frame batches every subscribed chat's cursor. Validate shape before
// UserInbox.handleBackfill touches KV / Neon: cursors bind straight into the
// `serverSerial > $2` bigint predicate in messagesSince, so a non-numeric
// `after` must be rejected here rather than blowing up the DB.

/** Cap the batch so one frame can't fan into an unbounded KV/Neon sweep. */
export const MAX_BACKFILL_CHATS = 500;
/** Cursors are decimal serverSerial strings ("0" = full history). */
const SERIAL_CURSOR = /^\d+$/;

export interface BackfillShape {
  chats: Array<{ chatId: string; after: string; force?: boolean }>;
}

export function validateBackfillFrame(frame: {
  chats?: unknown;
}): ValidateResult {
  if (!Array.isArray(frame.chats)) {
    return { ok: false, reason: "chats must be an array" };
  }
  if (frame.chats.length === 0) {
    return { ok: false, reason: "chats empty" };
  }
  if (frame.chats.length > MAX_BACKFILL_CHATS) {
    return {
      ok: false,
      reason: `chats exceeds max ${MAX_BACKFILL_CHATS}, got ${frame.chats.length}`,
    };
  }
  for (const entry of frame.chats) {
    if (typeof entry !== "object" || entry === null) {
      return { ok: false, reason: "chat entry must be an object" };
    }
    const c = entry as Record<string, unknown>;
    if (typeof c.chatId !== "string" || c.chatId.length === 0) {
      return { ok: false, reason: "chatId must be a non-empty string" };
    }
    if (typeof c.after !== "string" || !SERIAL_CURSOR.test(c.after)) {
      return { ok: false, reason: "after must be a decimal cursor string" };
    }
    if (c.force !== undefined && typeof c.force !== "boolean") {
      return { ok: false, reason: "force must be a boolean when present" };
    }
  }
  return { ok: true };
}
