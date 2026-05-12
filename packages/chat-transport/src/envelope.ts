// Wire envelope shared between RN client (@repo/chat-transport) and the
// Cloudflare Worker DOs (services/chat-ws).
//
// All envelopes are msgpack-encoded. ciphertext + nonce are raw bytes — the
// transport layer is content-blind. Encryption is M3's job.
//
// Type discriminator field is `t` (single char) to keep msgpack frames small.

export type ClientToServer =
  // Subscribe the user inbox to a set of chats. Sent on connect + when joining
  // new chats. Idempotent — server diffs against current subscription set.
  | { t: "sub"; chatIds: string[] }
  // Outbound message. Server assigns serverMsgId on persist; client correlates
  // by clientMsgId.
  | {
      t: "send";
      chatId: string;
      clientMsgId: string;
      ciphertext: Uint8Array;
      nonce: Uint8Array;
    }
  // Heartbeat — answered with `pong`. Auto-handled when supported by the
  // platform; manual fallback for clients without auto-ping.
  | { t: "ping" };

export type ServerToClient =
  // Sender ack — message persisted to Postgres + broadcast to chat DO.
  | { t: "ack"; clientMsgId: string; serverMsgId: string; ts: number }
  // Inbound message for a chat the user is subscribed to.
  | {
      t: "msg";
      chatId: string;
      serverMsgId: string;
      senderId: string;
      ciphertext: Uint8Array;
      nonce: Uint8Array;
      ts: number;
    }
  // Hello frame — server confirms connection bound to this userId. Sent once
  // immediately after WS upgrade.
  | { t: "hello"; userId: string; ts: number }
  // Soft error — connection stays open. Use error.code for routing.
  | { t: "err"; code: ChatErrorCode; msg?: string }
  | { t: "pong" };

export type Envelope = ClientToServer | ServerToClient;

export type ChatErrorCode =
  | "AUTH_FAILED"
  | "NOT_A_MEMBER"
  | "RATE_LIMITED"
  | "PERSIST_FAILED"
  | "BAD_FRAME"
  | "INTERNAL";
