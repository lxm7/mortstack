// Public React hooks over the chat store. Selectors use useShallow so
// callers don't re-render on unrelated slice changes.

import { useCallback, useEffect, useRef } from "react";
import { encode } from "@msgpack/msgpack";
import { useShallow } from "zustand/react/shallow";

import { useChatTransport, useOutbox, useOutboxWorker } from "./provider";
import { useChatStore } from "./store";
import type { ChatRecord, Message, Reaction } from "./types";

export interface UseChatsResult {
  chats: ChatRecord[];
  isLoading: boolean;
  error: string | null;
}

// A stable empty array so selectors that fall back to "no items" return the
// same reference every call — a fresh `[]` (or `.map()` result) would make
// useSyncExternalStore see a new snapshot each render → infinite update loop.
const EMPTY_CHATS: ChatRecord[] = [];

export function useChats(): UseChatsResult {
  // Select the derived array DIRECTLY under useShallow so it shallow-compares
  // the elements (stable while chat records + order are unchanged). Wrapping
  // it in an object instead would make useShallow compare the array by
  // reference — always "changed" → re-render loop. Scalars are selected
  // separately; primitives are Object.is-stable without useShallow.
  const chats = useChatStore(
    useShallow((s) => {
      if (s.chatOrder.length === 0) return EMPTY_CHATS;
      return s.chatOrder
        .map((id) => s.chats.get(id))
        .filter((c): c is ChatRecord => !!c);
    }),
  );
  const isLoading = useChatStore((s) => s.bootstrapStatus === "loading");
  const error = useChatStore((s) => s.bootstrapError);
  return { chats, isLoading, error };
}

export interface UseChatResult {
  chat: ChatRecord | null;
}

export function useChat(chatId: string | null | undefined): UseChatResult {
  const chat = useChatStore((s) =>
    chatId ? (s.chats.get(chatId) ?? null) : null,
  );
  return { chat };
}

export interface UseMessagesResult {
  messages: Message[];
}

const EMPTY_MESSAGES: Message[] = [];

export function useMessages(chatId: string): UseMessagesResult {
  // Stable EMPTY_MESSAGES fallback (not `?? []`) — a fresh array on every call
  // yields an unstable snapshot → "Maximum update depth exceeded".
  const messages = useChatStore(
    (s) => s.messages.get(chatId) ?? EMPTY_MESSAGES,
  );
  return { messages };
}

// Send-message hook. Inserts a "sending" optimistic message immediately,
// then enqueues the payload to the outbox; the worker picks it up + flips
// the row to "sent" on server ack or "failed" after MAX_ATTEMPTS retries.
//
// When the provider was wired WITHOUT an outbox (tests, legacy debug
// screen) the hook falls back to firing transport.send directly so the
// pre-outbox call path keeps working — a transient WS hiccup will still
// land the message at "failed" in that mode, with no auto-retry.
export interface UseSendMessageResult {
  send(input: {
    chatId: string;
    text: string;
    senderAuthUserId: string;
  }): { clientMsgId: string } | null;
}

export interface UseRetryMessageResult {
  retry(input: { chatId: string; clientMsgId: string }): Promise<void>;
}

export interface UseDeleteMessageResult {
  delete(input: { chatId: string; clientMsgId: string }): Promise<void>;
}

function randomClientMsgId(): string {
  // 21-char id, mirrors the underlying transport's clientMsgId width but
  // doesn't have to match — the store keys by THIS id; the transport
  // generates its own internally for ack matching.
  return `c-${Math.random().toString(36).slice(2, 12)}${Math.random()
    .toString(36)
    .slice(2, 11)}`;
}

