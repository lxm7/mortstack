// Mobile wrapper around @repo/chat ChatStoreProvider — wires the tRPC
// client into a ChatApi adapter + sources `authenticated` from the auth
// store + pulls the EncryptedChatTransport from its existing provider.
// Sits inside ChatTransportProvider so the transport is available.

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AppState } from "react-native";

import {
  ChatStoreProvider,
  createOutboxWorker,
  useChatStore,
  type BackfillCursorApi,
  type BoundOutboxApi,
  type ChatApi,
  type MessagePersistApi,
  type OutboxWorker,
  type OutboxWorkerStoreApi,
} from "@repo/chat";
import {
  getChatDb,
  createBoundMessageStore,
  backfillCursors as backfillCursorsDb,
  mls as mlsStore,
  outbox as outboxDb,
  type ChatDbHandle,
} from "@repo/chat-db";

import { trpc } from "@/lib/trpc/client";
import { useAuthStore } from "@/store/auth";
import { useChatTransport } from "./transport";
import { clearChatGroupCache } from "./group-resolver";

// base64 (mlsGroupIdB64 from chat.list) → GroupId bytes. Hermes provides atob.
function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// Mirror the server chat list into the local SQLite `chats` table (ADR-016) so
// resolveChatGroupId(realChatId) works on BOTH devices, and heal any group
// that joined under the interim harness chatId. Best-effort — a mirror failure
// must not break the in-memory chat list the UI renders.
async function mirrorChatsToLocalDb(
  chats: Awaited<ReturnType<typeof trpc.chat.list.query>>["chats"],
): Promise<void> {
  try {
    const { db } = await getChatDb();
    for (const c of chats) {
      const groupId = c.mlsGroupIdB64 ? b64ToBytes(c.mlsGroupIdB64) : null;
      await mlsStore.upsertChat(db, {
        id: c.id,
        kind: c.kind,
        name: c.name,
        mlsGroupId: groupId,
      });
      if (groupId) {
        await mlsStore.relinkGroupChatId(db, groupId, c.id);
        clearChatGroupCache(c.id);
      }
    }
  } catch (err) {
    console.warn("[chat] local chats mirror failed", err);
  }
}

function createTrpcChatApi(): ChatApi {
  return {
    chatList: async (input) => {
      const res = await trpc.chat.list.query(input);
      await mirrorChatsToLocalDb(res.chats);
      return res;
    },
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

// Curry chat-db's backfill_cursors helpers onto a handle → the injected
// BackfillCursorApi the store provider drives (docs/message-backfill.md).
function bindBackfillCursors(handle: ChatDbHandle): BackfillCursorApi {
  return {
    getAll: () => backfillCursorsDb.getAllCursors(handle.db),
    set: (chatId, upTo) => backfillCursorsDb.setCursor(handle.db, chatId, upTo),
  };
}

// Curry the chat-db outbox namespace onto a single ChatDbHandle so the
// shared @repo/chat outbox worker doesn't need to know about op-sqlite.
function bindOutbox(handle: ChatDbHandle): BoundOutboxApi {
  return {
    enqueue: (args) => outboxDb.enqueue(handle.db, args),
    due: (limit, now) => outboxDb.due(handle.db, limit, now),
    markSent: (id) => outboxDb.markSent(handle.db, id),
    markFailed: (id, reason, retryDelayMs) =>
      outboxDb.markFailed(handle.db, id, reason, retryDelayMs),
    markPermanentlyFailed: (id, reason) =>
      outboxDb.markPermanentlyFailed(handle.db, id, reason),
    requeue: (id) => outboxDb.requeue(handle.db, id),
  };
}

export function MobileChatStoreProvider({ children }: { children: ReactNode }) {
  const authenticated = useAuthStore((s) => !!s.session);
  const transport = useChatTransport();
  const api = useMemo(createTrpcChatApi, []);

  // Pull the store's reducers once; the worker calls them on every dispatch.
  // Reading via getState() inside the worker would also work but would skip
  // the React subscription pattern other consumers rely on for debugging.
  const confirmOptimisticMessage = useChatStore(
    (s) => s.confirmOptimisticMessage,
  );
  const failOptimisticMessage = useChatStore((s) => s.failOptimisticMessage);

  // chat-db opens async (SQLCipher passphrase derivation + migrations).
  // Resolve the handle once at mount; outbox + persistApi stay undefined
  // until the first open finishes, after which the provider attaches them
  // to the store.
  const [persistApi, setPersistApi] = useState<MessagePersistApi | undefined>(
    undefined,
  );
  const [outboxBindings, setOutboxBindings] = useState<
    | {
        outbox: BoundOutboxApi;
        worker: OutboxWorker;
      }
    | undefined
  >(undefined);
  const [backfillApi, setBackfillApi] = useState<BackfillCursorApi | undefined>(
    undefined,
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const handle: ChatDbHandle = await getChatDb();
        if (!active) return;
        setPersistApi(createBoundMessageStore(handle));
        setBackfillApi(bindBackfillCursors(handle));
        const bound = bindOutbox(handle);
        const store: OutboxWorkerStoreApi = {
          confirmOptimisticMessage,
          failOptimisticMessage,
        };
        const worker = createOutboxWorker({
          outbox: bound,
          transport,
          store,
          onTransientFailure: (id, reason) =>
            console.warn("[outbox] transient failure", id, reason),
          onTerminalFailure: (id, reason) =>
            console.warn("[outbox] terminal failure", id, reason),
        });
        setOutboxBindings({ outbox: bound, worker });
      } catch (err) {
        console.warn(
          "[chat] chat-db open failed — persistence + outbox disabled",
          err,
        );
      }
    })();
    return () => {
      active = false;
    };
  }, [confirmOptimisticMessage, failOptimisticMessage, transport]);

  // AppState foreground kick. The chat-store provider already wires
  // worker.kick on transport.onState("open"), and the worker runs a 30s
  // periodic tick — this catches the gap where iOS keeps the WS attached
  // across a brief background trip yet anything enqueued offline still
  // wants immediate dispatch when the user comes back.
  useEffect(() => {
    if (!outboxBindings) return;
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") outboxBindings.worker.kick();
    });
    return () => sub.remove();
  }, [outboxBindings]);

  return (
    <ChatStoreProvider
      api={api}
      transport={transport}
      messagePersist={persistApi}
      outbox={outboxBindings?.outbox}
      outboxWorker={outboxBindings?.worker}
      backfillCursors={backfillApi}
      authenticated={authenticated}
    >
      {children}
    </ChatStoreProvider>
  );
}
