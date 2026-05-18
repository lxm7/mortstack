import { decode, encode } from "@msgpack/msgpack";
import { ChatCrypto } from "@repo/chat-crypto";

// Frame version byte — README §M3 invariant #5 requires every crypto frame
// carry a `v` byte so M3 → M3.5 (Signal) upgrades can negotiate per-chat
// without breaking already-sent history. Bump only on a wire-incompatible
// change to the plaintext schema below.
export const FRAME_VERSION = 0x01;

// Plaintext payload, msgpack-encoded then sealed with crypto_box. The
// `ts` is the sender's local epoch-ms — purely informational, never trusted
// for ordering (server assigns serverMsgId which carries authoritative ts).
export interface ChatFrame {
  v: number;
  text: string;
  ts: number;
}

export interface RecipientDevice {
  deviceId: string;
  x25519Pub: Uint8Array;
}

export interface FanoutTarget {
  accountId: string;
  devices: RecipientDevice[];
}

export interface OutboundEnvelope {
  recipientAccountId: string;
  recipientDeviceId: string;
  ciphertext: Uint8Array;
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

// Encrypts one plaintext text into N envelopes — one per (recipient, device).
// Caller hands each envelope to chat-transport.send(); server stores them as
// independent partitioned ChatMessage rows.
//
// Empty `targets` returns []. Targets with zero devices are skipped silently
// (peer has cleared identity / not yet published) — caller decides whether
// to surface that as a UI warning.
export function encryptOutbound(opts: {
  text: string;
  seed: Uint8Array;
  targets: FanoutTarget[];
  now?: number;
}): OutboundEnvelope[] {
  const ts = opts.now ?? Date.now();
  const frame: ChatFrame = { v: FRAME_VERSION, text: opts.text, ts };
  const plaintext = encode(frame);

  const out: OutboundEnvelope[] = [];
  for (const target of opts.targets) {
    for (const device of target.devices) {
      const sealed = ChatCrypto.box(plaintext, device.x25519Pub, opts.seed);
      out.push({
        recipientAccountId: target.accountId,
        recipientDeviceId: device.deviceId,
        ciphertext: sealed.ciphertext,
        nonce: sealed.nonce,
      });
    }
  }
  return out;
}

// Decrypts one inbound ciphertext using the receiver's seed. The on-wire
// envelope only carries senderAccountId (not senderDeviceId), so the caller
// supplies an ordered list of candidate X25519 pubs (the sender's known
// devices, most-recent-first) and we try each until one MACs cleanly.
//
// Cost is bounded by the sender's device count — usually ≤3. Returns the
// pub that worked alongside the frame so callers can cache the device→pub
// hit for the next message in the same chat without re-trying.
//
// Throws FrameVersionError if the decoded frame is from a future protocol
// version (forward-compat hook for M3.5); DecryptError if no candidate key
// produces a valid plaintext.
export function decryptInbound(opts: {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  seed: Uint8Array;
  candidateSenderX25519Pubs: Uint8Array[];
}): { frame: ChatFrame; usedSenderX25519Pub: Uint8Array } {
  if (opts.candidateSenderX25519Pubs.length === 0) {
    throw new DecryptError(
      "no candidate sender X25519 pubs supplied — peer directory empty?",
    );
  }

  for (const candidate of opts.candidateSenderX25519Pubs) {
    let plaintext: Uint8Array;
    try {
      plaintext = ChatCrypto.boxOpen(
        opts.ciphertext,
        opts.nonce,
        candidate,
        opts.seed,
      );
    } catch {
      // Wrong key — try next candidate.
      continue;
    }

    let decoded: unknown;
    try {
      decoded = decode(plaintext);
    } catch (err) {
      throw new DecryptError(
        `msgpack decode failed after successful box_open: ${String(err)}`,
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
    const frame = decoded as Record<string, unknown>;
    if (frame.v !== FRAME_VERSION) throw new FrameVersionError(frame.v);
    if (typeof frame.text !== "string" || typeof frame.ts !== "number") {
      throw new DecryptError("frame field types mismatch");
    }
    return {
      frame: { v: FRAME_VERSION, text: frame.text, ts: frame.ts },
      usedSenderX25519Pub: candidate,
    };
  }

  throw new DecryptError(
    `none of ${opts.candidateSenderX25519Pubs.length} candidate keys decrypted the ciphertext`,
  );
}