export function useSendMessage(): UseSendMessageResult {
  const addOptimistic = useChatStore((s) => s.addOptimisticMessage);
  const confirm = useChatStore((s) => s.confirmOptimisticMessage);
  const fail = useChatStore((s) => s.failOptimisticMessage);
  const transport = useChatTransport();
  const outbox = useOutbox();
  const worker = useOutboxWorker();

  const send = useCallback(
    (input: { chatId: string; text: string; senderAuthUserId: string }) => {
      const trimmed = input.text.trim();
      if (trimmed.length === 0) return null;
      const clientMsgId = randomClientMsgId();
      addOptimistic({
        chatId: input.chatId,
        clientMsgId,
        senderAuthUserId: input.senderAuthUserId,
        text: trimmed,
      });

      if (outbox && worker) {
        // Outbox path: encode plaintext + enqueue + kick. The worker
        // handles encryption + send + retry. The plaintext frame stored
        // here mirrors what crypto-pipe encodes pre-MLS-encrypt; keeping
        // them aligned makes the schema additive (e.g. attachments later).
        const payload = encode({ text: trimmed });
        void (async () => {
          try {
            await outbox.enqueue({
              id: clientMsgId,
              chatId: input.chatId,
              payload,
              idempotencyKey: clientMsgId,
            });
            worker.kick();
          } catch (err) {
            console.warn("[chat] outbox enqueue failed", err);
            fail({ chatId: input.chatId, clientMsgId });
          }
        })();
        return { clientMsgId };
      }

      // Fallback: direct transport.send without retry. Used by tests + the
      // chat-db-debug screen until an outbox is wired everywhere.
      void (async () => {
        try {
          const results = await transport.send({
            chatId: input.chatId,
            text: trimmed,
            targets: [],
            clientMsgId,
          });
          const first = results[0];
          if (!first) {
            fail({ chatId: input.chatId, clientMsgId });
            return;
          }
          confirm({
            chatId: input.chatId,
            clientMsgId,
            serverMsgId: first.serverMsgId,
            ts: first.ts,
          });
        } catch (err) {
          console.warn("[chat] send failed", err);
          fail({ chatId: input.chatId, clientMsgId });
        }
      })();
      return { clientMsgId };
    },
    [addOptimistic, confirm, fail, outbox, transport, worker],
  );
  return { send };
}

// User-triggered retry on a failed bubble. Flips store status back to
// "sending" immediately for instant UI feedback, then asks the worker to
// requeue the outbox row + kick a dispatch. No-op if the outbox isn't
// wired (caller should hide the retry affordance in that case).
export function useRetryMessage(): UseRetryMessageResult {
  const retryStore = useChatStore((s) => s.retryOptimisticMessage);
  const worker = useOutboxWorker();

  const retry = useCallback(
    async (input: { chatId: string; clientMsgId: string }) => {
      retryStore(input);
      if (!worker) return;
      try {
        await worker.retry(input.clientMsgId);
      } catch (err) {
        console.warn("[chat] retry failed", err);
      }
    },
    [retryStore, worker],
  );
  return { retry };
}

// Local delete of a failed message. Removes from the in-memory list +
// drops the outbox row so it never re-dispatches. Persistence-layer delete
// (chat-db.messages-store) is the caller's concern via persistApi — the
// hook does NOT touch the messages table directly to keep this package
// free of an op-sqlite dependency.
export function useDeleteMessage(): UseDeleteMessageResult {
  const remove = useChatStore((s) => s.removeMessageByClientMsgId);
  const outbox = useOutbox();

  const del = useCallback(
    async (input: { chatId: string; clientMsgId: string }) => {
      remove(input);
      if (!outbox) return;
      try {
        // markSent's DELETE FROM pending_outbox is exactly the "drop the
        // row" semantics we want here — the name is unfortunate but the
        // SQL is identical. Aliased here for readability at call sites.
        await outbox.markSent(input.clientMsgId);
      } catch (err) {
        console.warn("[chat] outbox drop failed", err);
      }
    },
    [outbox, remove],
  );
  return { delete: del };
}

// React-to-message hook (M8). Toggles the given emoji on a message: if the
// user already has it on that target → op "del", else → op "add". The reaction
// rides the same encrypted outbox path as a message (Option A) — it's an MLS
// application message carrying a "rx" frame, so per-chat FIFO/generation order
// is preserved across retries. Optimistic: the pill appears (add) or disappears
// (del) immediately; the worker reconciles on ack.
export interface UseReactToMessageResult {
  react(input: {
    chatId: string;
    /** serverSerial (string) of the message being reacted to. */
    target: string;
    emoji: string;
    senderAuthUserId: string;
  }): void;
}

