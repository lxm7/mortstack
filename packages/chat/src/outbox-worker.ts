// Outbox worker — polls chat-db's pending_outbox table and dispatches each
// row through the EncryptedChatTransport. Owns the per-chat FIFO gate that
// preserves MLS generation order, the exponential-backoff schedule for
// transient failures, and the terminal-failure transition that flips a
// row's UI status from "sending" to "failed".
//
// The worker is intentionally framework-agnostic — it accepts a bound
// `outbox` API (rather than a DB handle) and a slice of the store's
// reducers, so a future server-side or test environment can construct it
// without React/op-sqlite/Zustand wiring.

import { decode } from "@msgpack/msgpack";
import type { PendingOutboxRow } from "@repo/chat-db";

import type { EncryptedChatTransport } from "./encrypted-transport";

// ── Bound outbox API ────────────────────────────────────────────────────────
// Mirrors @repo/chat-db/outbox.ts function shapes but pre-bound to the
// caller's DB handle. The provider sets this up once on app boot.
export interface BoundOutboxApi {
  enqueue(args: {
    id: string;
    chatId: string;
    payload: Uint8Array;
    idempotencyKey: string;
    now?: number;
  }): Promise<void>;
  due(limit: number, now?: number): Promise<PendingOutboxRow[]>;
  markSent(id: string): Promise<void>;
  markFailed(id: string, reason: string, retryDelayMs: number): Promise<void>;
  markPermanentlyFailed(id: string, reason: string): Promise<void>;
  requeue(id: string): Promise<void>;
}

export interface OutboxWorkerStoreApi {
  confirmOptimisticMessage(input: {
    chatId: string;
    clientMsgId: string;
    serverMsgId: string;
    ts: number;
  }): void;
  failOptimisticMessage(input: { chatId: string; clientMsgId: string }): void;
  setMessageStatusSending?(input: {
    chatId: string;
    clientMsgId: string;
  }): void;
  // Reaction reconciliation (M8). Optional so environments without reactions
  // (tests, legacy debug) still satisfy the interface. A "del" row has no
  // optimistic pill keyed by clientMsgId, so these no-op for it.
  confirmReaction?(input: { chatId: string; clientMsgId: string }): void;
  failReaction?(input: { chatId: string; clientMsgId: string }): void;
}

export interface OutboxWorkerDeps {
  outbox: BoundOutboxApi;
  transport: EncryptedChatTransport;
  store: OutboxWorkerStoreApi;
  // Transient failure callback — fires when a row failed but will be
  // retried. Useful for telemetry; the UI bubble stays at "sending".
  onTransientFailure?: (clientMsgId: string, reason: string) => void;
  // Terminal failure callback — fires when a row hits MAX_ATTEMPTS. The
  // bubble has already been flipped to "failed" by the store reducer.
  onTerminalFailure?: (clientMsgId: string, reason: string) => void;
  // Time source override for tests.
  now?: () => number;
}

export interface OutboxWorker {
  start(): void;
  stop(): void;
  // Schedule an immediate tick. Cheap to call from multiple triggers
  // (reconnect, foreground, post-enqueue) — single-flighted internally.
  kick(): void;
  // User-initiated retry. Resets the row's attempt counter to zero and
  // kicks the worker; caller must also flip the store status back to
  // "sending" if they want immediate UI feedback (worker doesn't because
  // the store API isn't always wired for that mutation).
  retry(clientMsgId: string): Promise<void>;
}

// ── Tunables ────────────────────────────────────────────────────────────────
// Backoff schedule indexed by [attempts-after-this-failure - 1]:
//   1st failure → 5s,  2nd → 30s,  3rd → 2m,  4th → 10m
// 5th failure → marked permanently failed; status flips to "failed".
const MAX_ATTEMPTS = 5;
const BACKOFFS_MS = [5_000, 30_000, 120_000, 600_000];
const TICK_LIMIT = 20;
const PERIODIC_TICK_MS = 30_000;

function backoffFor(attemptsAfter: number): number {
  const idx = Math.max(0, Math.min(attemptsAfter - 1, BACKOFFS_MS.length - 1));
  return BACKOFFS_MS[idx]!;
}

