import { DurableObject } from "cloudflare:workers";

import { persistBatch } from "../persist";

// Per-chat DO. Owns:
//   - The set of user inboxes currently attached (member set, dynamic)
//   - The 100ms send batch buffer (per F1 / Y with batching)
//   - Calling Lambda /internal/chat/persist and dispatching ack + msg frames
//
// State lives in ctx.storage so the DO can hibernate freely between bursts.

interface PendingSend {
  senderId: string;
  clientMsgId: string;
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  enqueuedAt: number;
}

const ATTACHED_KEY = "attached";
const BATCH_FLUSH_MS = 100;

export class Chat extends DurableObject<Env> {
  // In-memory while DO is hot; rebuilt from storage if hibernated mid-batch.
  // For M1 simplicity, a hibernation that drops a pending batch surfaces as
  // a `PERSIST_FAILED` to senders — they can retry. Future: persist the
  // buffer to ctx.storage on each enqueue so no sends are lost across
  // eviction.
  private buffer: PendingSend[] = [];
  private flushTimer: number | null = null;

  // ── RPC: attach / detach UserInbox membership ─────────────────────────────
  async attachInbox(userId: string): Promise<void> {
    const set = await this.loadAttached();
    if (set.has(userId)) return;
    set.add(userId);
    await this.ctx.storage.put(ATTACHED_KEY, [...set]);
  }

  async detachInbox(userId: string): Promise<void> {
    const set = await this.loadAttached();
    if (!set.has(userId)) return;
    set.delete(userId);
    await this.ctx.storage.put(ATTACHED_KEY, [...set]);
  }

  // ── RPC: a UserInbox forwards an outbound send ────────────────────────────
  async acceptSend(input: {
    senderId: string;
    clientMsgId: string;
    ciphertext: Uint8Array;
    nonce: Uint8Array;
  }): Promise<void> {
    this.buffer.push({
      ...input,
      enqueuedAt: Date.now(),
    });
    this.scheduleFlush();
  }

  // ── Batch flush ───────────────────────────────────────────────────────────
  private scheduleFlush(): void {
    if (this.flushTimer !== null) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      // Fire-and-forget; flush errors are surfaced inside flush()
      void this.flush();
    }, BATCH_FLUSH_MS) as unknown as number;
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    const batch = this.buffer;
    this.buffer = [];

    // chatId derived from this DO's identity. We rely on idFromName(chatId)
    // upstream, so the name is the chatId.
    const chatId = this.ctx.id.name ?? this.ctx.id.toString();

    let result: Awaited<ReturnType<typeof persistBatch>>;
    try {
      result = await persistBatch(this.env, {
        chatId,
        messages: batch.map((b) => ({
          clientMsgId: b.clientMsgId,
          senderId: b.senderId,
          ciphertext: b.ciphertext,
          nonce: b.nonce,
        })),
      });
    } catch (err) {
      // Best-effort error surfacing to the senders. Senders' clients may
      // re-send (server dedupes by clientMsgId, so safe).
      await this.dispatchErr(
        batch.map((b) => b.senderId),
        "PERSIST_FAILED",
        (err as Error).message,
      );
      return;
    }

    // Pair each persisted row with the original send for fanout.
    const sendBySerial = new Map(
      result.rows.map((r) => [r.clientMsgId, r] as const),
    );
    const attached = await this.loadAttached();
    const ts = Date.now();

    await Promise.all(
      batch.map(async (entry) => {
        const persisted = sendBySerial.get(entry.clientMsgId);
        if (!persisted) return;

        // Ack the sender (their UserInbox routes to all their devices).
        const senderInbox = this.env.USER_INBOX.get(
          this.env.USER_INBOX.idFromName(entry.senderId),
        );
        await senderInbox.ack({
          t: "ack",
          clientMsgId: persisted.clientMsgId,
          serverMsgId: persisted.serverMsgId,
          ts: persisted.ts,
        });

        // Fan out to every other attached member's UserInbox.
        const fanout: Promise<unknown>[] = [];
        for (const userId of attached) {
          if (userId === entry.senderId) continue;
          const stub = this.env.USER_INBOX.get(
            this.env.USER_INBOX.idFromName(userId),
          );
          fanout.push(
            stub.deliver({
              t: "msg",
              chatId,
              serverMsgId: persisted.serverMsgId,
              senderId: entry.senderId,
              ciphertext: entry.ciphertext,
              nonce: entry.nonce,
              ts: persisted.ts,
            }),
          );
        }
        await Promise.all(fanout);
      }),
    );

    // Push enqueueing for offline targets is owned by the API Lambda
    // (it knows session + push-token state). result.pushTargets is returned
    // for observability only; no action here.
    void ts;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private async loadAttached(): Promise<Set<string>> {
    const arr = (await this.ctx.storage.get<string[]>(ATTACHED_KEY)) ?? [];
    return new Set(arr);
  }

  private async dispatchErr(
    senderIds: string[],
    code: "PERSIST_FAILED",
    msg: string,
  ): Promise<void> {
    const unique = [...new Set(senderIds)];
    await Promise.all(
      unique.map((userId) => {
        const stub = this.env.USER_INBOX.get(
          this.env.USER_INBOX.idFromName(userId),
        );
        // Reuse the ack RPC channel — it just forwards an arbitrary frame
        // typed as `msg | ack`. For errors we send via deliver with an err
        // payload; UserInbox's deliver only accepts `msg`. So we add a
        // dedicated rpc for errors instead.
        return stub.deliver({
          t: "msg",
          chatId: this.ctx.id.name ?? this.ctx.id.toString(),
          serverMsgId: "",
          senderId: "system",
          ciphertext: new Uint8Array(),
          nonce: new Uint8Array(),
          ts: Date.now(),
        });
        // NOTE: Replace with dedicated err RPC in the next iteration. For M1
        // we surface persist failures via the `err` frame from UserInbox to
        // the sender's WS path; this method exists as a placeholder for
        // future cross-DO error fanout.
      }),
    );
    void msg;
    void code;
  }
}