export function useReactToMessage(): UseReactToMessageResult {
  const addOptimistic = useChatStore((s) => s.addOptimisticReaction);
  const removeOwn = useChatStore((s) => s.removeOwnReaction);
  const confirm = useChatStore((s) => s.confirmReaction);
  const fail = useChatStore((s) => s.failReaction);
  const transport = useChatTransport();
  const outbox = useOutbox();
  const worker = useOutboxWorker();

  const react = useCallback(
    (input: {
      chatId: string;
      target: string;
      emoji: string;
      senderAuthUserId: string;
    }) => {
      // Toggle: derive op from current state. getState() reads synchronously —
      // this is an event handler, not render, so it's safe + avoids a subscription.
      const perChat = useChatStore.getState().reactions.get(input.chatId);
      const mine = (perChat?.get(input.target) ?? []).some(
        (r) =>
          r.senderAuthUserId === input.senderAuthUserId &&
          r.emoji === input.emoji,
      );
      const op: "add" | "del" = mine ? "del" : "add";
      const clientMsgId = randomClientMsgId();

      if (op === "add") {
        addOptimistic({
          chatId: input.chatId,
          clientMsgId,
          target: input.target,
          emoji: input.emoji,
          senderAuthUserId: input.senderAuthUserId,
        });
      } else {
        removeOwn({
          chatId: input.chatId,
          target: input.target,
          emoji: input.emoji,
          senderAuthUserId: input.senderAuthUserId,
        });
      }

      if (outbox && worker) {
        const payload = encode({
          kind: "rx",
          target: input.target,
          emoji: input.emoji,
          op,
        });
        void (async () => {
          try {
            await outbox.enqueue({
              id: clientMsgId,
              chatId: input.chatId,
              payload,
              idempotencyKey: clientMsgId,
            });
            worker.kick();
          } catch (err) {
            console.warn("[chat] reaction enqueue failed", err);
            // Only "add" has a pill to roll back; a failed "del" reconciles on
            // reload (in-memory, demo-scoped).
            if (op === "add") fail({ chatId: input.chatId, clientMsgId });
          }
        })();
        return;
      }

      // Fallback: direct send without retry (tests, pre-outbox screens).
      void (async () => {
        try {
          const results = await transport.send({
            chatId: input.chatId,
            reaction: { target: input.target, emoji: input.emoji, op },
            targets: [],
            clientMsgId,
          });
          if (!results[0]) throw new Error("transport returned no results");
          if (op === "add") confirm({ chatId: input.chatId, clientMsgId });
        } catch (err) {
          console.warn("[chat] reaction send failed", err);
          if (op === "add") fail({ chatId: input.chatId, clientMsgId });
        }
      })();
    },
    [addOptimistic, removeOwn, confirm, fail, outbox, transport, worker],
  );
  return { react };
}

// Selector hook: reactions folded onto a chat's messages, keyed by target
// serverSerial. Stable empty-map fallback to avoid re-render loops.
const EMPTY_REACTIONS: ReadonlyMap<string, Reaction[]> = new Map();

export function useReactions(chatId: string): ReadonlyMap<string, Reaction[]> {
  return useChatStore((s) => s.reactions.get(chatId) ?? EMPTY_REACTIONS);
}

// Selector hook: userIds currently typing in a chat (excluding an optional
// self id). Filters by expiry at read time as a belt-and-suspenders alongside
// the provider's sweep timer. useShallow keeps the array reference stable while
// the typer set is unchanged, avoiding re-render loops.
const EMPTY_TYPERS: string[] = [];

