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

// Row shape returned by messagesSince (offline backfill, docs/message-backfill.md).
// Raw persisted columns — the wire mapping to a `bfd` frame (serverMsgId, ts)
// happens in UserInbox, which owns the transport shape.
export interface BackfilledMessageRow {
  serverSerial: bigint;
  senderId: string;
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  createdAt: Date;
}

// bytea round-trips as a Buffer / Uint8Array on some driver modes and as a
// Postgres `\x`-hex string on others. Normalise to Uint8Array so the transport
// layer never has to care which the Neon HTTP driver handed back.
function toUint8Array(value: unknown): Uint8Array {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (Array.isArray(value)) return Uint8Array.from(value as number[]);
  if (typeof value === "string") {
    const hex = value.startsWith("\\x") ? value.slice(2) : value;
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) {
      out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return out;
  }
  throw new Error(`bytea column not decodable to bytes: ${typeof value}`);
}

// Thin wrapper around @neondatabase/serverless. One instance per Worker
// invocation (or cached on the DO if the DO is hot). The neon() factory is
// cheap — no connection is opened until the first query, and queries are
// stateless HTTPS calls.
export class ChatPersistClient {
  private readonly sql: NeonQueryFunction<false, false>;

  // Accepts a connection string (production) or a pre-built query function
  // (tests inject a fake tagged-template executor — no Neon round-trip).
  constructor(connection: string | NeonQueryFunction<false, false>) {
    if (typeof connection === "string") {
      if (!connection) {
        throw new Error("ChatPersistClient: connectionString is required");
      }
      this.sql = neon(connection);
    } else {
      this.sql = connection;
    }
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

  // Offline backfill (docs/message-backfill.md): rows with serverSerial > after,
  // ascending, capped at `limit`. Membership is enforced INSIDE the query — the
  // EXISTS gate is the authorization boundary, so a non-member (or a stranger
  // guessing a chatId) gets an empty result with zero metadata leak and no
  // separate check / Chat DO wakeup. Neon-authoritative read; the caller passes
  // limit+1 to detect whether another page exists.
  async messagesSince(
    chatId: string,
    userId: string,
    after: bigint,
    limit: number,
  ): Promise<BackfilledMessageRow[]> {
    const rows = (await this.sql`
      SELECT "serverSerial", "senderId", "ciphertext", "nonce", "createdAt"
      FROM "ChatMessage"
      WHERE "chatId" = ${chatId} AND "serverSerial" > ${after}
        AND EXISTS (
          SELECT 1 FROM "ChatMember"
          WHERE "chatId" = ${chatId} AND "userId" = ${userId}
        )
      ORDER BY "serverSerial" ASC
      LIMIT ${limit}
    `) as Array<{
      serverSerial: string | number | bigint;
      senderId: string;
      ciphertext: unknown;
      nonce: unknown;
      createdAt: string | Date;
    }>;
    return rows.map((r) => ({
      serverSerial: BigInt(r.serverSerial),
      senderId: r.senderId,
      ciphertext: toUint8Array(r.ciphertext),
      nonce: toUint8Array(r.nonce),
      createdAt:
        r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt),
    }));
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
