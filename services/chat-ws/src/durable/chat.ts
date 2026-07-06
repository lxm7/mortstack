import { DurableObject } from "cloudflare:workers";

import { getPersistClient, type PersistMessageInput } from "../persist";
import { bytesToBase64, publishChatDelivered } from "../push-publish";

// Per-chat DO. Owns:
//   - The set of user inboxes currently attached (member set, dynamic)
//   - The 100ms send batch buffer (per F1 / Y with batching)
//   - In-memory monotonic `serverSerial` counter (ADR-012)
//   - Writing batches to Neon HTTP via @repo/db-edge (ADR-010)
//   - Dispatching ack + msg frames to UserInbox DOs (batched per recipient)
//
// State that must survive hibernation lives in ctx.storage:
//   - "attached"   : string[]  — user ids attached to this chat
//   - "buffer"     : PendingSend[] — unflushed sends (recovery after eviction)
//   - "nextSerial" : string (BigInt) — next serverSerial to assign

interface PendingSend {
  senderId: string;
  clientMsgId: string;
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  enqueuedAt: number;
  // Mirror of the `unencrypted` envelope flag — propagated through fanout so
  // recipients can skip decryption. Not persisted to ChatMessage in M3;
  // replayed history of unencrypted group messages will need a new column.
  unencrypted?: boolean;
}

const ATTACHED_KEY = "attached";
const BUFFER_KEY = "buffer";
const NEXT_SERIAL_KEY = "nextSerial";
const BATCH_FLUSH_MS = 100;
// Cap for the per-recipient UserInbox attachedDeviceIds() fan-out before
// publishing chat.msg.delivered. Above this size the cost of the parallel
// stub calls outweighs the dedupe benefit; APNs collapse_id covers
// recipient-side duplicate suppression instead.
const PRESENCE_HINT_MAX = 50;

export class Chat extends DurableObject<Env> {
  // In-memory mirrors of ctx.storage. Loaded lazily on first use after a hot
  // start; refreshed transparently after hibernation.
  private buffer: PendingSend[] = [];
  private bufferLoaded = false;
  private nextSerial: bigint | null = null;
  private flushTimer: number | null = null;
  // Authoritative ChatMember set, cached to gate ephemeral typ/read signals
  // without a Postgres round-trip per frame (typing heartbeats fire ~every 3s).
  // Short TTL bounds staleness for add/remove-member (a removed member can spoof
  // for at most MEMBER_CACHE_TTL_MS; a new member is briefly denied) — an
  // acceptable window for plaintext metadata signals.
  private memberCache: { ids: Set<string>; at: number } | null = null;
  private static readonly MEMBER_CACHE_TTL_MS = 30_000;

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

  // ── RPC: typing relay (ephemeral — no persistence, no storage, no alarm) ──
  // A UserInbox forwards a typing signal. Pure fanout to every *other* attached
  // member. Expiry lives on the receiver client (short timer refreshed by the
  // sender's ~3s `on:true` heartbeat), so a dropped `on:false` self-clears
  // without any server-side TTL — keeps this hibernation-proof and stateless.
  async acceptTyping(input: { userId: string; on: boolean }): Promise<void> {
    const chatId = this.ctx.id.name ?? this.ctx.id.toString();
    // Authorization: typing/read frames carry a client-supplied chatId with no
    // crypto barrier (unlike `send`, whose secrecy rests on E2EE). Gate on the
    // authoritative member set so a client can't spoof presence into a chat it
    // isn't in.
    if (!(await this.isMember(chatId, input.userId))) return;
    const attached = await this.loadAttached();
    await Promise.all(
      [...attached]
        .filter((userId) => userId !== input.userId)
        .map((userId) => {
          const stub = this.env.USER_INBOX.get(
            this.env.USER_INBOX.idFromName(userId),
          );
          return stub.deliverTyping({
            chatId,
            userId: input.userId,
            on: input.on,
          });
        }),
    );
  }

