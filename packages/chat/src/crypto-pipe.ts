import { decode, encode } from "@msgpack/msgpack";
import { ChatCrypto } from "@repo/chat-crypto";

// Wire frame layout: byte 0 is the frame version, deciding the rest of the
// envelope's interpretation. README §M3 invariant #5 requires this byte so
// chats can negotiate per-message between v1 (libsodium box) and v2
// (MLS application message, lands in Chunk 5 per ADR-015) without breaking
// already-sent history.
//
//   v=1: [0x01, ...sodium_box_easy_output]; `nonce` field carries the
//        crypto_box nonce.
//   v=2: reserved for MLS — not implemented in this branch. Decrypt of a v=2
//        frame throws FrameVersionError until Chunk 5 wires the MLS path.
export const FRAME_VERSION_V1 = 0x01;
export const FRAME_VERSION_V2 = 0x02;
export const FRAME_VERSION = FRAME_VERSION_V1;

// Plaintext payload, msgpack-encoded then sealed. `v` mirrors the wire
// version — caller doesn't need to set it; encryptOutbound writes whichever
// version it's emitting. The `ts` is the sender's local epoch-ms — purely
// informational, never trusted for ordering (server assigns serverMsgId
// which carries authoritative ts).
export interface ChatFrame {
  v: number;
  text: string;
  ts: number;
}

export interface RecipientDevice {
  deviceId: string;
  // Always present (every M3+ device publishes one). Used by the v=1 path.
  x25519Pub: Uint8Array;
}

export interface FanoutTarget {
  accountId: string;
  devices: RecipientDevice[];
}

export interface OutboundEnvelope {
  recipientAccountId: string;
  recipientDeviceId: string;
  frameVersion: 1;
  ciphertext: Uint8Array; // includes leading version byte
  nonce: Uint8Array;
}

export class FrameVersionError extends Error {
  constructor(public readonly got: unknown) {
    super(`Unsupported chat frame version: ${String(got)}`);
    this.name = "FrameVersionError";
  }
}

export class DecryptError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DecryptError";
  }
}

// ── encrypt ────────────────────────────────────────────────────────────────

export interface EncryptOutboundOpts {
  text: string;
  targets: FanoutTarget[];
  // Required for v=1 (libsodium box uses our X25519 secret).
  seed: Uint8Array;
  now?: number;
}

// Encrypts one plaintext into N envelopes — one per (recipient, device).
// v=1 libsodium path only; MLS group-native v=2 lands in Chunk 5 and will
// flip this signature to return a single envelope per group (not per device).
export function encryptOutbound(opts: EncryptOutboundOpts): OutboundEnvelope[] {
  const ts = opts.now ?? Date.now();
  const frame: ChatFrame = { v: FRAME_VERSION_V1, text: opts.text, ts };
  const plaintext = encode(frame);

  const out: OutboundEnvelope[] = [];
  for (const target of opts.targets) {
    for (const device of target.devices) {
      const sealed = ChatCrypto.box(plaintext, device.x25519Pub, opts.seed);
      // Prepend version byte so decryptInbound can dispatch without
      // peeking at the nonce field or trying both versions speculatively.
      const wire = new Uint8Array(1 + sealed.ciphertext.length);
      wire[0] = FRAME_VERSION_V1;
      wire.set(sealed.ciphertext, 1);
      out.push({
        recipientAccountId: target.accountId,
        recipientDeviceId: device.deviceId,
        frameVersion: 1,
        ciphertext: wire,
        nonce: sealed.nonce,
      });
    }
  }
  return out;
}

// ── decrypt ────────────────────────────────────────────────────────────────

export interface DecryptInboundOpts {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  senderAccountId: string;
  seed: Uint8Array;
  candidateSenderX25519Pubs: Uint8Array[];
}

export interface DecryptInboundResult {
  frame: ChatFrame;
  frameVersion: 1;
  // Which X25519 pub decrypted. Lets caller cache device-pub hit.
  usedSenderX25519Pub: Uint8Array;
}

export function decryptInbound(opts: DecryptInboundOpts): DecryptInboundResult {
  if (opts.ciphertext.length === 0) {
    throw new DecryptError("empty ciphertext");
  }
  const version = opts.ciphertext[0];
  if (version !== FRAME_VERSION_V1) {
    // v=2 = MLS, reserved. Chunk 5 swaps this branch in.
    throw new FrameVersionError(version);
  }

  const candidates = opts.candidateSenderX25519Pubs;
  if (candidates.length === 0) {
    throw new DecryptError(
      "no candidate sender X25519 pubs supplied — peer directory empty?",
    );
  }
  // Strip leading version byte; the rest is libsodium ciphertext.
  const cipher = opts.ciphertext.subarray(1);

  for (const candidate of candidates) {
    let plaintext: Uint8Array;
    try {
      plaintext = ChatCrypto.boxOpen(cipher, opts.nonce, candidate, opts.seed);
    } catch {
      continue;
    }
    const frame = parseFrame(plaintext, FRAME_VERSION_V1);
    return {
      frame,
      frameVersion: 1,
      usedSenderX25519Pub: candidate,
    };
  }
  throw new DecryptError(
    `none of ${candidates.length} candidate keys decrypted the v=1 ciphertext`,
  );
}

function parseFrame(plaintext: Uint8Array, expectedV: number): ChatFrame {
  let decoded: unknown;
  try {
    decoded = decode(plaintext);
  } catch (err) {
    throw new DecryptError(
      `msgpack decode failed after successful crypto open: ${String(err)}`,
    );
  }
  if (
    typeof decoded !== "object" ||
    decoded === null ||
    !("v" in decoded) ||
    !("text" in decoded) ||
    !("ts" in decoded)
  ) {
    throw new DecryptError("decrypted payload missing required frame fields");
  }
  const f = decoded as Record<string, unknown>;
  if (f.v !== expectedV) {
    throw new DecryptError(
      `plaintext frame.v=${String(f.v)} disagrees with wire version=${expectedV}`,
    );
  }
  if (typeof f.text !== "string" || typeof f.ts !== "number") {
    throw new DecryptError("frame field types mismatch");
  }
  return { v: expectedV, text: f.text, ts: f.ts };
}
