import type { DB } from "@op-engineering/op-sqlite";
import type { BackfillCursorRow } from "./schema";

// Offline backfill cursors (docs/message-backfill.md). Per-chat high-water mark
// of the greatest serverSerial pulled via `bf`. The provider reads these to
// build the batched backfill request and advances them on each `bfd` page.

// Greatest serverSerial this device has backfilled for `chatId`, or null when
// the chat has never been backfilled (the caller treats null as "0" = full
// history).
export async function getCursor(
  db: DB,
  chatId: string,
): Promise<string | null> {
  const result = await db.execute(
    `SELECT last_serial FROM backfill_cursors WHERE chat_id = ? LIMIT 1`,
    [chatId],
  );
  const rows = (result.rows ?? []) as unknown as BackfillCursorRow[];
  return rows[0]?.last_serial ?? null;
}

// All known cursors as { chatId: lastSerial }. One round-trip for the batched
// `bf` frame; chats absent from the map default to "0" at the call site.
export async function getAllCursors(db: DB): Promise<Record<string, string>> {
  const result = await db.execute(
    `SELECT chat_id, last_serial FROM backfill_cursors`,
  );
  const rows = (result.rows ?? []) as unknown as BackfillCursorRow[];
  const out: Record<string, string> = {};
  for (const r of rows) out[r.chat_id] = r.last_serial;
  return out;
}

// Advance a chat's cursor to `upTo` (a `bfd.upTo`), monotonically. The guard
// lives in SQL so it is atomic against interleaved backfill passes: the
// conflict-update only fires when the new serial is strictly greater, compared
// as INTEGER (int64) — never lexically, so "9" < "10" holds. An out-of-order or
// stale `bfd` (reconnect replay) can never regress the cursor.
export async function setCursor(
  db: DB,
  chatId: string,
  upTo: string,
): Promise<void> {
  await db.execute(
    `INSERT INTO backfill_cursors (chat_id, last_serial) VALUES (?, ?)
     ON CONFLICT(chat_id) DO UPDATE SET last_serial = excluded.last_serial
       WHERE CAST(excluded.last_serial AS INTEGER)
           > CAST(backfill_cursors.last_serial AS INTEGER)`,
    [chatId, upTo],
  );
}
