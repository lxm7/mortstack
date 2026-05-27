import type { DB } from "@op-engineering/op-sqlite";
import type { PendingOutboxRow } from "./schema";

export interface EnqueueArgs {
  id: string;
  chatId: string;
  payload: Uint8Array;
  idempotencyKey: string;
  now?: number;
}

export async function enqueue(db: DB, args: EnqueueArgs): Promise<void> {
  const now = args.now ?? Date.now();
  await db.execute(
    `INSERT INTO pending_outbox
       (id, chat_id, payload, idempotency_key, attempts, next_attempt_at, created_at, last_error)
     VALUES (?, ?, ?, ?, 0, ?, ?, NULL)
     ON CONFLICT(idempotency_key) DO NOTHING`,
    [args.id, args.chatId, args.payload, args.idempotencyKey, now, now],
  );
}

export async function markSent(db: DB, id: string): Promise<void> {
  await db.execute("DELETE FROM pending_outbox WHERE id = ?", [id]);
}

export async function markFailed(
  db: DB,
  id: string,
  reason: string,
  retryDelayMs: number,
): Promise<void> {
  const nextAt = Date.now() + retryDelayMs;
  await db.execute(
    `UPDATE pending_outbox
       SET attempts = attempts + 1, last_error = ?, next_attempt_at = ?
     WHERE id = ?`,
    [reason, nextAt, id],
  );
}

// Permanently halts auto-retry by pushing next_attempt_at out of reach.
// The row stays in place so the UI can render "failed" status and offer a
// manual retry via `requeue`. The worker's `due()` query will never select
// this row again.
export async function markPermanentlyFailed(
  db: DB,
  id: string,
  reason: string,
): Promise<void> {
  await db.execute(
    `UPDATE pending_outbox
       SET attempts = attempts + 1, last_error = ?, next_attempt_at = ?
     WHERE id = ?`,
    [reason, Number.MAX_SAFE_INTEGER, id],
  );
}

// User-triggered retry: zero out attempt counter + clear error + schedule
// immediate dispatch. Worker.kick() should be called by the caller right
// after to pull the row this tick rather than waiting for the next trigger.
export async function requeue(db: DB, id: string): Promise<void> {
  await db.execute(
    `UPDATE pending_outbox
       SET attempts = 0, last_error = NULL, next_attempt_at = ?
     WHERE id = ?`,
    [Date.now(), id],
  );
}

// Lookup by idempotency_key. Used by enqueue() callers that want to detect
// "already-queued" races without relying on ON CONFLICT silently no-op'ing.
export async function findByIdempotencyKey(
  db: DB,
  key: string,
): Promise<PendingOutboxRow | null> {
  const result = await db.execute(
    `SELECT id, chat_id, payload, idempotency_key, attempts, next_attempt_at, created_at, last_error
       FROM pending_outbox
      WHERE idempotency_key = ?
      LIMIT 1`,
    [key],
  );
  const rows = (result.rows ?? []) as unknown as PendingOutboxRow[];
  return rows[0] ?? null;
}

export async function due(
  db: DB,
  limit: number,
  now: number = Date.now(),
): Promise<PendingOutboxRow[]> {
  const result = await db.execute(
    `SELECT id, chat_id, payload, idempotency_key, attempts, next_attempt_at, created_at, last_error
       FROM pending_outbox
      WHERE next_attempt_at <= ?
      ORDER BY next_attempt_at ASC
      LIMIT ?`,
    [now, limit],
  );
  return (result.rows ?? []) as unknown as PendingOutboxRow[];
}
