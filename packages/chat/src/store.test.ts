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
