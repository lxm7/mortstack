// ChatStoreProvider — wires the store to the API + transport at app root.
// Sits inside ChatTransportProvider so it can subscribe to incoming
// messages and the mls-welcome wake-up to refresh the chat list.
//
// Also exposes the transport to descendants via internal context so hooks
// like useSendMessage can issue sends without the consumer threading the
// transport through every call site.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

import { isReactionFrame } from "./crypto-pipe";
import type { EncryptedChatTransport } from "./encrypted-transport";
import type { BoundOutboxApi, OutboxWorker } from "./outbox-worker";
import { useChatStore } from "./store";
import type { ChatApi, MessagePersistApi } from "./types";

// Injected persistence for backfill cursors (chat-db backfill_cursors table).
// Kept as an injected port — like MessagePersistApi — so @repo/chat stays free
// of a chat-db dependency. When absent, backfill is disabled (tests, debug).
export interface BackfillCursorApi {
  /** { chatId → lastSerial } for every backfilled chat. */
  getAll(): Promise<Record<string, string>>;
  /** Advance a chat's cursor to `upTo` (monotonic guard lives in chat-db). */
  set(chatId: string, upTo: string): Promise<void>;
}

const ChatTransportContext = createContext<EncryptedChatTransport | null>(null);
const OutboxContext = createContext<BoundOutboxApi | null>(null);
const OutboxWorkerContext = createContext<OutboxWorker | null>(null);
// Exposes the backfill runner so a platform trigger the package can't own
// (silent-push wake, explicit foreground) can kick a catch-up pass. Null when
// no cursor store is wired. See useChatBackfill.
const BackfillContext = createContext<(() => void) | null>(null);

export function useChatTransport(): EncryptedChatTransport {
  const t = useContext(ChatTransportContext);
  if (!t) {
    throw new Error("useChatTransport must be used inside <ChatStoreProvider>");
  }
  return t;
}

// May return null in environments without an outbox (tests, debug screen).
// useSendMessage falls back to direct transport.send in that case so the
// existing surface keeps working without forcing every test to wire chat-db.
export function useOutbox(): BoundOutboxApi | null {
  return useContext(OutboxContext);
}

export function useOutboxWorker(): OutboxWorker | null {
  return useContext(OutboxWorkerContext);
}

// Trigger an offline-backfill pass on demand. Returns a no-op when no cursor
// store is wired. Intended for the app's silent-push handler / an explicit
// foreground hook — the WS-open trigger (reconnect, incl. foreground-resume)
// is handled inside the provider.
export function useChatBackfill(): () => void {
  return useContext(BackfillContext) ?? (() => {});
}

export interface ChatStoreProviderProps {
  api: ChatApi;
  transport: EncryptedChatTransport;
  /** Optional local message persistence (M4-followup #25). When supplied,
   *  the store fires-and-forgets writes on every message lifecycle event,
   *  and the provider rehydrates per-chat messages after bootstrap. */
  messagePersist?: MessagePersistApi;
  /** Optional outbox + worker pair. Both are required to activate the
   *  retry path — supplying only one is a programmer error and is treated
   *  as "no outbox" (useSendMessage falls back to direct transport.send).
   *  The provider owns the worker's lifecycle: started on auth + on tick
   *  triggers, stopped on sign-out and unmount. */
  outbox?: BoundOutboxApi;
  outboxWorker?: OutboxWorker;
  /** Optional backfill cursor store (chat-db). When supplied, the provider runs
   *  offline catch-up on WS open + exposes a runner via useChatBackfill. When
   *  omitted, backfill is disabled. */
  backfillCursors?: BackfillCursorApi;
  /** True once the user is signed in. Bootstrap waits for this so we don't
   *  fire chatList before auth lands. */
  authenticated: boolean;
  children: ReactNode;
}

