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
