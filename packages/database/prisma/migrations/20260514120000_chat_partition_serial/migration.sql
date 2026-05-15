-- M2 chat schema overhaul (ADR-010 / ADR-012 / ADR-014).
--
-- Replaces the M1 `ChatMessage` table (cuid PK + createdAt index) with:
--   • Composite PK (chatId, serverSerial, createdAt) — ADR-012
--   • BIGINT serverSerial assigned by Chat DO in-memory
--   • TIMESTAMPTZ createdAt
--   • RANGE-partitioned by createdAt (monthly) — ADR-014
--   • UNIQUE (chatId, clientMsgId, createdAt) for sender dedup
--   • No FK to Chat (per-partition FK overhead + Prisma fights it)
--
-- Pre-launch — there is no production chat data to preserve.

-- Drop the M1 table + indexes (cascade clears FKs).
DROP TABLE IF EXISTS "ChatMessage" CASCADE;

-- Parent partitioned table.
CREATE TABLE "ChatMessage" (
    "chatId"       TEXT        NOT NULL,
    "serverSerial" BIGINT      NOT NULL,
    "senderId"     TEXT        NOT NULL,
    "clientMsgId"  TEXT        NOT NULL,
    "ciphertext"   BYTEA       NOT NULL,
    "nonce"        BYTEA       NOT NULL,
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey"
      PRIMARY KEY ("chatId", "serverSerial", "createdAt")
) PARTITION BY RANGE ("createdAt");

-- Unique constraint for sender dedup (must include partition key).
CREATE UNIQUE INDEX "ChatMessage_chatId_clientMsgId_createdAt_key"
  ON "ChatMessage" ("chatId", "clientMsgId", "createdAt");

-- Secondary index for serial-scoped scans (cursor resume, gap detection).
CREATE INDEX "ChatMessage_chatId_serverSerial_idx"
  ON "ChatMessage" ("chatId", "serverSerial");

-- Helper to create a monthly partition. Idempotent.
-- Usage: SELECT chat_message_create_partition('2026-05-01'::timestamptz);
CREATE OR REPLACE FUNCTION chat_message_create_partition(month_start TIMESTAMPTZ)
RETURNS VOID AS $$
DECLARE
    month_end   TIMESTAMPTZ := (month_start + INTERVAL '1 month');
    part_name   TEXT        := 'ChatMessage_' || TO_CHAR(month_start, 'YYYYMM');
BEGIN
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF "ChatMessage"
           FOR VALUES FROM (%L) TO (%L)',
        part_name, month_start, month_end
    );
END;
$$ LANGUAGE plpgsql;

-- Seed initial partitions: previous + current + next 2 months. The
-- scheduled-Worker partition maintenance job (deferred; see ADR-014) extends
-- this rolling window once it ships. Until then, manual top-up via:
--   SELECT chat_message_create_partition(date_trunc('month', now())::timestamptz + interval '3 month');
SELECT chat_message_create_partition(
  (date_trunc('month', CURRENT_TIMESTAMP) - INTERVAL '1 month')::TIMESTAMPTZ
);
SELECT chat_message_create_partition(
  (date_trunc('month', CURRENT_TIMESTAMP))::TIMESTAMPTZ
);
SELECT chat_message_create_partition(
  (date_trunc('month', CURRENT_TIMESTAMP) + INTERVAL '1 month')::TIMESTAMPTZ
);
SELECT chat_message_create_partition(
  (date_trunc('month', CURRENT_TIMESTAMP) + INTERVAL '2 month')::TIMESTAMPTZ
);
