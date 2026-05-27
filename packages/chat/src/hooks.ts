// Public React hooks over the chat store. Selectors use useShallow so
// callers don't re-render on unrelated slice changes.

import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

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

// Send-message hook surface stub. M4-6 fills in the actual MLS encrypt +
// transport.send + ACK reconciliation. Today it adds a local optimistic
// message and returns its clientMsgId; nothing is shipped to the wire.
export interface UseSendMessageResult {
  send(input: {
    chatId: string;
    text: string;
    senderAuthUserId: string;
  }): string | null;
}

export function useSendMessage(): UseSendMessageResult {
  const addOptimistic = useChatStore((s) => s.addOptimisticMessage);
  const send = useCallback(
    (input: { chatId: string; text: string; senderAuthUserId: string }) => {
      const trimmed = input.text.trim();
      if (trimmed.length === 0) return null;
      const clientMsgId = `c-${Math.random().toString(36).slice(2)}-${Date.now()}`;
      addOptimistic({
        chatId: input.chatId,
        clientMsgId,
        senderAuthUserId: input.senderAuthUserId,
        text: trimmed,
      });
      // M4-6: encrypt via MlsClient.engine.encryptApp → transport.send →
      // confirmOptimisticMessage on ACK.
      return clientMsgId;
    },
    [addOptimistic],
  );
  return { send };
}
