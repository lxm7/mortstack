export { getChatDb, closeChatDb, type ChatDbHandle } from "./client";
export { LATEST_VERSION as SCHEMA_VERSION } from "./migrations";
export * as outbox from "./outbox";
export type {
  ChatRow,
  MessageRow,
  MemberRow,
  SyncCursorRow,
  PendingOutboxRow,
  KeyMaterialRow,
} from "./schema";