  // ── RPC: read receipt (persist watermark + fanout) ────────────────────────
  // A UserInbox forwards a read high-water-mark. Persist it (monotonic) to
  // ChatMember.lastReadSerial, then fan out to every *other* attached member so
  // their outgoing bubbles flip sent → read live. Offline members reconcile the
  // watermark from ChatMember on their next chat load.
  async acceptRead(input: { userId: string; upto: string }): Promise<void> {
    const chatId = this.ctx.id.name ?? this.ctx.id.toString();
    // Same authorization gate as acceptTyping — a non-member must not be able to
    // spoof a read receipt (fanned out to real members) into this chat.
    if (!(await this.isMember(chatId, input.userId))) return;
    let serial: bigint;
    try {
      serial = BigInt(input.upto);
    } catch {
      // Malformed watermark — drop silently (content-blind soft handling).
      return;
    }

    const db = getPersistClient(this.env);
    await db.updateLastReadSerial(chatId, input.userId, serial);

    const attached = await this.loadAttached();
    await Promise.all(
      [...attached]
        .filter((userId) => userId !== input.userId)
        .map((userId) => {
          const stub = this.env.USER_INBOX.get(
            this.env.USER_INBOX.idFromName(userId),
          );
          return stub.deliverRead({
            chatId,
            userId: input.userId,
            upto: input.upto,
          });
        }),
    );
  }

  // ── RPC: a UserInbox forwards an outbound send ────────────────────────────
  async acceptSend(input: {
    senderId: string;
    clientMsgId: string;
    ciphertext: Uint8Array;
    nonce: Uint8Array;
    unencrypted?: boolean;
  }): Promise<void> {
    await this.ensureBufferLoaded();
    this.buffer.push({ ...input, enqueuedAt: Date.now() });
    // Persist buffer so hibernation mid-batch doesn't drop sends. The flush
    // path is responsible for clearing it atomically with the serial advance.
    await this.ctx.storage.put(BUFFER_KEY, this.buffer);
    this.scheduleFlush();
  }

