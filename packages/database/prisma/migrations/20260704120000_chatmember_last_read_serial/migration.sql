-- Read-receipt high-water-mark on ChatMember (M8 typing/receipts/reactions).
--
-- Replaces `lastReadAt TIMESTAMP(3)` (dormant, never written) with a
-- serial-keyed watermark `lastReadSerial BIGINT`. Receipts key off the DO's
-- monotonic serverSerial (ADR-012), not wall-clock: skew-free and directly
-- comparable to a message's serial for "is my message read?" + unread counts.
--
-- Pre-launch — no read-state data to preserve, so a drop/add is safe.

ALTER TABLE "ChatMember" DROP COLUMN "lastReadAt";
ALTER TABLE "ChatMember" ADD COLUMN "lastReadSerial" BIGINT;
