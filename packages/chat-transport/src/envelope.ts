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
  // Typing signal — ephemeral, never persisted. `on:true` on first keystroke
  // and re-sent as a heartbeat (~3s) while composing; `on:false` on send / blur
  // / idle. The Chat DO is a stateless relay — the receiver holds a short expiry
  // timer, so a dropped `on:false` (sender crash) self-clears with no server
  // TTL. Content-blind: whether someone is typing is metadata, no plaintext.
  | { t: "typ"; chatId: string; on: boolean }
  // Read receipt — high-water-mark, not per-message. `upto` is the greatest
  // serverMsgId (= serverSerial as string) the user has read. Server persists it
  // to ChatMember.lastReadSerial and fans out. Gated client-side by the
  // symmetric read-receipts privacy toggle (never emitted when off).
  | { t: "read"; chatId: string; upto: string }
  // Backfill request — catch up on messages missed while offline. One frame
  // carries every subscribed chat's cursor so a reconnect is a single WS frame
  // → N in-DO KV reads, 0 Chat DO wakeups (docs/message-backfill.md).
  //
  // `after` = the client's per-chat cursor (greatest serverSerial already held;
  // "0" = full history). Server returns rows with serverSerial > after.
  // `force: true` = ignore the KV skip-cache and hit Neon. The client sets it
  // the first time it backfills a given chat each app launch (fresh-login
  // correctness); warm same-session reconnects omit it and take the KV skip.
  | {
      t: "bf";
      chats: Array<{ chatId: string; after: string; force?: boolean }>;
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
  // Typing fanout — a peer in `chatId` started/stopped composing. Server stamps
  // `userId`; receiver renders the three-dot pulse (chat/DESIGN.md §Typing).
  // Never sent for the connection's own userId.
  | { t: "typ"; chatId: string; userId: string; on: boolean }
  // Read fanout — `userId` has read up to `upto` (serverMsgId string) in
  // `chatId`. Receiver advances that member's watermark; the sender's own
  // outgoing bubbles flip sent → read once a peer's `upto` covers their serial.
  | { t: "read"; chatId: string; userId: string; upto: string }
  // Backfill done — one page of missed messages for a single chat, in ascending
  // serverSerial order. The server emits one `bfd` per chat in the originating
  // `bf` batch (docs/message-backfill.md). Backfill stays distinct from the live
  // `msg` path so the store can merge-sort a page in one pass.
  //
  // `upTo` advances the client cursor even when rows are undecryptable (v=1
  // sealed to other devices, own sends) → no refetch-loop wedge; it is the
  // greatest serverSerial served, or the request's `after` when the page is
  // empty. `more: true` → another page exists; the client re-requests with
  // `after = upTo`.
  | {
      t: "bfd";
      chatId: string;
      messages: Array<{
        serverMsgId: string;
        senderId: string;
        ciphertext: Uint8Array;
        nonce: Uint8Array;
        ts: number;
      }>;
      upTo: string;
      more: boolean;
    }
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
