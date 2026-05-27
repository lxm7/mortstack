// Public React hooks over the chat store. Selectors use useShallow so
// callers don't re-render on unrelated slice changes.

import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import { useChatTransport } from "./provider";
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

// Send-message hook. Adds an optimistic "sending" entry to the store,
// fires through the EncryptedChatTransport (which routes v=1 libsodium or
// v=2 MLS based on per-chat sticky state), then reconciles the optimistic
// to "sent" on ACK or to "failed" on transport rejection.
//
// Returns the locally-generated clientMsgId for the caller's tracking; the
// promise resolves with the same id and the assigned serverMsgId once the
// server has persisted + ACKed the send. Callers don't need to await — the
// store reflects the lifecycle automatically.
export interface UseSendMessageResult {
  send(input: {
    chatId: string;
    text: string;
    senderAuthUserId: string;
  }): {
    clientMsgId: string;
    done: Promise<{ serverMsgId: string } | null>;
  } | null;
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

      const done = (async () => {
        try {
          // v=2 MLS chats ignore `targets` — the engine routes by groupId.
          // v=1 legacy chats need fanout targets; not supported via this
          // hook in M4 (legacy chats are read-only in the M4 UI).
          const results = await transport.send({
            chatId: input.chatId,
            text: trimmed,
            targets: [],
          });
          const first = results[0];
          if (!first) {
            fail({ chatId: input.chatId, clientMsgId });
            return null;
          }
          confirm({
            chatId: input.chatId,
            clientMsgId,
            serverMsgId: first.serverMsgId,
            ts: first.ts,
          });
          return { serverMsgId: first.serverMsgId };
        } catch (err) {
          console.warn("[chat] send failed", err);
          fail({ chatId: input.chatId, clientMsgId });
          return null;
        }
      })();

      return { clientMsgId, done };
    },
    [addOptimistic, confirm, fail, transport],
  );
  return { send };
}
