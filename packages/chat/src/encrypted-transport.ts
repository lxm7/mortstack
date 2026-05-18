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
  type ChatFrame,
  type FanoutTarget,
} from "./crypto-pipe";

export interface EncryptedSendInput {
  chatId: string;
  text: string;
  targets: FanoutTarget[];
}

export interface EncryptedSendResult extends SendResult {
  recipientAccountId: string;
  recipientDeviceId: string;
}

export interface EncryptedIncomingMessage {
  chatId: string;
  serverMsgId: string;
  senderId: string;
  frame: ChatFrame;
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
  getMySeed: () => Promise<Uint8Array>;
  // The on-wire envelope only carries senderAccountId, not senderDeviceId
  // (see crypto-pipe.ts). Caller resolves the sender's known X25519 pubs;
  // crypto-pipe tries each in order. Most-recent-first reduces avg attempts.
  resolveSenderX25519Pubs: (senderAccountId: string) => Promise<Uint8Array[]>;
  // Optional: invoked when a frame can't be decrypted with any candidate
  // key. Useful for telemetry / surfacing "key directory may be stale" to
  // the UI. Failure to decrypt does NOT crash the connection.
  onDecryptFailure?: (msg: IncomingMessage, reason: string) => void;
}

export function createEncryptedTransport(
  opts: EncryptedChatTransportOptions,
): EncryptedChatTransport {
  const { underlying } = opts;
  const decryptedHandlers = new Set<(msg: EncryptedIncomingMessage) => void>();

  // Single subscription against the underlying transport that demuxes
  // decrypted messages out to all registered handlers. Set up lazily on
  // first handler registration so the wrapper costs nothing if unused.
  let unsubscribeFromUnderlying: (() => void) | null = null;

  function ensureUnderlyingSubscription() {
    if (unsubscribeFromUnderlying) return;
    unsubscribeFromUnderlying = underlying.onMessage((msg) => {
      void handleInbound(msg);
    });
  }

  async function handleInbound(msg: IncomingMessage) {
    let seed: Uint8Array;
    let candidates: Uint8Array[];
    try {
      seed = await opts.getMySeed();
      candidates = await opts.resolveSenderX25519Pubs(msg.senderId);
    } catch (err) {
      opts.onDecryptFailure?.(msg, `pre-decrypt lookup failed: ${String(err)}`);
      return;
    }

    let result;
    try {
      result = decryptInbound({
        ciphertext: msg.ciphertext,
        nonce: msg.nonce,
        seed,
        candidateSenderX25519Pubs: candidates,
      });
    } catch (err) {
      opts.onDecryptFailure?.(msg, String(err));
      return;
    }

    const decoded: EncryptedIncomingMessage = {
      chatId: msg.chatId,
      serverMsgId: msg.serverMsgId,
      senderId: msg.senderId,
      frame: result.frame,
      ts: msg.ts,
    };
    for (const h of decryptedHandlers) h(decoded);
  }

  async function send(
    input: EncryptedSendInput,
  ): Promise<EncryptedSendResult[]> {
    const seed = await opts.getMySeed();
    const envelopes = encryptOutbound({
      text: input.text,
      seed,
      targets: input.targets,
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
          (r): EncryptedSendResult => ({
            ...r,
            recipientAccountId: env.recipientAccountId,
            recipientDeviceId: env.recipientDeviceId,
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
