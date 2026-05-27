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
import type { ChatApi } from "./types";

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
  /** True once the user is signed in. Bootstrap waits for this so we don't
   *  fire chatList before auth lands. */
  authenticated: boolean;
  children: ReactNode;
}

export function ChatStoreProvider({
  api,
  transport,
  authenticated,
  children,
}: ChatStoreProviderProps) {
  const bootstrap = useChatStore((s) => s.bootstrap);
  const refresh = useChatStore((s) => s.refresh);
  const reset = useChatStore((s) => s.reset);
  const addIncomingMessage = useChatStore((s) => s.addIncomingMessage);

  // Initial bootstrap + sign-out reset.
  useEffect(() => {
    if (!authenticated) {
      reset();
      return;
    }
    void bootstrap(api);
  }, [authenticated, api, bootstrap, reset]);

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
