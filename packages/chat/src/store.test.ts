import { beforeEach, describe, expect, it } from "vitest";

import { useChatStore } from "./store";

const CHAT = "chat-1";
const s = () => useChatStore.getState();

beforeEach(() => {
  s().reset();
});

describe("reaction reducers", () => {
  it("adds an optimistic reaction (sending) and confirms it (sent)", () => {
    s().addOptimisticReaction({
      chatId: CHAT,
      clientMsgId: "c1",
      target: "5",
      emoji: "👍",
      senderAuthUserId: "u1",
    });
    expect(s().reactions.get(CHAT)?.get("5")?.[0]?.status).toBe("sending");
    s().confirmReaction({ chatId: CHAT, clientMsgId: "c1" });
    expect(s().reactions.get(CHAT)?.get("5")?.[0]?.status).toBe("sent");
  });

  it("dedups a repeated (sender,target,emoji) add — LWW is a no-op", () => {
    s().applyIncomingReaction({
      chatId: CHAT,
      target: "5",
      emoji: "👍",
      op: "add",
      senderAuthUserId: "u2",
    });
    s().applyIncomingReaction({
      chatId: CHAT,
      target: "5",
      emoji: "👍",
      op: "add",
      senderAuthUserId: "u2",
    });
    expect(s().reactions.get(CHAT)?.get("5")).toHaveLength(1);
  });

  it("removes on op del", () => {
    s().applyIncomingReaction({
      chatId: CHAT,
      target: "5",
      emoji: "👍",
      op: "add",
      senderAuthUserId: "u2",
    });
    s().applyIncomingReaction({
      chatId: CHAT,
      target: "5",
      emoji: "👍",
      op: "del",
      senderAuthUserId: "u2",
    });
    expect(s().reactions.get(CHAT)).toBeUndefined();
  });

  it("distinct senders on the same emoji both count", () => {
    for (const u of ["u2", "u3"]) {
      s().applyIncomingReaction({
        chatId: CHAT,
        target: "5",
        emoji: "👍",
        op: "add",
        senderAuthUserId: u,
      });
    }
    expect(s().reactions.get(CHAT)?.get("5")).toHaveLength(2);
  });

  it("rolls back a terminally-failed optimistic reaction", () => {
    s().addOptimisticReaction({
      chatId: CHAT,
      clientMsgId: "c1",
      target: "5",
      emoji: "👍",
      senderAuthUserId: "u1",
    });
    s().failReaction({ chatId: CHAT, clientMsgId: "c1" });
    expect(s().reactions.get(CHAT)).toBeUndefined();
  });
});

describe("typing reducers", () => {
  it("sets then clears a typer", () => {
    s().setTyping({ chatId: CHAT, userId: "u2", on: true });
    expect(s().typing.get(CHAT)?.has("u2")).toBe(true);
    s().setTyping({ chatId: CHAT, userId: "u2", on: false });
    expect(s().typing.get(CHAT)).toBeUndefined();
  });

  it("sweep prunes an expired typer", () => {
    s().setTyping({ chatId: CHAT, userId: "u2", on: true });
    // TTL is 6s; sweeping 10s in the future prunes it.
    s().sweepExpiredTyping(Date.now() + 10_000);
    expect(s().typing.get(CHAT)).toBeUndefined();
  });

  it("sweep keeps a fresh typer", () => {
    s().setTyping({ chatId: CHAT, userId: "u2", on: true });
    s().sweepExpiredTyping(Date.now());
    expect(s().typing.get(CHAT)?.has("u2")).toBe(true);
  });
});

describe("ingestBackfill (offline catch-up)", () => {
  const bf = (serverMsgId: string, text: string, ts = Number(serverMsgId)) => ({
    serverMsgId,
    senderAuthUserId: "u2",
    text,
    ts,
  });

  it("merges a page sorted by serverSerial (numeric, not lexical)", () => {
    // Deliberately out of order + a lexical trap ("9" vs "10").
    s().ingestBackfill(CHAT, [bf("10", "j"), bf("9", "i"), bf("2", "b")]);
    const list = s().messages.get(CHAT)!;
    expect(list.map((m) => m.serverSerial)).toEqual(["2", "9", "10"]);
    expect(list.map((m) => m.text)).toEqual(["b", "i", "j"]);
    expect(list.every((m) => m.status === "sent")).toBe(true);
  });

  it("dedupes by serverSerial against existing rows and within the batch", () => {
    s().addIncomingMessage({
      chatId: CHAT,
      serverMsgId: "5",
      senderAuthUserId: "u2",
      text: "live-5",
      ts: 5,
    });
    // "5" already present (live); "7" duplicated within the batch.
    s().ingestBackfill(CHAT, [
      bf("5", "dup"),
      bf("7", "g"),
      bf("7", "g-again"),
    ]);
    const list = s().messages.get(CHAT)!;
    expect(list.map((m) => m.serverSerial)).toEqual(["5", "7"]);
    // The existing live row is not overwritten by the backfill dup.
    expect(list.find((m) => m.serverSerial === "5")?.text).toBe("live-5");
  });

  it("interleaves a live send into correct serial order after backfill", () => {
    s().ingestBackfill(CHAT, [bf("2", "b"), bf("4", "d")]);
    // A live message with a serial BETWEEN the backfilled ones lands sorted.
    s().addIncomingMessage({
      chatId: CHAT,
      serverMsgId: "3",
      senderAuthUserId: "u2",
      text: "c",
      ts: 3,
    });
    // A later backfill page arrives out of order relative to the live insert.
    s().ingestBackfill(CHAT, [bf("1", "a"), bf("5", "e")]);
    expect(
      s()
        .messages.get(CHAT)!
        .map((m) => m.serverSerial),
    ).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("keeps an optimistic (unsent) message at the tail", () => {
    s().addOptimisticMessage({
      chatId: CHAT,
      clientMsgId: "opt-1",
      senderAuthUserId: "me",
      text: "typing…",
    });
    s().ingestBackfill(CHAT, [bf("8", "h"), bf("6", "f")]);
    const list = s().messages.get(CHAT)!;
    // Confirmed history sorts by serial; the unsent optimistic row tail-sorts.
    expect(list.map((m) => m.serverSerial ?? "opt")).toEqual(["6", "8", "opt"]);
    expect(list[list.length - 1]!.status).toBe("sending");
  });

  it("no-ops on an empty page", () => {
    s().ingestBackfill(CHAT, []);
    expect(s().messages.get(CHAT)).toBeUndefined();
  });
});

describe("read-receipt reducer (monotonic)", () => {
  it("advances forward and ignores regressions", () => {
    s().setReadReceipt({ chatId: CHAT, userId: "u2", upto: "10" });
    expect(s().readReceipts.get(CHAT)?.get("u2")).toBe("10");
    s().setReadReceipt({ chatId: CHAT, userId: "u2", upto: "5" });
    expect(s().readReceipts.get(CHAT)?.get("u2")).toBe("10");
    s().setReadReceipt({ chatId: CHAT, userId: "u2", upto: "20" });
    expect(s().readReceipts.get(CHAT)?.get("u2")).toBe("20");
  });

  it("compares as BigInt, not lexicographically (9 < 100)", () => {
    s().setReadReceipt({ chatId: CHAT, userId: "u2", upto: "9" });
    s().setReadReceipt({ chatId: CHAT, userId: "u2", upto: "100" });
    expect(s().readReceipts.get(CHAT)?.get("u2")).toBe("100");
  });
});
