import { describe, expect, it, vi } from "vitest";
import { encode } from "@msgpack/msgpack";

// chat-crypto calls requireNativeModule() at import, which throws in Node. Stub
// it so importing crypto-pipe works — these tests use the v=2 (MLS) path with a
// passthrough engine and never touch ChatCrypto.box. vi.mock is hoisted above
// the import below by vitest, so the stub is in place before crypto-pipe loads.
vi.mock("@repo/chat-crypto", () => ({
  ChatCrypto: { box: vi.fn(), boxOpen: vi.fn() },
}));

import {
  DecryptError,
  FRAME_VERSION_V2,
  decryptInbound,
  encryptOutboundMls,
  isReactionFrame,
  type MlsApi,
} from "./crypto-pipe";

// Passthrough MLS engine: encrypt returns plaintext unchanged, processMessage
// returns it as an application message. Round-trips buildFrame→parseFrame
// through the real v=2 code path with zero native crypto.
const fakeMls: MlsApi = {
  encryptApp: (_g, plaintext) => plaintext,
  processMessage: (_g, bytes) => ({ kind: "application", plaintext: bytes }),
};
const GID = new Uint8Array([1, 2, 3, 4]);

function decrypt(ciphertext: Uint8Array) {
  return decryptInbound({
    ciphertext,
    nonce: new Uint8Array(0),
    senderAccountId: "acct",
    seed: new Uint8Array(0),
    candidateSenderX25519Pubs: [],
    mls: fakeMls,
    mlsGroupId: GID,
  });
}

// A raw v=2 wire frame from an arbitrary plaintext object (bypasses the encoder
// so we can craft legacy / malformed shapes the encoder wouldn't produce).
function wire(obj: unknown): Uint8Array {
  const body = encode(obj);
  const out = new Uint8Array(1 + body.length);
  out[0] = FRAME_VERSION_V2;
  out.set(body, 1);
  return out;
}

describe("ContentFrame codec (v=2 passthrough)", () => {
  it("round-trips a message frame (kind omitted on the wire)", () => {
    const env = encryptOutboundMls({
      body: { text: "hello" },
      groupId: GID,
      mls: fakeMls,
    });
    const { frame } = decrypt(env.ciphertext);
    expect(isReactionFrame(frame)).toBe(false);
    if (isReactionFrame(frame)) throw new Error("unreachable");
    expect(frame.text).toBe("hello");
    expect(frame.kind).toBeUndefined();
  });

  it("round-trips a reaction frame", () => {
    const env = encryptOutboundMls({
      body: { kind: "rx", target: "42", emoji: "👍", op: "add" },
      groupId: GID,
      mls: fakeMls,
    });
    const { frame } = decrypt(env.ciphertext);
    expect(isReactionFrame(frame)).toBe(true);
    if (!isReactionFrame(frame)) throw new Error("unreachable");
    expect(frame.target).toBe("42");
    expect(frame.emoji).toBe("👍");
    expect(frame.op).toBe("add");
  });

  it("treats a legacy frame with no `kind` as a message", () => {
    const { frame } = decrypt(
      wire({ v: FRAME_VERSION_V2, text: "legacy", ts: 123 }),
    );
    expect(isReactionFrame(frame)).toBe(false);
    if (isReactionFrame(frame)) throw new Error("unreachable");
    expect(frame.text).toBe("legacy");
  });

  it("rejects a reaction frame with a malformed op", () => {
    const bad = wire({
      v: FRAME_VERSION_V2,
      ts: 1,
      kind: "rx",
      target: "1",
      emoji: "x",
      op: "nope",
    });
    expect(() => decrypt(bad)).toThrow(DecryptError);
  });

  it("rejects a reaction frame with a non-string target", () => {
    const bad = wire({
      v: FRAME_VERSION_V2,
      ts: 1,
      kind: "rx",
      target: 5,
      emoji: "x",
      op: "add",
    });
    expect(() => decrypt(bad)).toThrow(DecryptError);
  });
});
