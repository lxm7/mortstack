// Public types for the chat store, hooks, and API contract. Kept distinct
// from the wire types in chat-mls-core / chat-transport — these are
// view-model shapes the UI consumes, with senderAuthUserId resolved through
// the chat's members array for display.

export interface Member {
  accountId: string;
  /** Better Auth user id — matches ChatMessage.senderId on the wire so the
   *  UI can resolve incoming messages back to a member without an extra
   *  round-trip. */
  authUserId: string;
  handle: string | null;
  displayName: string | null;
}

export interface ChatRecord {
  id: string;
  kind: "direct" | "group";
  name: string | null;
  members: Member[];
  /** ISO timestamp. */
  createdAt: string;
}

export type MessageStatus = "sending" | "sent" | "failed";

// A reaction folded onto a message bubble. The wire frame is `ChatReactionFrame`
// (crypto-pipe.ts) carried inside the same E2EE ciphertext as a message; this is
// the resolved view-model the store keeps and the UI renders as a pill.
//
// In-memory only for now (like plaintext messages — see the store's M4-3 note);
// a reactions-persistence column is a follow-up. `status` drives the optimistic
// pill: "sending" until the outbox worker acks, "sent" after.
export interface Reaction {
  /** clientMsgId of the reaction send — optimistic reconciliation key. */
  clientMsgId: string;
  /** serverSerial (string) of the reacted-to message. */
  target: string;
  emoji: string;
  senderAuthUserId: string;
  status: MessageStatus;
}

export interface Message {
  /** serverMsgId for confirmed messages, clientMsgId for in-flight. */
  id: string;
  chatId: string;
  /** Better Auth user id of the sender — resolve to display via chat.members. */
  senderAuthUserId: string;
  text: string;
  status: MessageStatus;
  clientMsgId: string;
  serverSerial?: string;
  /** Unix ms. Authoritative server timestamp when status !== "sending"; the
   *  sender's local clock otherwise. */
  createdAt: number;
}

// ── Injected API ────────────────────────────────────────────────────────────
// Mirrors the chat.* + user.search tRPC surface. Mobile binds via trpc;
// tests pass an in-memory mock. Keeps `@repo/chat` free of an AppRouter
// type dependency.

export interface ChatListInput {
  cursor?: string | null;
  limit?: number;
}

export interface ChatListOutput {
  chats: ChatRecord[];
  nextCursor: string | null;
}

export interface ChatCreateInput {
  kind: "direct" | "group";
  name?: string | null;
  memberAccountIds: string[];
}

export interface ChatCreateOutput {
  chatId: string;
  createdAt: string;
  existing: boolean;
}

export interface UserSearchInput {
  query: string;
  limit?: number;
}

export interface UserSearchOutput {
  users: Array<{
    accountId: string;
    handle: string;
    displayName: string;
  }>;
}

export interface ChatApi {
  chatList(input: ChatListInput): Promise<ChatListOutput>;
  chatGet(input: { chatId: string }): Promise<ChatRecord>;
  chatCreate(input: ChatCreateInput): Promise<ChatCreateOutput>;
  chatLeave(input: { chatId: string }): Promise<{ ok: true }>;
  chatAddMembers(input: {
    chatId: string;
    accountIds: string[];
  }): Promise<{ added: string[] }>;
  chatRemoveMembers(input: {
    chatId: string;
    accountIds: string[];
  }): Promise<{ removed: string[] }>;
  userSearch(input: UserSearchInput): Promise<UserSearchOutput>;
}

// ── Injected local message store ────────────────────────────────────────
// Persistence layer for cold-start rehydration. Implementation lives in
// chat-db (createBoundMessageStore); the store calls these methods after
// every message-lifecycle action so the next launch can replay the thread
// without depending on MLS ratchet state (which is one-shot per decrypt).

export interface PersistMessageInput {
  id: string;
  chatId: string;
  senderAuthUserId: string;
  text: string;
  status: MessageStatus;
  clientMsgId: string;
  serverSerial: string | null;
  createdAt: number;
}

export interface MessagePersistApi {
  persist(input: PersistMessageInput): Promise<void>;
  load(chatId: string, limit?: number): Promise<Message[]>;
}
