// Singleton Zustand store for chat list + per-chat message slices.
// Module-level instance per process — there is one signed-in user per app.
// Tests can reset() between cases.
//
// Bootstrap order (M4-3 decision Q3d): server-only. chat.list is the source
// of truth; chat-db hydration deferred to a follow-up. Initial render is
// blank-then-server-data; reconnects re-fetch.
//
// Plaintext caching (M4-3 decision Q3b): in-memory only. Task #25 tracks
// the persistent-plaintext-column follow-up. Cold app start before that
// lands → blank thread for prior messages.

import { create } from "zustand";

import type {
  ChatApi,
  ChatRecord,
  Message,
  MessagePersistApi,
  Reaction,
} from "./types";

export interface ChatStoreState {
  chats: Map<string, ChatRecord>;
  /** Chat ids in display order. Server provides initial sort
   *  (createdAt DESC per M4-1 stub); the store bumps a chat to the front
   *  when a new message arrives in-session. */
  chatOrder: string[];
  /** Messages per chatId, ordered oldest → newest. The thread screen
   *  renders inverted via FlashList. */
  messages: Map<string, Message[]>;
  /** Reactions per chatId → target serverSerial → Reaction[]. In-memory only
   *  (same as plaintext messages, M4-3). Folded onto bubbles by the UI. */
  reactions: Map<string, Map<string, Reaction[]>>;
  bootstrapStatus: "idle" | "loading" | "ready" | "error";
  bootstrapError: string | null;
  /** Optional local persistence (M4-followup #25). Set by the provider on
   *  mount; null in environments without a backing store. Mutating
   *  actions fire-and-forget through this on success. */
  persistApi: MessagePersistApi | null;
}

export interface ChatStoreActions {
  /** First-load fetch. No-op if already loading/ready. */
  bootstrap(api: ChatApi): Promise<void>;
  /** Re-fetch chat list. Idempotent — merges into existing state.
   *  Silently swallows errors (prior state remains visible). */
  refresh(api: ChatApi): Promise<void>;
  upsertChat(chat: ChatRecord): void;
  removeChat(chatId: string): void;
  addIncomingMessage(input: {
    chatId: string;
    serverMsgId: string;
    senderAuthUserId: string;
    text: string;
    ts: number;
  }): void;
  /** Optimistic-message slot for M4-6. Adds a "sending" message with the
   *  caller-provided clientMsgId; M4-6 reconciles to "sent" on ACK. */
  addOptimisticMessage(input: {
    chatId: string;
    clientMsgId: string;
    senderAuthUserId: string;
    text: string;
  }): void;
  /** Replace an optimistic message's id/serverSerial when its ACK arrives.
   *  Looked up by clientMsgId. No-op if not found (already reconciled or
   *  the ACK arrived before the optimistic insert). */
  confirmOptimisticMessage(input: {
    chatId: string;
    clientMsgId: string;
    serverMsgId: string;
    ts: number;
  }): void;
  /** Flip an optimistic message to "failed" status. Used when transport.send
   *  rejects or the encrypt step throws. Caller may retry by sending the
   *  same text again — a fresh clientMsgId will be generated. */
  failOptimisticMessage(input: { chatId: string; clientMsgId: string }): void;
  /** Flip a failed message back to "sending" — used by useRetryMessage so
   *  the bubble's UI returns to ⌛ the instant the user taps retry, even
   *  before the worker actually dispatches. No-op if the row isn't in
   *  status="failed". */
  retryOptimisticMessage(input: { chatId: string; clientMsgId: string }): void;
  /** Locally remove a message from the in-memory list. Used by
   *  useDeleteMessage on failed bubbles. Persistence-layer delete is
   *  caller's responsibility (chat-db.messages-store.deleteByClientMsgId). */
  removeMessageByClientMsgId(input: {
    chatId: string;
    clientMsgId: string;
  }): void;
  // ── Reactions (M8) ──────────────────────────────────────────────────────
  /** Optimistic add: insert a "sending" reaction pill immediately. Ignores a
   *  duplicate clientMsgId or an existing (sender, target, emoji). */
  addOptimisticReaction(input: {
    chatId: string;
    clientMsgId: string;
    target: string;
    emoji: string;
    senderAuthUserId: string;
  }): void;
  /** Flip an optimistic reaction to "sent" on outbox ack. Keyed by
   *  clientMsgId; no-op if not found (e.g. an op:"del" row has no pill). */
  confirmReaction(input: { chatId: string; clientMsgId: string }): void;
  /** Roll back an optimistic reaction that terminally failed to send. */
  failReaction(input: { chatId: string; clientMsgId: string }): void;
  /** Optimistic un-react: remove my own pill immediately (paired with an
   *  op:"del" send). No rollback on send failure — reconciles on reload
   *  (in-memory, demo-scoped). */
  removeOwnReaction(input: {
    chatId: string;
    target: string;
    emoji: string;
    senderAuthUserId: string;
  }): void;
  /** Apply an inbound reaction frame. op "add" inserts (dedup per
   *  sender+target+emoji); op "del" removes the matching pill. */
  applyIncomingReaction(input: {
    chatId: string;
    target: string;
    emoji: string;
    op: "add" | "del";
    senderAuthUserId: string;
  }): void;
  /** Inject (or clear) the persistence API. Idempotent. */
  setPersistApi(api: MessagePersistApi | null): void;
  /** Merge a batch of persisted messages into the per-chat slice. Used by
   *  the provider after bootstrap loads chats — calls load() per chatId
   *  and feeds the result here. Idempotent: skips ids already in the
   *  in-memory list. */
  hydrateMessages(chatId: string, persisted: Message[]): void;
  /** Wipe everything. Used on sign-out and from tests. */
  reset(): void;
}

