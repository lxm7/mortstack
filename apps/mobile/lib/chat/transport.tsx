import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppState, type AppStateStatus } from "react-native";

import {
  createChatTransport,
  type ConnectionState,
} from "@repo/chat-transport/client";
import {
  createEncryptedTransport,
  type EncryptedChatTransport,
} from "@repo/chat";

import { loadSessionToken } from "@/lib/auth/session";
import { useAuthStore } from "@/store/auth";
import { getMyAccount } from "@/lib/account/me";
import { getOrCreateChatIdentity } from "@/lib/chat/identity";
import { getPeerDevices } from "@/lib/chat/peer-keys";

const ChatTransportContext = createContext<EncryptedChatTransport | null>(null);
const ChatStateContext = createContext<ConnectionState>("idle");

export function useChatTransport(): EncryptedChatTransport {
  const t = useContext(ChatTransportContext);
  if (!t) {
    throw new Error(
      "useChatTransport must be used inside <ChatTransportProvider>",
    );
  }
  return t;
}

export function useChatConnectionState(): ConnectionState {
  return useContext(ChatStateContext);
}

export function ChatTransportProvider({ children }: { children: ReactNode }) {
  const session = useAuthStore((s) => s.session);
  const [state, setState] = useState<ConnectionState>("idle");

  // One raw transport + one encrypted wrapper for the lifetime of the
  // provider. URL is resolved once at construction; if you change
  // CHAT_WS_URL at runtime you need a hard reload (acceptable for an env var).
  const transport = useMemo<EncryptedChatTransport>(() => {
    const underlying = createChatTransport({
      url: process.env.EXPO_PUBLIC_CHAT_WS_URL ?? "ws://localhost:8787",
      getToken: loadSessionToken,
    });
    return createEncryptedTransport({
      underlying,
      getMySeed: async () => (await getOrCreateChatIdentity()).seed,
      getMyAccountId: async () => (await getMyAccount()).accountId,
      resolveSenderX25519Pubs: async (senderId) => {
        const map = await getPeerDevices([senderId]);
        return (map.get(senderId) ?? []).map((d) => d.x25519Pub);
      },
      // MLS group-state-aware decrypt lookup will be wired here in Chunk 5
      // once @repo/chat exposes resolveSenderMlsCredentials.
      onDecryptFailure: (msg, reason) => {
        console.warn(
          "[chat/transport] decrypt failed",
          {
            chatId: msg.chatId,
            serverMsgId: msg.serverMsgId,
            senderId: msg.senderId,
          },
          reason,
        );
      },
    });
  }, []);

  // Bridge transport state → React state.
  useEffect(() => transport.onState(setState), [transport]);

  // Connect / disconnect based on session presence.
  const sessionPresent = !!session;
  useEffect(() => {
    if (sessionPresent) transport.connect();
    else transport.close();
  }, [sessionPresent, transport]);

  // App lifecycle: connect on foreground, close on background to free
  // sockets + battery. iOS will suspend WS shortly after backgrounding
  // anyway; explicit close keeps state clean.
  const lastAppState = useRef<AppStateStatus>(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      const prev = lastAppState.current;
      lastAppState.current = next;
      if (!sessionPresent) return;
      if (next === "active" && prev !== "active") transport.connect();
      else if (next === "background" && prev === "active") transport.close();
    });
    return () => sub.remove();
  }, [sessionPresent, transport]);

  // Tear down on unmount.
  useEffect(() => {
    return () => transport.close();
  }, [transport]);

  return (
    <ChatTransportContext.Provider value={transport}>
      <ChatStateContext.Provider value={state}>
        {children}
      </ChatStateContext.Provider>
    </ChatTransportContext.Provider>
  );
}