export function ChatStoreProvider({
  api,
  transport,
  messagePersist,
  outbox,
  outboxWorker,
  backfillCursors,
  authenticated,
  children,
}: ChatStoreProviderProps) {
  const outboxApi = outbox && outboxWorker ? outbox : null;
  const workerApi = outbox && outboxWorker ? outboxWorker : null;
  const bootstrap = useChatStore((s) => s.bootstrap);
  const refresh = useChatStore((s) => s.refresh);
  const reset = useChatStore((s) => s.reset);
  const addIncomingMessage = useChatStore((s) => s.addIncomingMessage);
  const applyIncomingReaction = useChatStore((s) => s.applyIncomingReaction);
  const ingestBackfill = useChatStore((s) => s.ingestBackfill);
  const setTyping = useChatStore((s) => s.setTyping);
  const setReadReceipt = useChatStore((s) => s.setReadReceipt);
  const sweepExpiredTyping = useChatStore((s) => s.sweepExpiredTyping);
  const setPersistApi = useChatStore((s) => s.setPersistApi);
  const hydrateMessages = useChatStore((s) => s.hydrateMessages);

  // Drives the `force` flag: the first backfill of a chat each app launch
  // forces Neon (fresh-login correctness); later same-launch reconnects omit it
  // and take the server's KV skip (cheap under reconnect storms).
  const backfilledThisLaunch = useRef<Set<string>>(new Set());

  // Build + fire one batched `bf` covering every known chat's cursor. No-op
  // without a cursor store or before chats have loaded.
  const runBackfill = useCallback(() => {
    if (!backfillCursors) {
      console.log("[DEBUG-bkfl] runBackfill skipped — no backfillCursors");
      return;
    }
    const chatIds = Array.from(useChatStore.getState().chats.keys());
    if (chatIds.length === 0) {
      console.log("[DEBUG-bkfl] runBackfill skipped — 0 chats in store");
      return;
    }
    void (async () => {
      let cursors: Record<string, string> = {};
      try {
        cursors = await backfillCursors.getAll();
      } catch (err) {
        console.warn("[chat] backfill cursor read failed", err);
      }
      const batch = chatIds.map((chatId) => {
        const after = cursors[chatId] ?? "0";
        const forced = !backfilledThisLaunch.current.has(chatId);
        backfilledThisLaunch.current.add(chatId);
        return forced ? { chatId, after, force: true } : { chatId, after };
      });
      console.log(
        "[DEBUG-bkfl] sendBackfill",
        JSON.stringify(
          batch.map((b) => ({
            chatId: b.chatId,
            after: b.after,
            force: "force" in b ? !!b.force : false,
          })),
        ),
      );
      transport.sendBackfill(batch);
    })();
  }, [backfillCursors, transport]);

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
      // New sign-in should re-force backfill from Neon (fresh-login correctness).
      backfilledThisLaunch.current.clear();
      return;
    }
    void (async () => {
      await bootstrap(api);
      if (messagePersist) {
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
      }
      // Fresh-login catch-up: now that chats are known, request backfill. If the
      // socket isn't open yet the frame is dropped and the WS-open trigger below
      // re-issues it — belt and suspenders.
      runBackfill();
    })();
  }, [
    authenticated,
    api,
    bootstrap,
    hydrateMessages,
    messagePersist,
    reset,
    runBackfill,
  ]);

  // Refresh on (re)connect — picks up chats created while offline + any
  // changes another device made. Also kick the outbox worker so any queued
  // sends dispatch immediately rather than waiting for the periodic tick.
  useEffect(() => {
    if (!authenticated) return;
    return transport.onState((state) => {
      if (state === "open") {
        void refresh(api);
        workerApi?.kick();
        // Catch up on messages missed while the socket was down. Covers cold
        // connect, reconnect storms, and foreground-resume (the app reconnects
        // on foreground → this fires).
        runBackfill();
      }
    });
  }, [authenticated, api, refresh, transport, workerApi, runBackfill]);

  // Worker lifecycle — tied to auth, not to mount, so sign-out halts
  // background dispatch even if the provider stays mounted across users.
  useEffect(() => {
    if (!authenticated || !workerApi) return;
    workerApi.start();
    return () => workerApi.stop();
  }, [authenticated, workerApi]);

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
  // or v=2 MLS) and surfaces a ChatFrame. A reaction frame (kind "rx") folds
  // onto its target bubble instead of rendering as a message row.
  useEffect(() => {
    if (!authenticated) return;
    return transport.onMessage((msg) => {
      if (isReactionFrame(msg.frame)) {
        applyIncomingReaction({
          chatId: msg.chatId,
          target: msg.frame.target,
          emoji: msg.frame.emoji,
          op: msg.frame.op,
          senderAuthUserId: msg.senderId,
        });
        return;
      }
      addIncomingMessage({
        chatId: msg.chatId,
        serverMsgId: msg.serverMsgId,
        senderAuthUserId: msg.senderId,
        text: msg.frame.text,
        ts: msg.ts,
      });
    });
  }, [authenticated, addIncomingMessage, applyIncomingReaction, transport]);

  // Backfill ingestion (docs/message-backfill.md). Each `bfd` page is already
  // decrypted + split by the transport. Merge messages via the store's
  // serial-sorted ingest, fold reactions onto their targets (serial-ascending
  // order guarantees a target lands before its reaction), advance the cursor to
  // `upTo`, and page while more. The transport advances `upTo` past
  // expected-permanent drops (no refetch loop) but caps it below a RECOVERABLE
  // drop (e.g. "group not found" before the Welcome lands) so that row is
  // refetched — never silently lost — once the group state heals.
  useEffect(() => {
    if (!authenticated) return;
    return transport.onBackfill((page) => {
      if (page.messages.length > 0) {
        ingestBackfill(
          page.chatId,
          page.messages.map((m) => ({
            serverMsgId: m.serverMsgId,
            senderAuthUserId: m.senderId,
            text: m.frame.text,
            ts: m.ts,
          })),
        );
      }
      for (const rx of page.reactions) {
        applyIncomingReaction({
          chatId: page.chatId,
          target: rx.frame.target,
          emoji: rx.frame.emoji,
          op: rx.frame.op,
          senderAuthUserId: rx.senderId,
        });
      }
      void backfillCursors?.set(page.chatId, page.upTo).catch((err) => {
        console.warn("[chat] backfill cursor write failed", err);
      });
      // Same-session paging never re-forces — honor the KV skip on follow-ups.
      if (page.more) {
        transport.sendBackfill([{ chatId: page.chatId, after: page.upTo }]);
      }
    });
  }, [
    authenticated,
    transport,
    ingestBackfill,
    applyIncomingReaction,
    backfillCursors,
  ]);

  // Live typing + read-receipt ingestion. These are ephemeral/metadata frames
  // (plaintext, not encrypted) fanned out by the Chat DO.
  useEffect(() => {
    if (!authenticated) return;
    const offTyping = transport.onTyping((m) => {
      setTyping({ chatId: m.chatId, userId: m.userId, on: m.on });
    });
    const offRead = transport.onRead((m) => {
      setReadReceipt({ chatId: m.chatId, userId: m.userId, upto: m.upto });
    });
    return () => {
      offTyping();
      offRead();
    };
  }, [authenticated, setTyping, setReadReceipt, transport]);

  // Typing expiry sweep — clears a stuck indicator when a peer's `on:false`
  // never arrives (sender crash / dropped frame). 2s cadence sits well under
  // the store's 6s TTL.
  useEffect(() => {
    if (!authenticated) return;
    const id = setInterval(() => sweepExpiredTyping(), 2_000);
    return () => clearInterval(id);
  }, [authenticated, sweepExpiredTyping]);

  return (
    <ChatTransportContext.Provider value={transport}>
      <OutboxContext.Provider value={outboxApi}>
        <OutboxWorkerContext.Provider value={workerApi}>
          <BackfillContext.Provider
            value={backfillCursors ? runBackfill : null}
          >
            {children}
          </BackfillContext.Provider>
        </OutboxWorkerContext.Provider>
      </OutboxContext.Provider>
    </ChatTransportContext.Provider>
  );
}
