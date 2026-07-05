import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Row shape for `ChatMessage` partitioned parent table.
// Matches packages/database/prisma/schema.prisma exactly. Bytea columns arrive
// from Neon as Buffer / Uint8Array depending on driver mode; we always emit
// as Uint8Array on the way in (parameters are bound as bytea by the driver
// when we pass a Uint8Array).
export interface PersistMessageInput {
  chatId: string;
  serverSerial: bigint;
  senderId: string;
  clientMsgId: string;
  ciphertext: Uint8Array;
  nonce: Uint8Array;
}

export interface PersistedMessageRow {
  chatId: string;
  serverSerial: bigint;
  clientMsgId: string;
  createdAt: Date;
}

// Thin wrapper around @neondatabase/serverless. One instance per Worker
// invocation (or cached on the DO if the DO is hot). The neon() factory is
// cheap — no connection is opened until the first query, and queries are
// stateless HTTPS calls.
export class ChatPersistClient {
  private readonly sql: NeonQueryFunction<false, false>;

  constructor(connectionString: string) {
    if (!connectionString) {
      throw new Error("ChatPersistClient: connectionString is required");
    }
    this.sql = neon(connectionString);
  }

  // Insert a single message row. Uses ON CONFLICT on the PK so a counter
  // regression after partial failure (DO crashed between INSERT and
  // ctx.storage.put) becomes a no-op rather than corruption — the caller
  // detects the conflict via affected-row count of 0 and recovers
  // (advances counter via maxSerial()).
  async insertMessage(row: PersistMessageInput): Promise<boolean> {
    const result = await this.sql`
      INSERT INTO "ChatMessage" (
        "chatId", "serverSerial", "senderId", "clientMsgId",
        "ciphertext", "nonce"
      ) VALUES (
        ${row.chatId}, ${row.serverSerial}, ${row.senderId}, ${row.clientMsgId},
        ${row.ciphertext}, ${row.nonce}
      )
      ON CONFLICT ("chatId", "serverSerial", "createdAt") DO NOTHING
      RETURNING "chatId", "serverSerial", "clientMsgId", "createdAt"
    `;
    return Array.isArray(result) && result.length === 1;
  }

  // Cold-start recovery for Chat DO. Returns 0 when no rows exist (counter
  // starts at 1 on first message).
  async maxSerial(chatId: string): Promise<bigint> {
    const rows = (await this.sql`
      SELECT COALESCE(MAX("serverSerial"), 0) AS max
      FROM "ChatMessage"
      WHERE "chatId" = ${chatId}
    `) as Array<{ max: string | number | bigint }>;
    if (!rows.length) return 0n;
    return BigInt(rows[0]!.max);
  }

  // All chat members. Caller filters out the sender(s) per message — one
  // round-trip per flush regardless of batch size.
  async memberIds(chatId: string): Promise<string[]> {
    const rows = (await this.sql`
      SELECT "userId"
      FROM "ChatMember"
      WHERE "chatId" = ${chatId}
    `) as Array<{ userId: string }>;
    return rows.map((r) => r.userId);
  }

  // Advance a member's read high-water-mark. Monotonic by construction: the
  // WHERE guard only moves it forward, so out-of-order `read` frames (reconnect
  // replay, multi-device races) can't regress it. No-op when the member row is
  // absent or already at/ahead of `upto`.
  async updateLastReadSerial(
    chatId: string,
    userId: string,
    upto: bigint,
  ): Promise<void> {
    await this.sql`
      UPDATE "ChatMember"
      SET "lastReadSerial" = ${upto}
      WHERE "chatId" = ${chatId}
        AND "userId" = ${userId}
        AND ("lastReadSerial" IS NULL OR "lastReadSerial" < ${upto})
    `;
  }
}
