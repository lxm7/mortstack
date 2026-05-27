import { nanoid } from "nanoid";

import { decodeFrame, encodeFrame } from "./codec";
import type { ClientToServer, Envelope, ServerToClient } from "./envelope";

export type ConnectionState =
  | "idle"
  | "connecting"
  | "open"
  | "reconnecting"
  | "closing"
  | "closed";

export type IncomingMessage = Extract<ServerToClient, { t: "msg" }>;
export type IncomingError = Extract<ServerToClient, { t: "err" }>;
export type IncomingMlsWelcome = Extract<ServerToClient, { t: "mls-welcome" }>;

export interface ChatTransportOptions {
  // Cloudflare Worker URL. Use ws:// for local wrangler, wss:// in prod.
  url: string;
  // Async — bearer token may live in SecureStore. Called on every connect.
  getToken: () => Promise<string | null>;
  // M6: optional device id appended to the WS URL as `?did=…`. The Worker
  // forwards it to UserInbox so a per-device presence hint can be attached
  // to chat.msg.delivered SNS events. If omitted, push fanout treats the
  // user as offline (= sends a push); only the dedupe efficiency is lost.
  getDeviceId?: () => Promise<string | null>;
  // Subscriptions are re-applied automatically on reconnect.
  initialSubscriptions?: string[];
  // Defaults below are reasonable; override in tests.
  heartbeatIntervalMs?: number;
  reconnectBaseMs?: number;
  reconnectMaxMs?: number;
  reconnectJitter?: number;
  // Network-status hint. When the host platform reports offline, we stop
  // retry attempts until it reports online again — saves battery on RN.
  isOnline?: () => boolean;
}

export interface SendInput {
  chatId: string;
  ciphertext: Uint8Array;
  nonce: Uint8Array;
}

export interface SendResult {
  serverMsgId: string;
  ts: number;
}

export interface ChatTransport {
  state: ConnectionState;
  connect(): void;
  close(): void;
  subscribe(chatIds: string[]): void;
  send(input: SendInput): Promise<SendResult>;
  onMessage(handler: (msg: IncomingMessage) => void): () => void;
  onState(handler: (state: ConnectionState) => void): () => void;
  onError(handler: (err: IncomingError) => void): () => void;
  onMlsWelcome(handler: (m: IncomingMlsWelcome) => void): () => void;
}

interface PendingSend {
  clientMsgId: string;
  payload: ClientToServer & { t: "send" };
  resolve: (r: SendResult) => void;
  reject: (e: Error) => void;
  // Time the user called send(); used for ack-timeout decisions later.
  enqueuedAt: number;
}

const DEFAULT_HEARTBEAT_MS = 25_000;
const DEFAULT_BACKOFF_BASE_MS = 500;
const DEFAULT_BACKOFF_MAX_MS = 30_000;
const DEFAULT_BACKOFF_JITTER = 0.2;

