import type {
  ChatTransport,
  ConnectionState,
  IncomingError,
  IncomingMessage,
  SendResult,
} from "@repo/chat-transport/client";

import {
  decryptInbound,
  encryptOutbound,
  encryptOutboundMls,
  FRAME_VERSION_V2,
  type ChatFrame,
  type FanoutTarget,
  type MlsApi,
} from "./crypto-pipe";

export interface EncryptedSendInput {
  chatId: string;
  text: string;
  /** Required for v=1 chats; ignored for v=2 (MLS routes by groupId). */
  targets: FanoutTarget[];
}

export interface EncryptedSendResultV1 extends SendResult {
  recipientAccountId: string;
  recipientDeviceId: string;
  frameVersion: 1;
}

export interface EncryptedSendResultV2 extends SendResult {
  frameVersion: 2;
}

export type EncryptedSendResult = EncryptedSendResultV1 | EncryptedSendResultV2;

export interface EncryptedIncomingMessage {
  chatId: string;
  serverMsgId: string;
  senderId: string;
  frame: ChatFrame;
  frameVersion: 1 | 2;
  ts: number;
}

export interface EncryptedChatTransport {
  readonly state: ConnectionState;
  connect(): void;
  close(): void;
  subscribe(chatIds: string[]): void;
  send(input: EncryptedSendInput): Promise<EncryptedSendResult[]>;
  onMessage(handler: (msg: EncryptedIncomingMessage) => void): () => void;
  onState(handler: (state: ConnectionState) => void): () => void;
  onError(handler: (err: IncomingError) => void): () => void;
}

export interface EncryptedChatTransportOptions {
  underlying: ChatTransport;

  // v=1 needs the libsodium seed (our X25519 secret half). Kept async so the
  // caller can lazy-load from secure storage.
  getMySeed: () => Promise<Uint8Array>;

  // Identity helper retained for parity with the MLS path. Currently unused
  // on the v=1 happy path; v=1 decrypt routes by X25519 pub.
  getMyAccountId: () => Promise<string>;

  // v=1: ordered X25519 pubs for the sender's known devices, most-recent
  // first to reduce avg attempts.
  resolveSenderX25519Pubs: (senderAccountId: string) => Promise<Uint8Array[]>;

  // v=2 (optional — chats without a resolved groupId stay on v=1):
  // Maps a chatId to its MLS GroupId bytes. Return null for v=1-only chats.
  // Backed by chats.mls_group_id in chat-db (Chunk 5 schema).
  resolveChatGroupId?: (chatId: string) => Promise<Uint8Array | null>;

  // v=2: the MLS engine. Required when resolveChatGroupId can return non-null.
  // Bound to the caller's MlsClient on the mobile side; tests inject a mock.
  mls?: MlsApi;

  // Invoked when a frame can't be decrypted with any candidate key. Useful
  // for telemetry / surfacing "key directory may be stale" to the UI.
  // Failure to decrypt does NOT crash the connection.
  onDecryptFailure?: (msg: IncomingMessage, reason: string) => void;
}

