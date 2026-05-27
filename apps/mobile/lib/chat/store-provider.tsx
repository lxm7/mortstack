// Mobile wrapper around @repo/chat ChatStoreProvider — wires the tRPC
// client into a ChatApi adapter + sources `authenticated` from the auth
// store + pulls the EncryptedChatTransport from its existing provider.
// Sits inside ChatTransportProvider so the transport is available.

import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
  ChatStoreProvider,
  type ChatApi,
  type MessagePersistApi,
} from "@repo/chat";
import {
  getChatDb,
  createBoundMessageStore,
  type ChatDbHandle,
} from "@repo/chat-db";

import { trpc } from "@/lib/trpc/client";
import { useAuthStore } from "@/store/auth";
import { useChatTransport } from "./transport";

function createTrpcChatApi(): ChatApi {
  return {
    chatList: (input) => trpc.chat.list.query(input),
    chatGet: (input) => trpc.chat.get.query(input),
    chatCreate: (input) =>
      trpc.chat.create.mutate({
        kind: input.kind,
        name: input.name ?? undefined,
        memberAccountIds: input.memberAccountIds,
      }),
    chatLeave: (input) => trpc.chat.leave.mutate(input),
    chatAddMembers: (input) => trpc.chat.addMembers.mutate(input),
    chatRemoveMembers: (input) => trpc.chat.removeMembers.mutate(input),
    userSearch: (input) => trpc.user.search.query(input),
  };
}

export function MobileChatStoreProvider({ children }: { children: ReactNode }) {
  const authenticated = useAuthStore((s) => !!s.session);
  const transport = useChatTransport();
  const api = useMemo(createTrpcChatApi, []);

  // chat-db opens async (SQLCipher passphrase derivation + migrations).
  // Resolve the handle once at mount; persistApi stays undefined until the
  // first open finishes, after which the provider attaches it to the store.
  const [persistApi, setPersistApi] = useState<MessagePersistApi | undefined>(
    undefined,
  );
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const handle: ChatDbHandle = await getChatDb();
        if (active) setPersistApi(createBoundMessageStore(handle));
      } catch (err) {
        console.warn("[chat] chat-db open failed — persistence disabled", err);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <ChatStoreProvider
      api={api}
      transport={transport}
      messagePersist={persistApi}
      authenticated={authenticated}
    >
      {children}
    </ChatStoreProvider>
  );
}
