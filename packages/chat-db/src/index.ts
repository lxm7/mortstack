export { getChatDb, closeChatDb, type ChatDbHandle } from "./client";
export { LATEST_VERSION as SCHEMA_VERSION } from "./migrations";
export * as outbox from "./outbox";
export * as peerKeys from "./peer-keys";
export * as backfillCursors from "./backfill-cursors";
export type { PeerDeviceInput } from "./peer-keys";
export type {
  ChatRow,
  MessageRow,
  MemberRow,
  SyncCursorRow,
  BackfillCursorRow,
  PendingOutboxRow,
  KeyMaterialRow,
  PeerDeviceRow,
  MlsEngineStateRow,
  MlsGroupRow,
} from "./schema";
export * as mls from "./mls-store";
export { createBoundMlsStore } from "./mls-store";
export type { MlsGroupUpsert, MlsGroupListItem } from "./mls-store";
export {
  createBoundMessageStore,
  persistMessage,
  loadMessagesForChat,
  type MessagePersistApi,
  type PersistedMessage,
  type PersistedMessageInput,
} from "./messages-store";
