// @repo/db-edge — Worker-runtime SQL client for the chat persist hot path.
//
// ADR-010: Chat DO calls Neon HTTP directly from a Cloudflare Worker, skipping
// the API Lambda hop. This package wraps @neondatabase/serverless with a tiny
// typed surface scoped to chat persistence + serial recovery.
//
// Schema authority lives in `packages/database` (Prisma). This package
// duplicates the row shape as TypeScript types — drift is mitigated by:
//   • narrow surface (two statements: insert msg, recover max serial)
//   • CI smoke test against a Neon branch (TODO when CI lands for chat-ws)

export { ChatPersistClient } from "./chat-persist";
export type {
  ChatPersistClient as ChatPersistClientType,
  PersistMessageInput,
  PersistedMessageRow,
  BackfilledMessageRow,
} from "./chat-persist";
