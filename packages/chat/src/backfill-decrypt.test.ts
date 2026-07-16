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

// An engine that holds no state for the group — throws the same shape the
// native ChatMlsCore surfaces when the device never processed a Welcome —
// but only for a sentinel ciphertext, so a page can mix healthy + blocked rows.
const GNF_SENTINEL = 0x99;
const gnfMls: MlsApi = {
  encryptApp: (_g, plaintext) => plaintext,
  processMessage: (_g, bytes) => {
    if (bytes.length <= 2 && bytes[bytes.length - 1] === GNF_SENTINEL) {
      throw new Error('ChatMlsError.Internal("group not found")');
    }
    return { kind: "application", plaintext: bytes };
  },
};

function gnfRowCiphertext(): Uint8Array {
  return new Uint8Array([FRAME_VERSION_V2, GNF_SENTINEL]);
}

describe("decryptBackfill — recoverable failures pin the cursor", () => {
  it("caps upTo below a 'group not found' row and stops paging", async () => {
    const { push, page } = harness({
      mls: gnfMls,
      resolveChatGroupId: async () => GID,
    });

    const good = encryptOutboundMls({
      body: { text: "hello" },
      groupId: GID,
      mls: gnfMls,
    });

    push({
      t: "bfd",
      chatId: "chat-1",
      messages: [
        bfdRow("8", good.ciphertext), // decrypts
        bfdRow("9", gnfRowCiphertext()), // group not found → recoverable
        bfdRow("10", good.ciphertext), // still delivered (dedupe on refetch)
      ],
      upTo: "10",
      more: true,
    });

    const result = await page;
    expect(result.messages.map((m) => m.serverMsgId)).toEqual(["8", "10"]);
    // Cursor pinned just below the blocked serial → 9 is refetched after the
    // Welcome lands, instead of being skipped forever.
    expect(result.upTo).toBe("8");
    // Same-session paging stops — otherwise the next page re-serves 9+ in a loop.
    expect(result.more).toBe(false);
  });

  it("caps at serial-1 even for the first row of history", async () => {
    const { push, page } = harness({
      mls: gnfMls,
      resolveChatGroupId: async () => GID,
    });

    push({
      t: "bfd",
      chatId: "chat-1",
      messages: [bfdRow("1", gnfRowCiphertext())],
      upTo: "1",
      more: false,
    });

    const result = await page;
    expect(result.upTo).toBe("0");
    expect(result.more).toBe(false);
  });

  it("treats a not-yet-initialised engine as recoverable (init race on account switch)", async () => {
    // Exact shape the native module surfaces when a backfill page races
    // initEngine(accountId) — the 2026-07-16 alice regression.
    const bootingMls: MlsApi = {
      encryptApp: (_g, plaintext) => plaintext,
      processMessage: () => {
        throw new Error(
          "UnexpectedException: ChatMlsCore: engine not initialised — call initEngine(accountId) first",
        );
      },
    };
    const { push, page } = harness({
      mls: bootingMls,
      resolveChatGroupId: async () => GID,
    });

    push({
      t: "bfd",
      chatId: "chat-1",
      messages: [bfdRow("3", gnfRowCiphertext())],
      upTo: "3",
      more: false,
    });

    const result = await page;
    expect(result.upTo).toBe("2");
    expect(result.more).toBe(false);
  });

  it("treats a missing local chat↔group link as recoverable too", async () => {
    // chat.list mirror hasn't landed yet → resolveChatGroupId yields null.
    const { push, page, onDecryptFailure } = harness({
      mls: gnfMls,
      resolveChatGroupId: async () => null,
    });

    push({
      t: "bfd",
      chatId: "chat-1",
      messages: [bfdRow("5", gnfRowCiphertext())],
      upTo: "5",
      more: false,
    });

    const result = await page;
    expect(result.upTo).toBe("4");
    expect(onDecryptFailure).toHaveBeenCalledTimes(1);
  });
});
