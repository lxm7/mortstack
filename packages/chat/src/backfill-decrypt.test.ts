import { describe, expect, it, vi } from "vitest";

// chat-crypto calls requireNativeModule() at import, which throws in Node. Stub
// it so importing encrypted-transport (→ crypto-pipe → chat-crypto) works. The
// v=2 tests use the passthrough MLS engine and never touch ChatCrypto.box.
vi.mock("@repo/chat-crypto", () => ({
  ChatCrypto: { box: vi.fn(), boxOpen: vi.fn() },
}));

import type {
  ChatTransport,
  IncomingBackfill,
} from "@repo/chat-transport/client";

import {
  createEncryptedTransport,
  type DecryptedBackfill,
  type EncryptedChatTransportOptions,
} from "./encrypted-transport";
import {
  encryptOutboundMls,
  FRAME_VERSION_V2,
  type MlsApi,
} from "./crypto-pipe";

// Passthrough MLS engine (as in crypto-pipe.test): round-trips the real v=2 code
// path with zero native crypto.
const fakeMls: MlsApi = {
  encryptApp: (_g, plaintext) => plaintext,
  processMessage: (_g, bytes) => ({ kind: "application", plaintext: bytes }),
};
const GID = new Uint8Array([1, 2, 3, 4]);

// A raw v=2-tagged ciphertext that is NOT a decodable frame → decrypt fails
// deterministically once past the version peek.
function undecryptableV2(): Uint8Array {
  return new Uint8Array([FRAME_VERSION_V2, 0xff, 0xff, 0xff]);
}

function bfdRow(serverMsgId: string, ciphertext: Uint8Array) {
  return {
    serverMsgId,
    senderId: "peer",
    ciphertext,
    nonce: new Uint8Array(0),
    ts: Number(serverMsgId) * 1000,
  };
}

// Wire an encrypted transport onto a fake underlying whose `bfd` handler we can
// fire by hand, then push one page and await the decrypted result.
function harness(opts: Partial<EncryptedChatTransportOptions>) {
  let fire: ((m: IncomingBackfill) => void) | null = null;
  const underlying = {
    onBackfill: (h: (m: IncomingBackfill) => void) => {
      fire = h;
      return () => {
        fire = null;
      };
    },
  } as unknown as ChatTransport;

  const onDecryptFailure = vi.fn();
  const transport = createEncryptedTransport({
    underlying,
    getMySeed: async () => new Uint8Array(0),
    getMyAccountId: async () => "me",
    resolveSenderX25519Pubs: async () => [],
    onDecryptFailure,
    ...opts,
  });

  const page = new Promise<DecryptedBackfill>((resolve) => {
    transport.onBackfill(resolve);
  });
  const push = (bfd: IncomingBackfill) => fire!(bfd);
  return { push, page, onDecryptFailure };
}

describe("decryptBackfill — undecryptable rows advance the cursor (ADR-0020 §5)", () => {
  it("drops every row when the engine can't decrypt but still passes upTo/more through", async () => {
    // No mls / resolveChatGroupId → every v=2 row is undecryptable.
    const { push, page, onDecryptFailure } = harness({});

    push({
      t: "bfd",
      chatId: "chat-1",
      messages: [
        bfdRow("8", undecryptableV2()),
        bfdRow("9", undecryptableV2()),
      ],
      upTo: "9",
      more: true,
    });

    const result = await page;
    expect(result.messages).toEqual([]);
    expect(result.reactions).toEqual([]);
    // The cursor advances past the sealed rows → no refetch-loop wedge.
    expect(result.upTo).toBe("9");
    expect(result.more).toBe(true);
    expect(onDecryptFailure).toHaveBeenCalledTimes(2);
  });

  it("keeps decryptable rows, drops the bad one, and advances past both", async () => {
    const { push, page, onDecryptFailure } = harness({
      mls: fakeMls,
      resolveChatGroupId: async () => GID,
    });

    const good = encryptOutboundMls({
      body: { text: "hello" },
      groupId: GID,
      mls: fakeMls,
    });

    push({
      t: "bfd",
      chatId: "chat-1",
      messages: [
        bfdRow("8", good.ciphertext), // decryptable
        bfdRow("9", new Uint8Array(0)), // empty → drop
      ],
      upTo: "9",
      more: false,
    });

    const result = await page;
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0]!.serverMsgId).toBe("8");
    expect(result.messages[0]!.frame.text).toBe("hello");
    // upTo still advances past the dropped serial 9.
    expect(result.upTo).toBe("9");
    expect(onDecryptFailure).toHaveBeenCalledTimes(1);
  });
});
