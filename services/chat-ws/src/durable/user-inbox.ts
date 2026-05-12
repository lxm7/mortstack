import { DurableObject } from "cloudflare:workers";
import {
  decodeFrame,
  encodeFrame,
  type ClientToServer,
  type ServerToClient,
} from "@repo/chat-transport";

// Per-user inbox DO. Holds 1..N device WebSocket connections for a single user
// and acts as the routing point between devices and Chat DOs the user is a
// member of.
//
// Hibernation: enabled via ctx.acceptWebSocket(). Subscriptions are persisted
// in ctx.storage so they survive eviction. Per-WS userId is kept on the
// WebSocket attachment.

interface SocketAttachment {
  userId: string;
  // Random per-connection ID for debugging / future presence reporting.
  connId: string;
}

const SUB_KEY = "subscriptions";

export class UserInbox extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // Server-handled ping/pong does not wake the DO (cheap heartbeats).
    this.ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair("ping", "pong"),
    );
  }

  // ── HTTP entrypoint (WS upgrade) ──────────────────────────────────────────
  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("expected websocket", { status: 426 });
    }

    const userId = request.headers.get("x-user-id");
    if (!userId) return new Response("missing user", { status: 400 });

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    const attachment: SocketAttachment = {
      userId,
      connId: crypto.randomUUID(),
    };
    server.serializeAttachment(attachment);

    this.ctx.acceptWebSocket(server);

    // Send hello immediately so the client knows the WS is fully bound.
    server.send(
      encodeFrame({
        t: "hello",
        userId,
        ts: Date.now(),
      } satisfies ServerToClient),
    );

    // Re-apply prior subscriptions (UserInbox may have had them before
    // hibernating). New device connections see an empty hello + must sub
    // again — we still keep prior subscriptions so any inbound `msg` from
    // chats this user is in still routes to all attached sockets.
    return new Response(null, { status: 101, webSocket: client });
  }

  // ── WS message handling ───────────────────────────────────────────────────
  async webSocketMessage(
    ws: WebSocket,
    message: ArrayBuffer | string,
  ): Promise<void> {
    if (typeof message === "string") {
      // Reject text frames — protocol is binary msgpack only.
      this.sendErr(ws, "BAD_FRAME", "text frames not supported");
      return;
    }
    const att = ws.deserializeAttachment() as SocketAttachment | null;
    if (!att) {
      ws.close(1011, "no attachment");
      return;
    }

    let env: ClientToServer;
    try {
      env = decodeFrame(message) as ClientToServer;
    } catch {
      this.sendErr(ws, "BAD_FRAME", "msgpack decode failed");
      return;
    }

    switch (env.t) {
      case "sub":
        await this.handleSubscribe(att.userId, env.chatIds);
        return;
      case "send":
        await this.handleSend(ws, att.userId, env);
        return;
      case "ping":
        ws.send(encodeFrame({ t: "pong" } satisfies ServerToClient));
        return;
    }
  }

  async webSocketClose(
    _ws: WebSocket,
    _code: number,
    _reason: string,
    _wasClean: boolean,
  ): Promise<void> {
    // Per-connection state lives on the WS attachment, so close is a no-op.
    // Subscription state is per-user (this DO), independent of socket lifetime.
  }

  // ── Subscription management ───────────────────────────────────────────────
  private async handleSubscribe(
    userId: string,
    chatIds: string[],
  ): Promise<void> {
    const current = (
      (await this.ctx.storage.get<string[]>(SUB_KEY)) ?? []
    ).slice();
    const currentSet = new Set(current);
    const desiredSet = new Set(chatIds);

    const added = chatIds.filter((id) => !currentSet.has(id));
    const removed = current.filter((id) => !desiredSet.has(id));

    // Attach this user to each newly-subscribed chat DO so the Chat DO knows
    // who to broadcast to.
    await Promise.all(
      added.map((chatId) => {
        const stub = this.env.CHAT.get(this.env.CHAT.idFromName(chatId));
        return stub.attachInbox(userId);
      }),
    );
    await Promise.all(
      removed.map((chatId) => {
        const stub = this.env.CHAT.get(this.env.CHAT.idFromName(chatId));
        return stub.detachInbox(userId);
      }),
    );

    await this.ctx.storage.put(SUB_KEY, [...desiredSet]);
  }

  // ── Outbound send → Chat DO ───────────────────────────────────────────────
  private async handleSend(
    ws: WebSocket,
    userId: string,
    env: Extract<ClientToServer, { t: "send" }>,
  ): Promise<void> {
    const stub = this.env.CHAT.get(this.env.CHAT.idFromName(env.chatId));
    try {
      await stub.acceptSend({
        senderId: userId,
        clientMsgId: env.clientMsgId,
        ciphertext: env.ciphertext,
        nonce: env.nonce,
      });
      // ack is delivered async by Chat DO via this.ack() — no immediate ack
      // here, since Y semantics require the persist to land first.
    } catch {
      this.sendErr(ws, "PERSIST_FAILED", "send rejected");
    }
  }

  // ── RPC entrypoints (called by Chat DO) ───────────────────────────────────

  // Fan a delivered message to every connected device of this user.
  async deliver(payload: Extract<ServerToClient, { t: "msg" }>): Promise<void> {
    const sockets = this.ctx.getWebSockets();
    if (sockets.length === 0) return;
    const frame = encodeFrame(payload);
    for (const ws of sockets) {
      if (ws.readyState === WebSocket.READY_STATE_OPEN) {
        try {
          ws.send(frame);
        } catch {
          // Drop failed send; close handler will clean up.
        }
      }
    }
  }

  // Deliver an ack to the sender's devices (multi-device sender sees ack on
  // every device, so they all flip optimistic → confirmed).
  async ack(payload: Extract<ServerToClient, { t: "ack" }>): Promise<void> {
    const frame = encodeFrame(payload);
    for (const ws of this.ctx.getWebSockets()) {
      if (ws.readyState === WebSocket.READY_STATE_OPEN) {
        try {
          ws.send(frame);
        } catch {
          // ignore
        }
      }
    }
  }

  // ── Internal helpers ──────────────────────────────────────────────────────
  private sendErr(
    ws: WebSocket,
    code: Extract<ServerToClient, { t: "err" }>["code"],
    msg?: string,
  ): void {
    try {
      ws.send(encodeFrame({ t: "err", code, msg } satisfies ServerToClient));
    } catch {
      // ignore
    }
  }
}