export function useTypers(chatId: string, excludeUserId?: string): string[] {
  return useChatStore(
    useShallow((s) => {
      const perChat = s.typing.get(chatId);
      if (!perChat || perChat.size === 0) return EMPTY_TYPERS;
      const now = Date.now();
      const out: string[] = [];
      for (const [userId, expiresAt] of perChat) {
        if (expiresAt > now && userId !== excludeUserId) out.push(userId);
      }
      return out.length === 0 ? EMPTY_TYPERS : out;
    }),
  );
}

// Selector hook: whether my outgoing message (by serverSerial) has been read by
// any peer — i.e. some member other than me has a read watermark ≥ its serial.
// Returns a boolean (Object.is-stable, no useShallow needed).
export function useIsReadByPeer(
  chatId: string,
  serverSerial: string | undefined,
  myAuthUserId: string | null,
): boolean {
  return useChatStore((s) => {
    if (!serverSerial) return false;
    const perChat = s.readReceipts.get(chatId);
    if (!perChat) return false;
    let target: bigint;
    try {
      target = BigInt(serverSerial);
    } catch {
      return false;
    }
    for (const [userId, upto] of perChat) {
      if (userId === myAuthUserId) continue;
      try {
        if (BigInt(upto) >= target) return true;
      } catch {
        // skip a malformed watermark
      }
    }
    return false;
  });
}

// Typing-emitter hook. Wire onActivity() to the composer's onChangeText and
// stop() to send/blur. Emits `on:true` on first activity, re-emits as a ~3s
// heartbeat while composing (keeps the receiver's 6s TTL alive), and `on:false`
// after a 4s idle gap or an explicit stop().
const TYPING_HEARTBEAT_MS = 3_000;
const TYPING_IDLE_MS = 4_000;

export interface UseTypingEmitterResult {
  onActivity(): void;
  stop(): void;
}

export function useTypingEmitter(chatId: string): UseTypingEmitterResult {
  const transport = useChatTransport();
  const activeRef = useRef(false);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (idleRef.current) {
      clearTimeout(idleRef.current);
      idleRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearTimers();
    if (!activeRef.current) return;
    activeRef.current = false;
    transport.sendTyping({ chatId, on: false });
  }, [chatId, clearTimers, transport]);

  const onActivity = useCallback(() => {
    if (!activeRef.current) {
      activeRef.current = true;
      transport.sendTyping({ chatId, on: true });
      heartbeatRef.current = setInterval(() => {
        transport.sendTyping({ chatId, on: true });
      }, TYPING_HEARTBEAT_MS);
    }
    if (idleRef.current) clearTimeout(idleRef.current);
    idleRef.current = setTimeout(stop, TYPING_IDLE_MS);
  }, [chatId, stop, transport]);

  // Stop + clear on unmount or chat change so a "typing…" doesn't leak into a
  // thread the user left. Cleanup runs the previous chatId's stop().
  useEffect(() => stop, [stop]);

  return { onActivity, stop };
}

// Read-emitter hook. Call markRead(serverSerial) when the newest visible
// message changes (thread focus / list viewability). Monotonic + deduped so we
// only emit when the watermark advances. Gated by `enabled` — the symmetric
// read-receipts privacy toggle (#8); when off we emit nothing (and, per the
// symmetric model, the UI also suppresses peers' receipts).
export interface UseReadEmitterResult {
  markRead(serverSerial: string): void;
}

export function useReadEmitter(
  chatId: string,
  enabled: boolean,
): UseReadEmitterResult {
  const transport = useChatTransport();
  const lastSentRef = useRef<bigint | null>(null);

  const markRead = useCallback(
    (serverSerial: string) => {
      if (!enabled) return;
      let serial: bigint;
      try {
        serial = BigInt(serverSerial);
      } catch {
        return;
      }
      if (lastSentRef.current !== null && serial <= lastSentRef.current) return;
      lastSentRef.current = serial;
      transport.sendRead({ chatId, upto: serverSerial });
    },
    [chatId, enabled, transport],
  );

  // Reset the watermark when switching chats so the first read in a new thread
  // always emits.
  useEffect(() => {
    lastSentRef.current = null;
  }, [chatId]);

  return { markRead };
}
