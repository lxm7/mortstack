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
  //
  // `unencrypted: true` — set ONLY for group sends until M3.5 (Sender Keys).
  // When present, the server skips the nonce/ciphertext length validators
  // (see services/chat-ws/src/validators.ts) and the `ciphertext` bytes are
  // a plaintext msgpack frame (no MAC). The receiver-side wrapper inspects
  // the same flag and skips decryption. 1:1 sends MUST omit it.
  | {
      t: "send";
      chatId: string;
      clientMsgId: string;
      ciphertext: Uint8Array;
      nonce: Uint8Array;
      unencrypted?: boolean;
    }
  // Heartbeat — answered with `pong`. Auto-handled when supported by the
  // platform; manual fallback for clients without auto-ping.
  | { t: "ping" };

export type ServerToClient =
  // Sender ack — message persisted to Postgres + broadcast to chat DO.
  | { t: "ack"; clientMsgId: string; serverMsgId: string; ts: number }
  // Inbound message for a chat the user is subscribed to.
  // `unencrypted: true` is propagated from the sender's `send` frame (see
  // ClientToServer) — receivers must skip decryption and treat `ciphertext`
  // as a plaintext msgpack frame when set.
  | {
      t: "msg";
      chatId: string;
      serverMsgId: string;
      senderId: string;
      ciphertext: Uint8Array;
      nonce: Uint8Array;
      ts: number;
      unencrypted?: boolean;
    }
  // Hello frame — server confirms connection bound to this userId. Sent once
  // immediately after WS upgrade.
  | { t: "hello"; userId: string; ts: number }
  // Wake-up signal: the API published one or more MLS Welcomes addressed to
  // this user (new chat created, or this user was added to an existing
  // group mid-conversation). Receiver should immediately call
  // mlsClient.pollPendingWelcomes() to consume them — bypasses the 30s
  // background poll. Best-effort: the 30s poll remains the correctness
  // guarantee in case the push fails or the client is offline at send time.
  | { t: "mls-welcome"; ts: number }
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
