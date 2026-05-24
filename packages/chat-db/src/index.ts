export { getChatDb, closeChatDb, type ChatDbHandle } from "./client";
export { LATEST_VERSION as SCHEMA_VERSION } from "./migrations";
export * as outbox from "./outbox";
export * as peerKeys from "./peer-keys";
export type { PeerDeviceInput } from "./peer-keys";
export type {
  ChatRow,
  MessageRow,
  MemberRow,
  SyncCursorRow,
  PendingOutboxRow,
  KeyMaterialRow,
  PeerDeviceRow,
  MlsEngineStateRow,
  MlsGroupRow,
} from "./schema";
export * as mls from "./mls-store";
export type { MlsGroupUpsert, MlsGroupListItem } from "./mls-store";
