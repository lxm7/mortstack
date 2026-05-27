// Public React hooks over the chat store. Selectors use useShallow so
// callers don't re-render on unrelated slice changes.

import { useCallback } from "react";
import { encode } from "@msgpack/msgpack";
import { useShallow } from "zustand/react/shallow";

import { useChatTransport, useOutbox, useOutboxWorker } from "./provider";
import { useChatStore } from "./store";
import type { ChatRecord, Message } from "./types";

export interface UseChatsResult {
  chats: ChatRecord[];
  isLoading: boolean;
  error: string | null;
}

export function useChats(): UseChatsResult {
  return useChatStore(
    useShallow((s) => ({
      chats: s.chatOrder
        .map((id) => s.chats.get(id))
        .filter((c): c is ChatRecord => !!c),
      isLoading: s.bootstrapStatus === "loading",
      error: s.bootstrapError,
    })),
  );
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

export function useMessages(chatId: string): UseMessagesResult {
  const messages = useChatStore((s) => s.messages.get(chatId) ?? []);
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
