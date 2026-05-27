// ChatStoreProvider — wires the store to the API + transport at app root.
// Sits inside ChatTransportProvider so it can subscribe to incoming
// messages and the mls-welcome wake-up to refresh the chat list.
//
// Also exposes the transport to descendants via internal context so hooks
// like useSendMessage can issue sends without the consumer threading the
// transport through every call site.

import { createContext, useContext, useEffect, type ReactNode } from "react";

import type { EncryptedChatTransport } from "./encrypted-transport";
import { useChatStore } from "./store";
import type { ChatApi, MessagePersistApi } from "./types";

const ChatTransportContext = createContext<EncryptedChatTransport | null>(null);

export function useChatTransport(): EncryptedChatTransport {
  const t = useContext(ChatTransportContext);
  if (!t) {
    throw new Error("useChatTransport must be used inside <ChatStoreProvider>");
  }
  return t;
}

export interface ChatStoreProviderProps {
  api: ChatApi;
  transport: EncryptedChatTransport;
  /** Optional local message persistence (M4-followup #25). When supplied,
   *  the store fires-and-forgets writes on every message lifecycle event,
   *  and the provider rehydrates per-chat messages after bootstrap. */
  messagePersist?: MessagePersistApi;
  /** True once the user is signed in. Bootstrap waits for this so we don't
   *  fire chatList before auth lands. */
  authenticated: boolean;
  children: ReactNode;
}

export function ChatStoreProvider({
  api,
  transport,
  messagePersist,
  authenticated,
  children,
}: ChatStoreProviderProps) {
  const bootstrap = useChatStore((s) => s.bootstrap);
  const refresh = useChatStore((s) => s.refresh);
  const reset = useChatStore((s) => s.reset);
  const addIncomingMessage = useChatStore((s) => s.addIncomingMessage);
  const setPersistApi = useChatStore((s) => s.setPersistApi);
  const hydrateMessages = useChatStore((s) => s.hydrateMessages);

  // Plug local persistence into the store while the provider is mounted.
  // Decoupled from `authenticated` because reset() preserves the persistApi
  // by design — we want sign-out to clear in-memory state without
  // detaching the storage backend.
  useEffect(() => {
    setPersistApi(messagePersist ?? null);
    return () => setPersistApi(null);
  }, [messagePersist, setPersistApi]);

  // Initial bootstrap + sign-out reset. After chat.list returns, hydrate
  // each chat's plaintext history from the local store so cold launches
  // render prior messages without depending on the MLS ratchet (one-shot
  // decrypt per ciphertext — see M4-followup #25).
  useEffect(() => {
    if (!authenticated) {
      reset();
      return;
    }
    void (async () => {
      await bootstrap(api);
      if (!messagePersist) return;
      const chatIds = Array.from(useChatStore.getState().chats.keys());
      await Promise.all(
        chatIds.map(async (chatId) => {
          try {
            const persisted = await messagePersist.load(chatId);
            if (persisted.length > 0) hydrateMessages(chatId, persisted);
          } catch (err) {
            console.warn("[chat] hydrate failed for", chatId, err);
          }
        }),
      );
    })();
  }, [authenticated, api, bootstrap, hydrateMessages, messagePersist, reset]);

  // Refresh on (re)connect — picks up chats created while offline + any
  // changes another device made.
  useEffect(() => {
    if (!authenticated) return;
    return transport.onState((state) => {
      if (state === "open") void refresh(api);
    });
  }, [authenticated, api, refresh, transport]);

  // Server-pushed wake-up: a new chat (or a member-add) landed for us. The
  // MLS auto-publish loop already polls the Welcome; we additionally
  // refresh the chat list so the new row appears immediately.
  useEffect(() => {
    if (!authenticated) return;
    return transport.onMlsWelcome(() => {
      void refresh(api);
    });
  }, [authenticated, api, refresh, transport]);

  // Live message ingestion. The transport already decrypts (v=1 libsodium
  // or v=2 MLS) and surfaces a ChatFrame with plaintext text + ts.
  useEffect(() => {
    if (!authenticated) return;
    return transport.onMessage((msg) => {
      addIncomingMessage({
        chatId: msg.chatId,
        serverMsgId: msg.serverMsgId,
        senderAuthUserId: msg.senderId,
        text: msg.frame.text,
        ts: msg.ts,
      });
    });
  }, [authenticated, addIncomingMessage, transport]);

  return (
    <ChatTransportContext.Provider value={transport}>
      {children}
    </ChatTransportContext.Provider>
  );
}
