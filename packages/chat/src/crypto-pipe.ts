import { decode, encode } from "@msgpack/msgpack";
import { ChatCrypto } from "@repo/chat-crypto";

// Wire frame layout: byte 0 is the frame version, deciding the rest of the
// envelope's interpretation. README §M3 invariant #5 requires this byte so
// chats can negotiate per-message between v1 (libsodium box) and v2
// (MLS application message, ADR-015) without breaking already-sent history.
//
//   v=1: [0x01, ...sodium_box_easy_output]; outer `nonce` field carries the
//        crypto_box nonce (24B).
//   v=2: [0x02, ...mls_message_out]; outer `nonce` is empty (zero-length
//        Uint8Array). MLS embeds its own AEAD nonce inside the ciphertext.
//        One ciphertext per group (not per device) — server fans server-side.
export const FRAME_VERSION_V1 = 0x01;
export const FRAME_VERSION_V2 = 0x02;
export const FRAME_VERSION = FRAME_VERSION_V1;

// ── MLS abstraction ─────────────────────────────────────────────────────────
// Structural interface over the chat-mls-core native engine. Keeps this
// package free of native-module imports — callers (apps/mobile) inject a
// concrete impl that delegates to ChatMlsCore + the MlsClient SDK.
export interface MlsApi {
  encryptApp(groupId: Uint8Array, plaintext: Uint8Array): Uint8Array;
  processMessage(
    groupId: Uint8Array,
    bytes: Uint8Array,
  ):
    | { kind: "application"; plaintext: Uint8Array }
    | { kind: "commitApplied" }
    | { kind: "proposalQueued" };
}

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

// v=2 envelope — one per group, not per device. The server fans the single
// ciphertext to every chat member. recipientAccountId / recipientDeviceId are
// elided because the wire isn't per-recipient anymore; the chat's groupId
// identifies the recipient set.
export interface OutboundMlsEnvelope {
  frameVersion: 2;
  ciphertext: Uint8Array; // [0x02, ...mlsMessageOut]
  /** Always zero-length for v=2. Kept for symmetry with the WS send shape
   *  which carries both fields; the server validator accepts len=0 when
   *  ciphertext[0] === 0x02. */
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

// v=1 libsodium fan-out: one envelope per (recipient, device). Kept for
// 1:1 chats that haven't migrated to MLS — once a chat has a groupId the
// caller routes through encryptOutboundMls instead.
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

export interface EncryptOutboundMlsOpts {
  text: string;
  groupId: Uint8Array;
  mls: MlsApi;
  now?: number;
}

// v=2 MLS group-native send. One plaintext → one application message →
// one envelope. The plaintext frame inside the MLS application message is
// the same msgpack ChatFrame as v=1; only the outer crypto changes.
//
// Forward secrecy: after engine.encryptApp returns, the sender ratchets the
// generation key forward — even on the sender's own device the same plaintext
// can't be re-derived from the ciphertext. Snapshot persistence (handled by
// the caller, typically MlsClient.persistSnapshot) must run AFTER this call
// returns or a crash window can leak old generation keys.
export function encryptOutboundMls(
  opts: EncryptOutboundMlsOpts,
): OutboundMlsEnvelope {
  const ts = opts.now ?? Date.now();
  const frame: ChatFrame = { v: FRAME_VERSION_V2, text: opts.text, ts };
  const plaintext = encode(frame);
  const mlsBytes = opts.mls.encryptApp(opts.groupId, plaintext);
  // Prepend version byte so decryptInbound dispatches without needing the
  // chats.mls_group_id lookup before peeking.
  const wire = new Uint8Array(1 + mlsBytes.length);
  wire[0] = FRAME_VERSION_V2;
  wire.set(mlsBytes, 1);
  return {
    frameVersion: 2,
    ciphertext: wire,
    nonce: new Uint8Array(0),
  };
}

// ── decrypt ────────────────────────────────────────────────────────────────

export interface DecryptInboundOpts {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  senderAccountId: string;
  seed: Uint8Array;
  candidateSenderX25519Pubs: Uint8Array[];
  // v=2 path requires an MlsApi + the groupId for this chat. Resolved by the
  // caller via chats.mls_group_id; null/undefined for legacy v=1 1:1 chats.
  mls?: MlsApi;
  mlsGroupId?: Uint8Array | null;
}

export type DecryptInboundResult =
  | {
      frame: ChatFrame;
      frameVersion: 1;
      // Which X25519 pub decrypted. Lets caller cache device-pub hit.
      usedSenderX25519Pub: Uint8Array;
    }
  | {
      frame: ChatFrame;
      frameVersion: 2;
      // What the engine reports for the processed message. For decryptInbound
      // we only return when kind === "application"; commit/proposal frames
      // surface as non-application processed-kinds and the caller must
      // re-route them off the message path. Carried for diagnostics.
      processedKind: "application";
    };

export function decryptInbound(opts: DecryptInboundOpts): DecryptInboundResult {
  if (opts.ciphertext.length === 0) {
    throw new DecryptError("empty ciphertext");
  }
  const version = opts.ciphertext[0];

  if (version === FRAME_VERSION_V2) {
    if (!opts.mls || !opts.mlsGroupId) {
      throw new DecryptError(
        "v=2 ciphertext requires mls + mlsGroupId in DecryptInboundOpts",
      );
    }
    const mlsBytes = opts.ciphertext.subarray(1);
    const processed = opts.mls.processMessage(opts.mlsGroupId, mlsBytes);
    if (processed.kind !== "application") {
      // Commits/Proposals must NOT travel the message path (they go via
      // mls.groups.publishCommit). Surfaces a clear error if a peer routes
      // one through the wrong channel.
      throw new DecryptError(
        `v=2 frame processed as ${processed.kind}, expected application`,
      );
    }
    const frame = parseFrame(processed.plaintext, FRAME_VERSION_V2);
    return {
      frame,
      frameVersion: 2,
      processedKind: "application",
    };
  }

  if (version !== FRAME_VERSION_V1) {
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
