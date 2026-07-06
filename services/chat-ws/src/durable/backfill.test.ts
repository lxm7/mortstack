import { describe, expect, it, vi } from "vitest";
import type { BackfilledMessageRow } from "@repo/db-edge";

import {
  BACKFILL_PAGE_SIZE,
  resolveBackfillPage,
  type BackfillDeps,
} from "./backfill";

// A canned Neon row. serverSerial drives serverMsgId/upTo; createdAt drives ts.
function row(serial: bigint): BackfilledMessageRow {
  return {
    serverSerial: serial,
    senderId: `u-${serial}`,
    ciphertext: new Uint8Array([Number(serial % 256n)]),
    nonce: new Uint8Array([0]),
    createdAt: new Date(Number(serial) * 1000),
  };
}

// Build deps with a spy messagesSince and an optional kvGet. Lets each test
// assert whether Neon was hit and what the KV read was.
function deps(opts: {
  rows?: BackfilledMessageRow[];
  kvGet?: BackfillDeps["kvGet"];
}) {
  const messagesSince = vi.fn(async () => opts.rows ?? []);
  const d: BackfillDeps = {
    kvGet: opts.kvGet ?? null,
    messagesSince,
  };
  return { d, messagesSince };
}

describe("resolveBackfillPage — KV skip-cache (ADR-0020 §3)", () => {
  it("skips Neon when the KV max is at or below the client cursor", async () => {
    const kvGet = vi.fn(async () => "10");
    const { d, messagesSince } = deps({ kvGet });

    const { frame, skipped, rows } = await resolveBackfillPage(d, "user-A", {
      chatId: "chat-1",
      after: "10",
    });

    expect(kvGet).toHaveBeenCalledWith("chatmax:chat-1");
    expect(messagesSince).not.toHaveBeenCalled(); // zero Neon reads (acceptance)
    expect(skipped).toBe(true);
    expect(rows).toBe(0);
    expect(frame).toEqual({
      t: "bfd",
      chatId: "chat-1",
      messages: [],
      upTo: "10", // cursor unchanged, no refetch loop
      more: false,
    });
  });

  it("hits Neon when the KV max is above the client cursor (a real gap)", async () => {
    const kvGet = vi.fn(async () => "20");
    const { d, messagesSince } = deps({ rows: [row(11n)], kvGet });

    const { skipped } = await resolveBackfillPage(d, "user-A", {
      chatId: "chat-1",
      after: "10",
    });

    expect(skipped).toBe(false);
    expect(messagesSince).toHaveBeenCalledOnce();
  });

  it("force:true bypasses the KV skip entirely (fresh-login correctness, §4)", async () => {
    const kvGet = vi.fn(async () => "10");
    const { d, messagesSince } = deps({ rows: [row(5n)], kvGet });

    await resolveBackfillPage(d, "user-A", {
      chatId: "chat-1",
      after: "10",
      force: true,
    });

    expect(kvGet).not.toHaveBeenCalled();
    expect(messagesSince).toHaveBeenCalledOnce();
  });

  it("falls through to Neon when the KV read throws (never skip on uncertainty)", async () => {
    const kvGet = vi.fn(async () => {
      throw new Error("KV unavailable");
    });
    const { d, messagesSince } = deps({ rows: [row(5n)], kvGet });

    const { skipped } = await resolveBackfillPage(d, "user-A", {
      chatId: "chat-1",
      after: "0",
    });

    expect(skipped).toBe(false);
    expect(messagesSince).toHaveBeenCalledOnce();
  });

  it("hits Neon when no KV namespace is bound", async () => {
    const { d, messagesSince } = deps({ rows: [row(1n)], kvGet: null });

    await resolveBackfillPage(d, "user-A", { chatId: "chat-1", after: "0" });

    expect(messagesSince).toHaveBeenCalledOnce();
  });
});

describe("resolveBackfillPage — membership gate + cursor (ADR-0020 §2, §5)", () => {
  it("returns an empty page for a non-member and advances upTo to `after`", async () => {
    // messagesSince yields [] because the query's EXISTS ChatMember gate
    // excludes a non-member — no ciphertext, no metadata leak, no wedge.
    const { d } = deps({ rows: [] });

    const { frame } = await resolveBackfillPage(d, "stranger", {
      chatId: "chat-1",
      after: "42",
      force: true,
    });

    expect(frame.messages).toEqual([]);
    expect(frame.upTo).toBe("42"); // cursor holds; a later real membership catches up
    expect(frame.more).toBe(false);
  });

  it("maps served rows and advances upTo to the greatest serial", async () => {
    const { d } = deps({ rows: [row(7n), row(8n), row(9n)] });

    const { frame, rows } = await resolveBackfillPage(d, "user-A", {
      chatId: "chat-1",
      after: "6",
      force: true,
    });

    expect(rows).toBe(3);
    expect(frame.more).toBe(false);
    expect(frame.upTo).toBe("9");
    expect(frame.messages).toEqual([
      {
        serverMsgId: "7",
        senderId: "u-7",
        ciphertext: new Uint8Array([7]),
        nonce: new Uint8Array([0]),
        ts: 7000,
      },
      {
        serverMsgId: "8",
        senderId: "u-8",
        ciphertext: new Uint8Array([8]),
        nonce: new Uint8Array([0]),
        ts: 8000,
      },
      {
        serverMsgId: "9",
        senderId: "u-9",
        ciphertext: new Uint8Array([9]),
        nonce: new Uint8Array([0]),
        ts: 9000,
      },
    ]);
  });

  it("sets more:true and serves exactly PAGE_SIZE when a further page exists", async () => {
    // messagesSince is asked for PAGE_SIZE+1; returning that many signals `more`.
    const full = Array.from({ length: BACKFILL_PAGE_SIZE + 1 }, (_, i) =>
      row(BigInt(i + 1)),
    );
    const { d, messagesSince } = deps({ rows: full });

    const { frame } = await resolveBackfillPage(d, "user-A", {
      chatId: "chat-1",
      after: "0",
      force: true,
    });

    expect(messagesSince).toHaveBeenCalledWith(
      "chat-1",
      "user-A",
      0n,
      BACKFILL_PAGE_SIZE + 1,
    );
    expect(frame.more).toBe(true);
    expect(frame.messages).toHaveLength(BACKFILL_PAGE_SIZE);
    // upTo is the last SERVED serial (PAGE_SIZE), not the peeked +1 row.
    expect(frame.upTo).toBe(String(BACKFILL_PAGE_SIZE));
  });
});
