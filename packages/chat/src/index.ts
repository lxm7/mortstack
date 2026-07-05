export const CHAT_PACKAGE_VERSION = "0.0.0";

export {
  FRAME_VERSION,
  FRAME_VERSION_V1,
  FRAME_VERSION_V2,
  encryptOutbound,
  encryptOutboundMls,
  decryptInbound,
  isReactionFrame,
  DecryptError,
  FrameVersionError,
  type ChatFrame,
  type ChatMsgFrame,
  type ChatReactionFrame,
  type ChatFrameBody,
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
  createOutboxWorker,
  type BoundOutboxApi,
  type OutboxWorker,
  type OutboxWorkerDeps,
  type OutboxWorkerStoreApi,
} from "./outbox-worker";
export {
  useChats,
  useChat,
  useMessages,
  useSendMessage,
  useRetryMessage,
  useDeleteMessage,
  useReactToMessage,
  useReactions,
  useTypers,
  useIsReadByPeer,
  useTypingEmitter,
  useReadEmitter,
  type UseChatsResult,
  type UseChatResult,
  type UseMessagesResult,
  type UseSendMessageResult,
  type UseRetryMessageResult,
  type UseDeleteMessageResult,
  type UseReactToMessageResult,
  type UseTypingEmitterResult,
  type UseReadEmitterResult,
} from "./hooks";
export {
  ChatStoreProvider,
  useChatTransport,
  useOutbox,
  useOutboxWorker,
  type ChatStoreProviderProps,
} from "./provider";
export type {
  ChatApi,
  ChatRecord,
  Member,
  Message,
  MessageStatus,
  Reaction,
  ChatListInput,
  ChatListOutput,
  ChatCreateInput,
  ChatCreateOutput,
  UserSearchInput,
  UserSearchOutput,
  MessagePersistApi,
  PersistMessageInput,
} from "./types";
