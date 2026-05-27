export const CHAT_PACKAGE_VERSION = "0.0.0";

export {
  FRAME_VERSION,
  FRAME_VERSION_V1,
  FRAME_VERSION_V2,
  encryptOutbound,
  encryptOutboundMls,
  decryptInbound,
  DecryptError,
  FrameVersionError,
  type ChatFrame,
  type FanoutTarget,
  type MlsApi,
  type OutboundEnvelope,
  type OutboundMlsEnvelope,
  type RecipientDevice,
  type EncryptOutboundOpts,
  type EncryptOutboundMlsOpts,
  type DecryptInboundOpts,
  type DecryptInboundResult,
} from "./crypto-pipe";

export {
  createEncryptedTransport,
  type EncryptedChatTransport,
  type EncryptedChatTransportOptions,
  type EncryptedIncomingMessage,
  type EncryptedSendInput,
  type EncryptedSendResult,
} from "./encrypted-transport";

// ── Store + hooks (M4-3) ───────────────────────────────────────────────────
export { useChatStore, type ChatStore, type ChatStoreState } from "./store";
export {
  useChats,
  useChat,
  useMessages,
  useSendMessage,
  type UseChatsResult,
  type UseChatResult,
  type UseMessagesResult,
  type UseSendMessageResult,
} from "./hooks";
export { ChatStoreProvider, type ChatStoreProviderProps } from "./provider";
export type {
  ChatApi,
  ChatRecord,
  Member,
  Message,
  MessageStatus,
  ChatListInput,
  ChatListOutput,
  ChatCreateInput,
  ChatCreateOutput,
  UserSearchInput,
  UserSearchOutput,
  MessagePersistApi,
  PersistMessageInput,
} from "./types";
