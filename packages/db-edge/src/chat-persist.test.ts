import { describe, expect, it } from "vitest";
import type { NeonQueryFunction } from "@neondatabase/serverless";

import { ChatPersistClient } from "./chat-persist";

// Fake tagged-template executor: captures the SQL text + bound params of the
// last call and returns a canned result. Lets us assert the membership gate is
// in the query and that row mapping is correct — no Neon round-trip.
function fakeSql(rows: unknown[]) {
  const calls: Array<{ text: string; params: unknown[] }> = [];
  const fn = (strings: TemplateStringsArray, ...params: unknown[]) => {
    calls.push({ text: strings.join("?"), params });
    return Promise.resolve(rows);
  };
  return { fn: fn as unknown as NeonQueryFunction<false, false>, calls };
}

describe("messagesSince", () => {
  it("enforces membership inside the query and binds params in order", async () => {
    const { fn, calls } = fakeSql([]);
    const client = new ChatPersistClient(fn);

    await client.messagesSince("chat-1", "user-A", 41n, 201);

    const { text, params } = calls[0]!;
    // The EXISTS ChatMember sub-select IS the authorization boundary.
    expect(text).toContain("EXISTS");
    expect(text).toContain('"ChatMember"');
    expect(text).toContain('"serverSerial" > ');
    expect(text).toContain('ORDER BY "serverSerial" ASC');
    expect(text).toContain("LIMIT");
    // chatId (range), after, chatId (EXISTS), userId, limit.
    expect(params).toEqual(["chat-1", 41n, "chat-1", "user-A", 201]);
  });

  it("returns [] for a non-member (query yields no rows)", async () => {
    const { fn } = fakeSql([]);
    const client = new ChatPersistClient(fn);

    const out = await client.messagesSince("chat-1", "stranger", 0n, 200);

    expect(out).toEqual([]);
  });

  it("maps Uint8Array bytea + createdAt Date rows", async () => {
    const ct = new Uint8Array([1, 2, 3]);
    const nonce = new Uint8Array([9, 9]);
    const when = new Date("2026-07-05T00:00:00.000Z");
    const { fn } = fakeSql([
      {
        serverSerial: "42",
        senderId: "user-B",
        ciphertext: ct,
        nonce,
        createdAt: when,
      },
    ]);
    const client = new ChatPersistClient(fn);

    const [row] = await client.messagesSince("chat-1", "user-A", 0n, 200);

    expect(row!.serverSerial).toBe(42n);
    expect(row!.senderId).toBe("user-B");
    expect(row!.ciphertext).toEqual(ct);
    expect(row!.nonce).toEqual(nonce);
    expect(row!.createdAt).toEqual(when);
  });

  it("normalises Postgres hex-string bytea and string timestamps", async () => {
    const { fn } = fakeSql([
      {
        serverSerial: 7,
        senderId: "user-B",
        ciphertext: "\\x010203",
        nonce: "\\xff",
        createdAt: "2026-07-05T12:00:00.000Z",
      },
    ]);
    const client = new ChatPersistClient(fn);

    const [row] = await client.messagesSince("chat-1", "user-A", 0n, 200);

    expect(row!.serverSerial).toBe(7n);
    expect(row!.ciphertext).toEqual(new Uint8Array([1, 2, 3]));
    expect(row!.nonce).toEqual(new Uint8Array([255]));
    expect(row!.createdAt).toEqual(new Date("2026-07-05T12:00:00.000Z"));
  });
});