export type ChatStore = ChatStoreState & ChatStoreActions;

const emptyState: ChatStoreState = {
  chats: new Map(),
  chatOrder: [],
  messages: new Map(),
  reactions: new Map(),
  bootstrapStatus: "idle",
  bootstrapError: null,
  persistApi: null,
};

function firePersist(api: MessagePersistApi | null, msg: Message): void {
  if (!api) return;
  void api
    .persist({
      id: msg.id,
      chatId: msg.chatId,
      senderAuthUserId: msg.senderAuthUserId,
      text: msg.text,
      status: msg.status,
      clientMsgId: msg.clientMsgId,
      serverSerial: msg.serverSerial ?? null,
      createdAt: msg.createdAt,
    })
    .catch((err) => {
      console.warn("[chat-store] persist failed", err);
    });
}

export const useChatStore = create<ChatStore>((set, get) => ({
  ...emptyState,

  async bootstrap(api) {
    const status = get().bootstrapStatus;
    if (status === "loading" || status === "ready") return;
    set({ bootstrapStatus: "loading", bootstrapError: null });
    try {
      const { chats } = await api.chatList({ limit: 50 });
      const map = new Map<string, ChatRecord>();
      for (const c of chats) map.set(c.id, c);
      set({
        chats: map,
        chatOrder: chats.map((c) => c.id),
        bootstrapStatus: "ready",
      });
    } catch (err) {
      set({
        bootstrapStatus: "error",
        bootstrapError: err instanceof Error ? err.message : String(err),
      });
    }
  },

  async refresh(api) {
    try {
      const { chats } = await api.chatList({ limit: 50 });
      const map = new Map(get().chats);
      for (const c of chats) map.set(c.id, c);
      const seen = new Set(get().chatOrder);
      const additions = chats.map((c) => c.id).filter((id) => !seen.has(id));
      set({
        chats: map,
        chatOrder: [...get().chatOrder, ...additions],
        bootstrapStatus: "ready",
        bootstrapError: null,
      });
    } catch (err) {
      console.warn("[chat-store] refresh failed", err);
    }
  },

  upsertChat(chat) {
    const chats = new Map(get().chats);
    chats.set(chat.id, chat);
    const order = get().chatOrder.includes(chat.id)
      ? get().chatOrder
      : [chat.id, ...get().chatOrder];
    set({ chats, chatOrder: order });
  },

  removeChat(chatId) {
    const chats = new Map(get().chats);
    chats.delete(chatId);
    const messages = new Map(get().messages);
    messages.delete(chatId);
    const reactions = new Map(get().reactions);
    reactions.delete(chatId);
    set({
      chats,
      chatOrder: get().chatOrder.filter((id) => id !== chatId),
      messages,
      reactions,
    });
  },

  addIncomingMessage(input) {
    const messages = new Map(get().messages);
    const list = messages.get(input.chatId) ?? [];
    // Idempotency: ignore duplicates of the same serverMsgId. The transport
    // can deliver the same `msg` frame twice across reconnect/replay paths.
    if (list.some((m) => m.serverSerial === input.serverMsgId)) return;
    const msg: Message = {
      id: input.serverMsgId,
      chatId: input.chatId,
      senderAuthUserId: input.senderAuthUserId,
      text: input.text,
      status: "sent",
      clientMsgId: input.serverMsgId,
      serverSerial: input.serverMsgId,
      createdAt: input.ts,
    };
    messages.set(input.chatId, [...list, msg]);

    // Bump chat to top so the list reflects recent activity. No-op if the
    // chat isn't in chatOrder yet (server hasn't returned it — refresh()
    // call will catch up).
    const order = get().chatOrder;
    const next = order.includes(input.chatId)
      ? [input.chatId, ...order.filter((id) => id !== input.chatId)]
      : order;
    set({ messages, chatOrder: next });
    firePersist(get().persistApi, msg);
  },

  addOptimisticMessage(input) {
    const messages = new Map(get().messages);
    const list = messages.get(input.chatId) ?? [];
    if (list.some((m) => m.clientMsgId === input.clientMsgId)) return;
    const msg: Message = {
      id: input.clientMsgId,
      chatId: input.chatId,
      senderAuthUserId: input.senderAuthUserId,
      text: input.text,
      status: "sending",
      clientMsgId: input.clientMsgId,
      createdAt: Date.now(),
    };
    messages.set(input.chatId, [...list, msg]);
    const order = get().chatOrder;
    const next = order.includes(input.chatId)
      ? [input.chatId, ...order.filter((id) => id !== input.chatId)]
      : order;
    set({ messages, chatOrder: next });
  },

  confirmOptimisticMessage(input) {
    const messages = new Map(get().messages);
    const list = messages.get(input.chatId);
    if (!list) return;
    const idx = list.findIndex((m) => m.clientMsgId === input.clientMsgId);
    if (idx < 0) return;
    const existing = list[idx]!;
    const updated: Message = {
      ...existing,
      id: input.serverMsgId,
      status: "sent",
      serverSerial: input.serverMsgId,
      createdAt: input.ts,
    };
    const next = [...list];
    next[idx] = updated;
    messages.set(input.chatId, next);
    set({ messages });
    firePersist(get().persistApi, updated);
  },

  failOptimisticMessage(input) {
    const messages = new Map(get().messages);
    const list = messages.get(input.chatId);
    if (!list) return;
    const idx = list.findIndex((m) => m.clientMsgId === input.clientMsgId);
    if (idx < 0) return;
    const existing = list[idx]!;
    if (existing.status === "sent") return; // already confirmed elsewhere
    const next = [...list];
    const updated: Message = { ...existing, status: "failed" };
    next[idx] = updated;
    messages.set(input.chatId, next);
    set({ messages });
    firePersist(get().persistApi, updated);
  },

  retryOptimisticMessage(input) {
    const messages = new Map(get().messages);
    const list = messages.get(input.chatId);
    if (!list) return;
    const idx = list.findIndex((m) => m.clientMsgId === input.clientMsgId);
    if (idx < 0) return;
    const existing = list[idx]!;
    if (existing.status !== "failed") return;
    const next = [...list];
    const updated: Message = { ...existing, status: "sending" };
    next[idx] = updated;
    messages.set(input.chatId, next);
    set({ messages });
    firePersist(get().persistApi, updated);
  },

  removeMessageByClientMsgId(input) {
    const messages = new Map(get().messages);
    const list = messages.get(input.chatId);
    if (!list) return;
    const filtered = list.filter((m) => m.clientMsgId !== input.clientMsgId);
    if (filtered.length === list.length) return;
    messages.set(input.chatId, filtered);
    set({ messages });
  },

  // ── Reactions (M8) ────────────────────────────────────────────────────────
  addOptimisticReaction(input) {
    const reactions = new Map(get().reactions);
    const perChat = new Map<string, Reaction[]>(reactions.get(input.chatId));
    const list = perChat.get(input.target) ?? [];
    if (list.some((r) => r.clientMsgId === input.clientMsgId)) return;
    // One reaction per (sender, target, emoji) — don't stack a duplicate.
    if (
      list.some(
        (r) =>
          r.senderAuthUserId === input.senderAuthUserId &&
          r.emoji === input.emoji,
      )
    ) {
      return;
    }
    const reaction: Reaction = {
      clientMsgId: input.clientMsgId,
      target: input.target,
      emoji: input.emoji,
      senderAuthUserId: input.senderAuthUserId,
      status: "sending",
    };
    perChat.set(input.target, [...list, reaction]);
    reactions.set(input.chatId, perChat);
    set({ reactions });
  },

  confirmReaction(input) {
    const reactions = new Map(get().reactions);
    const perChat = reactions.get(input.chatId);
    if (!perChat) return;
    const nextPerChat = new Map(perChat);
    let changed = false;
    for (const [target, list] of perChat) {
      const idx = list.findIndex((r) => r.clientMsgId === input.clientMsgId);
      if (idx < 0) continue;
      const next = [...list];
      next[idx] = { ...next[idx]!, status: "sent" };
      nextPerChat.set(target, next);
      changed = true;
      break;
    }
    if (!changed) return;
    reactions.set(input.chatId, nextPerChat);
    set({ reactions });
  },

  failReaction(input) {
    // Terminal failure → drop the optimistic pill entirely.
    const reactions = new Map(get().reactions);
    const perChat = reactions.get(input.chatId);
    if (!perChat) return;
    const nextPerChat = new Map(perChat);
    let changed = false;
    for (const [target, list] of perChat) {
      const filtered = list.filter((r) => r.clientMsgId !== input.clientMsgId);
      if (filtered.length === list.length) continue;
      if (filtered.length === 0) nextPerChat.delete(target);
      else nextPerChat.set(target, filtered);
      changed = true;
      break;
    }
    if (!changed) return;
    reactions.set(input.chatId, nextPerChat);
    set({ reactions });
  },

  removeOwnReaction(input) {
    const reactions = new Map(get().reactions);
    const perChat = reactions.get(input.chatId);
    if (!perChat) return;
    const list = perChat.get(input.target);
    if (!list) return;
    const filtered = list.filter(
      (r) =>
        !(
          r.senderAuthUserId === input.senderAuthUserId &&
          r.emoji === input.emoji
        ),
    );
    if (filtered.length === list.length) return;
    const nextPerChat = new Map(perChat);
    if (filtered.length === 0) nextPerChat.delete(input.target);
    else nextPerChat.set(input.target, filtered);
    reactions.set(input.chatId, nextPerChat);
    set({ reactions });
  },

  applyIncomingReaction(input) {
    const reactions = new Map(get().reactions);
    const perChat = new Map<string, Reaction[]>(reactions.get(input.chatId));
    const list = perChat.get(input.target) ?? [];

    if (input.op === "del") {
      const filtered = list.filter(
        (r) =>
          !(
            r.senderAuthUserId === input.senderAuthUserId &&
            r.emoji === input.emoji
          ),
      );
      if (filtered.length === list.length) return;
      if (filtered.length === 0) perChat.delete(input.target);
      else perChat.set(input.target, filtered);
      reactions.set(input.chatId, perChat);
      set({ reactions });
      return;
    }

    // op "add" — dedup per (sender, target, emoji). Last-write-wins is trivial
    // here: a repeat add is a no-op.
    if (
      list.some(
        (r) =>
          r.senderAuthUserId === input.senderAuthUserId &&
          r.emoji === input.emoji,
      )
    ) {
      return;
    }
    const reaction: Reaction = {
      clientMsgId: `in-${input.senderAuthUserId}-${input.emoji}-${input.target}`,
      target: input.target,
      emoji: input.emoji,
      senderAuthUserId: input.senderAuthUserId,
      status: "sent",
    };
    perChat.set(input.target, [...list, reaction]);
    reactions.set(input.chatId, perChat);
    set({ reactions });
  },

  setPersistApi(api) {
    set({ persistApi: api });
  },

  hydrateMessages(chatId, persisted) {
    if (persisted.length === 0) return;
    const messages = new Map(get().messages);
    const existing = messages.get(chatId) ?? [];
    const seenIds = new Set(existing.map((m) => m.id));
    const additions = persisted.filter((m) => !seenIds.has(m.id));
    if (additions.length === 0) return;
    // Sort merged list by createdAt ascending so the inverted FlashList
    // still renders newest at the visual bottom.
    const merged = [...existing, ...additions].sort(
      (a, b) => a.createdAt - b.createdAt,
    );
    messages.set(chatId, merged);
    set({ messages });
  },

  reset() {
    set({
      ...emptyState,
      chats: new Map(),
      chatOrder: [],
      messages: new Map(),
      reactions: new Map(),
      // Preserve persistApi across resets — caller (provider) controls its
      // lifetime independently from auth state.
      persistApi: get().persistApi,
    });
  },
}));
