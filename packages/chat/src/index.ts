export const CHAT_PACKAGE_VERSION = "0.0.0";

export {
  FRAME_VERSION,
  encryptOutbound,
  decryptInbound,
  DecryptError,
  FrameVersionError,
  type ChatFrame,
  type FanoutTarget,
  type OutboundEnvelope,
  type RecipientDevice,
} from "./crypto-pipe";

export {
  createEncryptedTransport,
  type EncryptedChatTransport,
  type EncryptedChatTransportOptions,
  type EncryptedIncomingMessage,
  type EncryptedSendInput,
  type EncryptedSendResult,
} from "./encrypted-transport";