export function createEncryptedTransport(
  opts: EncryptedChatTransportOptions,
): EncryptedChatTransport {
  const { underlying } = opts;
  const decryptedHandlers = new Set<(msg: EncryptedIncomingMessage) => void>();

  // Lazy single subscription against the underlying transport that demuxes
  // decrypted messages to all registered handlers. Set up on first handler
  // registration so the wrapper costs nothing when unused.
  let unsubscribeFromUnderlying: (() => void) | null = null;

  function ensureUnderlyingSubscription() {
    if (unsubscribeFromUnderlying) return;
    unsubscribeFromUnderlying = underlying.onMessage((msg) => {
      void handleInbound(msg);
    });
  }

  async function handleInbound(msg: IncomingMessage) {
    // Peek the version byte before doing any lookups — v=2 skips the v=1
    // peer-pub directory hit entirely.
    if (msg.ciphertext.length === 0) {
      opts.onDecryptFailure?.(msg, "empty ciphertext");
      return;
    }
    const version = msg.ciphertext[0];

    if (version === FRAME_VERSION_V2) {
      if (!opts.mls || !opts.resolveChatGroupId) {
        opts.onDecryptFailure?.(
          msg,
          "v=2 frame received but no MLS engine configured",
        );
        return;
      }
      let groupId: Uint8Array | null;
      try {
        groupId = await opts.resolveChatGroupId(msg.chatId);
      } catch (err) {
        opts.onDecryptFailure?.(msg, `groupId lookup failed: ${String(err)}`);
        return;
      }
      if (!groupId) {
        opts.onDecryptFailure?.(
          msg,
          `v=2 frame for chat ${msg.chatId} but no mls_group_id locally`,
        );
        return;
      }
      try {
        const result = decryptInbound({
          ciphertext: msg.ciphertext,
          nonce: msg.nonce,
          senderAccountId: msg.senderId,
          // v=2 doesn't need seed/candidates; pass empties to satisfy the
          // shared input shape.
          seed: new Uint8Array(0),
          candidateSenderX25519Pubs: [],
          mls: opts.mls,
          mlsGroupId: groupId,
        });
        if (result.frameVersion !== 2) {
          throw new Error("expected v=2 result for v=2 ciphertext");
        }
        dispatch(msg, result.frame, 2);
      } catch (err) {
        opts.onDecryptFailure?.(msg, String(err));
      }
      return;
    }

    // v=1 libsodium path.
    let seed: Uint8Array;
    let candidates: Uint8Array[];
    try {
      seed = await opts.getMySeed();
      candidates = await opts.resolveSenderX25519Pubs(msg.senderId);
    } catch (err) {
      opts.onDecryptFailure?.(msg, `pre-decrypt lookup failed: ${String(err)}`);
      return;
    }
    try {
      const result = decryptInbound({
        ciphertext: msg.ciphertext,
        nonce: msg.nonce,
        senderAccountId: msg.senderId,
        seed,
        candidateSenderX25519Pubs: candidates,
      });
      if (result.frameVersion !== 1) {
        throw new Error("expected v=1 result for v=1 ciphertext");
      }
      dispatch(msg, result.frame, 1);
    } catch (err) {
      opts.onDecryptFailure?.(msg, String(err));
    }
  }

  function dispatch(msg: IncomingMessage, frame: ChatFrame, version: 1 | 2) {
    const decoded: EncryptedIncomingMessage = {
      chatId: msg.chatId,
      serverMsgId: msg.serverMsgId,
      senderId: msg.senderId,
      frame,
      frameVersion: version,
      ts: msg.ts,
    };
    for (const h of decryptedHandlers) h(decoded);
  }

  async function send(
    input: EncryptedSendInput,
  ): Promise<EncryptedSendResult[]> {
    // v=2 takes priority when configured: any chat with a resolved mls_group_id
    // sends as a single MLS application message. Falls through to v=1 only
    // when no groupId is registered (legacy 1:1 chats pre-M3.5).
    if (opts.mls && opts.resolveChatGroupId) {
      const groupId = await opts.resolveChatGroupId(input.chatId);
      if (groupId) {
        const env = encryptOutboundMls({
          text: input.text,
          groupId,
          mls: opts.mls,
        });
        const r = await underlying.send({
          chatId: input.chatId,
          ciphertext: env.ciphertext,
          nonce: env.nonce,
        });
        return [{ ...r, frameVersion: 2 }];
      }
    }

    const seed = await opts.getMySeed();
    const envelopes = encryptOutbound({
      text: input.text,
      targets: input.targets,
      seed,
    });
    if (envelopes.length === 0) return [];

    const sends = envelopes.map((env) =>
      underlying
        .send({
          chatId: input.chatId,
          ciphertext: env.ciphertext,
          nonce: env.nonce,
        })
        .then(
          (r): EncryptedSendResultV1 => ({
            ...r,
            recipientAccountId: env.recipientAccountId,
            recipientDeviceId: env.recipientDeviceId,
            frameVersion: env.frameVersion,
          }),
        ),
    );
    return Promise.all(sends);
  }

  function onMessage(handler: (m: EncryptedIncomingMessage) => void) {
    decryptedHandlers.add(handler);
    ensureUnderlyingSubscription();
    return () => {
      decryptedHandlers.delete(handler);
      if (decryptedHandlers.size === 0 && unsubscribeFromUnderlying) {
        unsubscribeFromUnderlying();
        unsubscribeFromUnderlying = null;
      }
    };
  }

  return {
    get state() {
      return underlying.state;
    },
    connect: () => underlying.connect(),
    close: () => underlying.close(),
    subscribe: (chatIds) => underlying.subscribe(chatIds),
    send,
    onMessage,
    onState: (handler) => underlying.onState(handler),
    onError: (handler) => underlying.onError(handler),
  };
}
