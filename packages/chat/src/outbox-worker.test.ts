import { describe, expect, it, vi } from "vitest";
import { encode } from "@msgpack/msgpack";
import type { PendingOutboxRow } from "@repo/chat-db";

import {
  createOutboxWorker,
  isTerminalSendReason,
  type BoundOutboxApi,
  type OutboxWorkerStoreApi,
} from "./outbox-worker";
import type { EncryptedChatTransport } from "./encrypted-transport";

function row(overrides: Partial<PendingOutboxRow> = {}): PendingOutboxRow {
  return {
    id: "client-msg-1",
    chat_id: "chat-1",
    payload: encode({ text: "hi" }),
    idempotency_key: "client-msg-1",
    attempts: 0,
    next_attempt_at: 0,
    created_at: 0,
    last_error: null,
    ...overrides,
  } as PendingOutboxRow;
}

// One-shot outbox: due() hands out the row exactly once, then records which
// terminal/transient transition the worker chose.
function harness(sendError: Error) {
  let handed = false;
  const calls = {
    markFailed: vi.fn(async () => {}),
    markPermanentlyFailed: vi.fn(async () => {}),
    markSent: vi.fn(async () => {}),
  };
  const outbox: BoundOutboxApi = {
    enqueue: async () => {},
    due: async () => {
      if (handed) return [];
      handed = true;
      return [row()];
    },
    markSent: calls.markSent,
    markFailed: calls.markFailed,
    markPermanentlyFailed: calls.markPermanentlyFailed,
    requeue: async () => {},
  };
  const store: OutboxWorkerStoreApi = {
    confirmOptimisticMessage: vi.fn(),
    failOptimisticMessage: vi.fn(),
  };
  const transport = {
    send: vi.fn(async () => {
      throw sendError;
    }),
  } as unknown as EncryptedChatTransport;

  let resolveSettled!: (v: { kind: "terminal" | "transient" }) => void;
  const settled = new Promise<{ kind: "terminal" | "transient" }>((resolve) => {
    resolveSettled = resolve;
  });
  const worker = createOutboxWorker({
    outbox,
    transport,
    store,
    onTerminalFailure: () => resolveSettled({ kind: "terminal" }),
    onTransientFailure: () => resolveSettled({ kind: "transient" }),
  });
  worker.start();
  return { settled, calls, store, worker };
}

describe("outbox-worker — 'group not found' is terminal, not transient", () => {
  it("marks the row permanently failed on the FIRST attempt", async () => {
    const { settled, calls, store, worker } = harness(
      new Error('ChatMlsError.Internal("group not found")'),
    );
    const outcome = await settled;
    worker.stop();
    expect(outcome.kind).toBe("terminal");
    expect(calls.markPermanentlyFailed).toHaveBeenCalledTimes(1);
    expect(calls.markFailed).not.toHaveBeenCalled();
    expect(store.failOptimisticMessage).toHaveBeenCalledWith({
      chatId: "chat-1",
      clientMsgId: "client-msg-1",
    });
  });

  it("still retries genuinely transient failures with backoff", async () => {
    const { settled, calls, worker } = harness(
      new Error("network request failed"),
    );
    const outcome = await settled;
    worker.stop();
    expect(outcome.kind).toBe("transient");
    expect(calls.markFailed).toHaveBeenCalledTimes(1);
    expect(calls.markPermanentlyFailed).not.toHaveBeenCalled();
  });

  it("classifier matches the engine error shape case-insensitively", () => {
    expect(isTerminalSendReason('Internal("group not found")')).toBe(true);
    expect(isTerminalSendReason("Group Not Found")).toBe(true);
    expect(isTerminalSendReason("timeout waiting for ack")).toBe(false);
  });
});