export function createChatTransport(opts: ChatTransportOptions): ChatTransport {
  const heartbeatMs = opts.heartbeatIntervalMs ?? DEFAULT_HEARTBEAT_MS;
  const backoffBase = opts.reconnectBaseMs ?? DEFAULT_BACKOFF_BASE_MS;
  const backoffMax = opts.reconnectMaxMs ?? DEFAULT_BACKOFF_MAX_MS;
  const jitter = opts.reconnectJitter ?? DEFAULT_BACKOFF_JITTER;

  let ws: WebSocket | null = null;
  let state: ConnectionState = "idle";
  let attempt = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let explicitlyClosed = false;

  const subscriptions = new Set<string>(opts.initialSubscriptions ?? []);
  const pending = new Map<string, PendingSend>();
  const messageHandlers = new Set<(m: IncomingMessage) => void>();
  const stateHandlers = new Set<(s: ConnectionState) => void>();
  const errorHandlers = new Set<(e: IncomingError) => void>();
  const mlsWelcomeHandlers = new Set<(m: IncomingMlsWelcome) => void>();

  function setState(next: ConnectionState) {
    if (state === next) return;
    state = next;
    for (const h of stateHandlers) h(state);
  }

  function clearTimers() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  function scheduleReconnect() {
    if (explicitlyClosed) return;
    if (opts.isOnline && !opts.isOnline()) {
      setState("closed");
      return;
    }
    setState("reconnecting");
    const expBackoff = Math.min(backoffBase * 2 ** attempt, backoffMax);
    const jitterMs = expBackoff * jitter * (Math.random() * 2 - 1);
    const delay = Math.max(0, Math.floor(expBackoff + jitterMs));
    attempt += 1;
    reconnectTimer = setTimeout(() => connect(), delay);
  }

  function startHeartbeat() {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(() => {
      if (ws?.readyState === 1) {
        sendFrame({ t: "ping" });
      }
    }, heartbeatMs);
  }

  function sendFrame(env: ClientToServer) {
    if (!ws || ws.readyState !== 1) return;
    ws.send(encodeFrame(env));
  }

  function flushOnConnect() {
    if (subscriptions.size > 0) {
      sendFrame({ t: "sub", chatIds: [...subscriptions] });
    }
    // Re-send any pending messages (we don't know whether they reached the
    // server before the disconnect — server dedupes by clientMsgId).
    for (const p of pending.values()) sendFrame(p.payload);
  }

  function handleFrame(env: ServerToClient) {
    switch (env.t) {
      case "hello":
        // Connection ready. Reset backoff.
        attempt = 0;
        flushOnConnect();
        return;
      case "ack": {
        const p = pending.get(env.clientMsgId);
        if (!p) return;
        pending.delete(env.clientMsgId);
        p.resolve({ serverMsgId: env.serverMsgId, ts: env.ts });
        return;
      }
      case "msg":
        for (const h of messageHandlers) h(env);
        return;
      case "mls-welcome":
        for (const h of mlsWelcomeHandlers) h(env);
        return;
      case "err":
        for (const h of errorHandlers) h(env);
        return;
      case "pong":
        return;
    }
  }

  async function connect() {
    if (state === "open" || state === "connecting") return;
    explicitlyClosed = false;
    setState("connecting");

    const token = await opts.getToken();
    if (!token) {
      // No session — caller must re-attempt after auth. Stay closed.
      setState("closed");
      return;
    }

    try {
      // Bearer token rides in Sec-WebSocket-Protocol. RN's WebSocket accepts
      // a string or array as second arg; the server picks `bearer` and uses
      // the rest as the token.
      const deviceId = opts.getDeviceId ? await opts.getDeviceId() : null;
      const url = deviceId
        ? `${opts.url}${opts.url.includes("?") ? "&" : "?"}did=${encodeURIComponent(deviceId)}`
        : opts.url;
      ws = new WebSocket(url, ["bearer", token]);
      ws.binaryType = "arraybuffer";
    } catch {
      scheduleReconnect();
      return;
    }

    ws.onopen = () => {
      setState("open");
      startHeartbeat();
    };
    ws.onmessage = (event) => {
      try {
        const env = decodeFrame(event.data as ArrayBuffer | Uint8Array);
        handleFrame(env as ServerToClient);
      } catch {
        // Bad frame from server — ignore. Server is the source of truth.
      }
    };
    ws.onerror = () => {
      // Browsers + RN do not surface useful error info; rely on close handler
      // for reconnect decisions.
    };
    ws.onclose = () => {
      clearTimers();
      ws = null;
      if (explicitlyClosed) {
        setState("closed");
        return;
      }
      scheduleReconnect();
    };
  }

  function close() {
    explicitlyClosed = true;
    clearTimers();
    setState("closing");
    try {
      ws?.close();
    } catch {
      // ignore
    }
    ws = null;
    setState("closed");
  }

  function subscribe(chatIds: string[]) {
    let changed = false;
    for (const id of chatIds) {
      if (!subscriptions.has(id)) {
        subscriptions.add(id);
        changed = true;
      }
    }
    if (changed && state === "open") {
      sendFrame({ t: "sub", chatIds: [...subscriptions] });
    }
  }

  function send(input: SendInput): Promise<SendResult> {
    return new Promise<SendResult>((resolve, reject) => {
      const clientMsgId = nanoid(21);
      const payload: ClientToServer & { t: "send" } = {
        t: "send",
        chatId: input.chatId,
        clientMsgId,
        ciphertext: input.ciphertext,
        nonce: input.nonce,
      };
      pending.set(clientMsgId, {
        clientMsgId,
        payload,
        resolve,
        reject,
        enqueuedAt: Date.now(),
      });
      // Best-effort transmit. If WS not open, the pending entry is replayed
      // on next connect via flushOnConnect().
      sendFrame(payload);
    });
  }

  function onMessage(handler: (m: IncomingMessage) => void) {
    messageHandlers.add(handler);
    return () => messageHandlers.delete(handler);
  }

  function onState(handler: (s: ConnectionState) => void) {
    stateHandlers.add(handler);
    return () => stateHandlers.delete(handler);
  }

  function onError(handler: (e: IncomingError) => void) {
    errorHandlers.add(handler);
    return () => errorHandlers.delete(handler);
  }

  function onMlsWelcome(handler: (m: IncomingMlsWelcome) => void) {
    mlsWelcomeHandlers.add(handler);
    return () => mlsWelcomeHandlers.delete(handler);
  }

  return {
    get state() {
      return state;
    },
    connect,
    close,
    subscribe,
    send,
    onMessage,
    onState,
    onError,
    onMlsWelcome,
  };
}

// Helper for the Worker side: opaque types are hard to consume from Workers
// build, so we re-export the union directly.
export type { Envelope };