export function createOutboxWorker(deps: OutboxWorkerDeps): OutboxWorker {
  const now = deps.now ?? (() => Date.now());
  // Set of chatIds currently being dispatched. The per-chat FIFO gate —
  // re-tick can't pick up the same chat's rows while a prior batch is in
  // flight, which is what preserves MLS generation order across retries
  // when the user fires multiple sends to the same chat offline.
  const inflightChats = new Set<string>();
  let ticking: Promise<void> | null = null;
  let periodic: ReturnType<typeof setInterval> | null = null;
  let stopped = true;

  async function dispatchOne(row: PendingOutboxRow): Promise<void> {
    let decoded: unknown;
    try {
      decoded = decode(row.payload);
    } catch (err) {
      // Corrupt payload — likely a schema mismatch between writer + reader
      // versions. No retry can fix this; surface as terminal.
      const reason = `invalid msgpack payload: ${String(err)}`;
      await deps.outbox.markPermanentlyFailed(row.id, reason);
      deps.store.failOptimisticMessage({
        chatId: row.chat_id,
        clientMsgId: row.id,
      });
      deps.onTerminalFailure?.(row.id, reason);
      return;
    }

    // Reaction row (M8) — rides the same encrypted send path as a message but
    // carries a "rx" payload instead of `text`. Reconciles the optimistic pill
    // rather than a message bubble.
    const asRx = decoded as {
      kind?: unknown;
      target?: unknown;
      emoji?: unknown;
      op?: unknown;
    };
    if (asRx.kind === "rx") {
      if (
        typeof asRx.target !== "string" ||
        typeof asRx.emoji !== "string" ||
        (asRx.op !== "add" && asRx.op !== "del")
      ) {
        const reason = "reaction payload missing/invalid target|emoji|op";
        await deps.outbox.markPermanentlyFailed(row.id, reason);
        deps.store.failReaction?.({ chatId: row.chat_id, clientMsgId: row.id });
        deps.onTerminalFailure?.(row.id, reason);
        return;
      }
      try {
        const results = await deps.transport.send({
          chatId: row.chat_id,
          reaction: { target: asRx.target, emoji: asRx.emoji, op: asRx.op },
          targets: [],
          clientMsgId: row.id,
        });
        if (!results[0]) throw new Error("transport returned no results");
        await deps.outbox.markSent(row.id);
        deps.store.confirmReaction?.({
          chatId: row.chat_id,
          clientMsgId: row.id,
        });
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        const attemptsAfter = row.attempts + 1;
        if (attemptsAfter >= MAX_ATTEMPTS) {
          await deps.outbox.markPermanentlyFailed(row.id, reason);
          deps.store.failReaction?.({
            chatId: row.chat_id,
            clientMsgId: row.id,
          });
          deps.onTerminalFailure?.(row.id, reason);
        } else {
          await deps.outbox.markFailed(
            row.id,
            reason,
            backoffFor(attemptsAfter),
          );
          deps.onTransientFailure?.(row.id, reason);
        }
      }
      return;
    }

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("text" in decoded) ||
      typeof (decoded as { text: unknown }).text !== "string"
    ) {
      const reason = "payload missing required `text` field";
      await deps.outbox.markPermanentlyFailed(row.id, reason);
      deps.store.failOptimisticMessage({
        chatId: row.chat_id,
        clientMsgId: row.id,
      });
      deps.onTerminalFailure?.(row.id, reason);
      return;
    }
    const payload = decoded as { text: string };

    try {
      const results = await deps.transport.send({
        chatId: row.chat_id,
        text: payload.text,
        targets: [],
        clientMsgId: row.id,
      });
      // v=2 returns exactly one envelope; v=1 returns one per device. We
      // treat the first ack as authoritative for the store transition —
      // server-side serial numbering means all v=1 fan-out copies share a
      // sequential range and the first ack is sufficient to mark sent.
      const first = results[0];
      if (!first) throw new Error("transport returned no results");
      await deps.outbox.markSent(row.id);
      deps.store.confirmOptimisticMessage({
        chatId: row.chat_id,
        clientMsgId: row.id,
        serverMsgId: first.serverMsgId,
        ts: first.ts,
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      const attemptsAfter = row.attempts + 1;
      if (attemptsAfter >= MAX_ATTEMPTS) {
        await deps.outbox.markPermanentlyFailed(row.id, reason);
        deps.store.failOptimisticMessage({
          chatId: row.chat_id,
          clientMsgId: row.id,
        });
        deps.onTerminalFailure?.(row.id, reason);
      } else {
        await deps.outbox.markFailed(row.id, reason, backoffFor(attemptsAfter));
        deps.onTransientFailure?.(row.id, reason);
      }
    }
  }

  async function processChat(
    chatId: string,
    rows: PendingOutboxRow[],
  ): Promise<void> {
    inflightChats.add(chatId);
    try {
      for (const row of rows) {
        if (stopped) return;
        await dispatchOne(row);
      }
    } finally {
      inflightChats.delete(chatId);
    }
  }

  function tick(): Promise<void> {
    if (ticking) return ticking;
    ticking = (async () => {
      if (stopped) return;
      let rows: PendingOutboxRow[];
      try {
        rows = await deps.outbox.due(TICK_LIMIT, now());
      } catch (err) {
        console.warn("[outbox-worker] due() failed", err);
        return;
      }
      if (rows.length === 0) return;
      // Group by chat + skip chats already in flight. Within a chat the
      // due() result is already sorted by next_attempt_at ASC, which for
      // FIFO enqueues equals insertion order — the preservation of MLS
      // generation order relies on this.
      const byChat = new Map<string, PendingOutboxRow[]>();
      for (const r of rows) {
        if (inflightChats.has(r.chat_id)) continue;
        const list = byChat.get(r.chat_id) ?? [];
        list.push(r);
        byChat.set(r.chat_id, list);
      }
      await Promise.allSettled(
        Array.from(byChat, ([chatId, list]) => processChat(chatId, list)),
      );
    })().finally(() => {
      ticking = null;
    });
    return ticking;
  }

  function start() {
    if (!stopped) return;
    stopped = false;
    if (!periodic) {
      periodic = setInterval(() => void tick(), PERIODIC_TICK_MS);
    }
    void tick();
  }

  function stop() {
    stopped = true;
    if (periodic) {
      clearInterval(periodic);
      periodic = null;
    }
  }

  function kick() {
    if (stopped) return;
    void tick();
  }

  async function retry(clientMsgId: string): Promise<void> {
    await deps.outbox.requeue(clientMsgId);
    kick();
  }

  return { start, stop, kick, retry };
}