  // ── Batch flush ───────────────────────────────────────────────────────────
  private scheduleFlush(): void {
    if (this.flushTimer !== null) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      void this.flush();
    }, BATCH_FLUSH_MS) as unknown as number;
  }

  private async flush(): Promise<void> {
    await this.ensureBufferLoaded();
    if (this.buffer.length === 0) return;

    const batch = this.buffer;
    // Don't clear in-memory buffer until persist succeeds AND ctx.storage
    // advance lands. If flush throws, next scheduled flush picks up the same
    // entries (idempotent via clientMsgId unique constraint + ON CONFLICT).
    const chatId = this.ctx.id.name ?? this.ctx.id.toString();
    const db = getPersistClient(this.env);

    await this.ensureSerialRecovered(chatId, db);

    interface AssignedSend {
      entry: PendingSend;
      serverSerial: bigint;
      ts: Date;
    }
    const assigned: AssignedSend[] = [];

    for (const entry of batch) {
      const row = await this.insertWithRetry(db, chatId, entry);
      if (!row) {
        // Persist failed twice — surface to the sender via err frame. Leaves
        // the entry in the buffer (caller may retry via flush rescheduling).
        await this.dispatchErr(
          [entry.senderId],
          "PERSIST_FAILED",
          "could not persist after retry",
        );
        return;
      }
      assigned.push({
        entry,
        serverSerial: row.serverSerial,
        ts: row.createdAt,
      });
    }

    // Atomic: clear buffer + advance counter together. If this transaction
    // fails, in-memory state still matches storage (counter was already
    // bumped to nextSerial); next cold start recovers via ON CONFLICT path.
    await this.ctx.storage.transaction(async (tx) => {
      await tx.delete(BUFFER_KEY);
      await tx.put(NEXT_SERIAL_KEY, this.nextSerial!.toString());
    });
    this.buffer = [];

    // Backfill skip-cache (docs/message-backfill.md): publish this chat's max
    // served serial so a warm reconnect can skip the Neon backfill read.
    // Best-effort — mirrors the ADR-017 session-cache write. A dropped write is
    // absorbed by the backfill invariant (full-range query rewritten by the next
    // send), so it is non-fatal and deliberately not awaited. No TTL: a
    // long-lived entry keeps warm skips valid; correctness never depends on it.
    if (this.env.CHAT_MAX_CACHE) {
      void this.env.CHAT_MAX_CACHE.put(
        `chatmax:${chatId}`,
        (this.nextSerial! - 1n).toString(),
      ).catch(() => {});
    }

    // ── Fanout (ADR-010, Track C batched) ──────────────────────────────────
    // Collapse N×M individual RPCs into one deliverBatch per recipient.
    const attached = await this.loadAttached();
    const perRecipient = new Map<
      string,
      Parameters<UserInbox["deliverBatch"]>[0]
    >();
    const perSender = new Map<string, Parameters<UserInbox["ackBatch"]>[0]>();

    for (const a of assigned) {
      const serverMsgId = a.serverSerial.toString();
      const tsMs = a.ts.getTime();

      // Ack for the sender's devices.
      let acks = perSender.get(a.entry.senderId);
      if (!acks) {
        acks = [];
        perSender.set(a.entry.senderId, acks);
      }
      acks.push({
        clientMsgId: a.entry.clientMsgId,
        serverMsgId,
        ts: tsMs,
      });

      // Msg fanout to every other attached member.
      for (const userId of attached) {
        if (userId === a.entry.senderId) continue;
        let msgs = perRecipient.get(userId);
        if (!msgs) {
          msgs = [];
          perRecipient.set(userId, msgs);
        }
        msgs.push({
          chatId,
          serverMsgId,
          senderId: a.entry.senderId,
          ciphertext: a.entry.ciphertext,
          nonce: a.entry.nonce,
          ts: tsMs,
          // Only include the flag when true to keep msgpack frames small for
          // the common 1:1 encrypted case.
          ...(a.entry.unencrypted === true ? { unencrypted: true } : {}),
        });
      }
    }

    const acks = [...perSender.entries()].map(([userId, frames]) => {
      const stub = this.env.USER_INBOX.get(
        this.env.USER_INBOX.idFromName(userId),
      );
      return stub.ackBatch(frames);
    });
    const fanout = [...perRecipient.entries()].map(([userId, frames]) => {
      const stub = this.env.USER_INBOX.get(
        this.env.USER_INBOX.idFromName(userId),
      );
      return stub.deliverBatch(frames);
    });
    await Promise.all([...acks, ...fanout]);

    // ── Push fanout (ADR-013) ─────────────────────────────────────────────
    // SNS publish per persisted message. The chat-push Lambda (M6) consumes
    // chatPushQueue and dispatches APNs/FCM. Publish failures are non-fatal
    // — message is already persisted; a reconciliation Worker (deferred)
    // catches any drops.
    //
    // Presence hint (D2): collect the deviceIds currently attached over WS
    // for each recipient and attach to the event. Lambda skips push for
    // these. Cap PRESENCE_HINT_MAX recipients — for groups above the cap
    // we skip the hint entirely and let APNs collapse_id de-dupe at the
    // device. The 50-stub Promise.all is ~5-10ms; larger groups would
    // contend with the persist budget.
    const allMembers = await db.memberIds(chatId);
    const recipientUserIds = allMembers.filter(
      (u) => u !== assigned[0]?.entry.senderId,
    );

    let attachedDeviceIds: string[] = [];
    if (
      recipientUserIds.length > 0 &&
      recipientUserIds.length <= PRESENCE_HINT_MAX
    ) {
      const stubs = recipientUserIds.map((uid) =>
        this.env.USER_INBOX.get(this.env.USER_INBOX.idFromName(uid)),
      );
      const results = await Promise.all(
        stubs.map((s) => s.attachedDeviceIds().catch(() => [] as string[])),
      );
      const flat = new Set<string>();
      for (const list of results) for (const id of list) flat.add(id);
      attachedDeviceIds = [...flat];
    }

    for (const a of assigned) {
      const recipients = allMembers.filter((u) => u !== a.entry.senderId);
      if (recipients.length === 0) continue;
      void publishChatDelivered(this.env, {
        chatId,
        serverMsgId: a.serverSerial.toString(),
        senderId: a.entry.senderId,
        recipientIds: recipients,
        attachedDeviceIds,
        ciphertextB64: bytesToBase64(a.entry.ciphertext),
        nonceB64: bytesToBase64(a.entry.nonce),
        ts: a.ts.getTime(),
      });
    }
  }

  // Insert a row. On PK conflict (counter regression after a prior partial
  // failure), recover via MAX(serverSerial)+1 and retry once. After two
  // failures we give up and surface PERSIST_FAILED to the sender.
  private async insertWithRetry(
    db: ReturnType<typeof getPersistClient>,
    chatId: string,
    entry: PendingSend,
  ): Promise<{ serverSerial: bigint; createdAt: Date } | null> {
    for (let attempt = 0; attempt < 2; attempt++) {
      const serial = this.nextSerial!;
      const input: PersistMessageInput = {
        chatId,
        serverSerial: serial,
        senderId: entry.senderId,
        clientMsgId: entry.clientMsgId,
        ciphertext: entry.ciphertext,
        nonce: entry.nonce,
      };
      try {
        const ok = await db.insertMessage(input);
        if (ok) {
          this.nextSerial = serial + 1n;
          return { serverSerial: serial, createdAt: new Date() };
        }
      } catch {
        // Network / transient error — retry with same serial.
        if (attempt === 0) continue;
        return null;
      }
      // Conflict: serial collided. Recover and retry once.
      const actualMax = await db.maxSerial(chatId);
      this.nextSerial = actualMax + 1n;
    }
    return null;
  }

  // ── State recovery ────────────────────────────────────────────────────────
  private async ensureBufferLoaded(): Promise<void> {
    if (this.bufferLoaded) return;
    const stored =
      (await this.ctx.storage.get<PendingSend[]>(BUFFER_KEY)) ?? [];
    this.buffer = stored;
    this.bufferLoaded = true;
  }

  private async ensureSerialRecovered(
    chatId: string,
    db: ReturnType<typeof getPersistClient>,
  ): Promise<void> {
    if (this.nextSerial !== null) return;
    const stored = await this.ctx.storage.get<string>(NEXT_SERIAL_KEY);
    if (stored !== undefined) {
      this.nextSerial = BigInt(stored);
      return;
    }
    // Cold start with no persisted counter — recover from DB MAX. First-ever
    // message in this chat sees MAX = 0n, so nextSerial = 1n.
    const max = await db.maxSerial(chatId);
    this.nextSerial = max + 1n;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private async loadAttached(): Promise<Set<string>> {
    const arr = (await this.ctx.storage.get<string[]>(ATTACHED_KEY)) ?? [];
    return new Set(arr);
  }

  // Membership check against the authoritative ChatMember set, memoised with a
  // short TTL so hot paths (typing heartbeats) don't hit Postgres per frame.
  private async isMember(chatId: string, userId: string): Promise<boolean> {
    const now = Date.now();
    if (
      !this.memberCache ||
      now - this.memberCache.at > Chat.MEMBER_CACHE_TTL_MS
    ) {
      const db = getPersistClient(this.env);
      const ids = await db.memberIds(chatId);
      this.memberCache = { ids: new Set(ids), at: now };
    }
    return this.memberCache.ids.has(userId);
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
        return stub.error({ code, msg });
      }),
    );
  }
}

// Forward-declared type so the perRecipient/perSender Maps typecheck against
// UserInbox's RPC surface. The real UserInbox lives in ../durable/user-inbox.
type UserInbox = import("./user-inbox").UserInbox;
