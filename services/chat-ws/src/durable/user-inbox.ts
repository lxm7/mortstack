import { DurableObject } from "cloudflare:workers";
import {
  decodeFrame,
  encodeFrame,
  type ClientToServer,
  type ServerToClient,
  type ChatErrorCode,
} from "@repo/chat-transport";

import { validateSendFrame } from "../validators";

// Per-user inbox DO. Holds 1..N device WebSocket connections for a single user
// and acts as the routing point between devices and Chat DOs the user is a
// member of.
//
// Hibernation: enabled via ctx.acceptWebSocket(). Subscriptions are persisted
// in ctx.storage so they survive eviction. Per-WS userId is kept on the
// WebSocket attachment.
//
// RPC surface (called by Chat DO):
//   - deliverBatch(frames[]) — fan a list of `msg` frames to all sockets
//   - ackBatch(frames[])     — fan a list of `ack` frames to all sockets
//   - error({ code, msg })   — single `err` frame, soft error (connection stays)

interface SocketAttachment {
  userId: string;
  // M6 — populated from the `?did=…` query param at WS upgrade. Used by the
  // attachedDeviceIds() RPC so Chat DO can skip push fanout for devices that
  // are currently online. Empty string when the client didn't send one.
  deviceId: string;
  // Random per-connection ID for debugging / future presence reporting.
  connId: string;
}

const SUB_KEY = "subscriptions";

type MsgFrame = Extract<ServerToClient, { t: "msg" }>;
type AckFrame = Extract<ServerToClient, { t: "ack" }>;
type MsgPayload = Omit<MsgFrame, "t">;
type AckPayload = Omit<AckFrame, "t">;

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
    const deviceId = request.headers.get("x-device-id") ?? "";

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    const attachment: SocketAttachment = {
      userId,
      deviceId,
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
    // Server-side defensive validation — README §M3 chunk 7. Rejects malformed
    // frames before they reach the Chat DO + Neon insert path.
    const verdict = validateSendFrame(env);
    if (!verdict.ok) {
      this.sendErr(ws, "BAD_FRAME", verdict.reason);
      return;
    }

    const stub = this.env.CHAT.get(this.env.CHAT.idFromName(env.chatId));
    try {
      await stub.acceptSend({
        senderId: userId,
        clientMsgId: env.clientMsgId,
        ciphertext: env.ciphertext,
        nonce: env.nonce,
        unencrypted: env.unencrypted,
      });
      // ack arrives async via ackBatch() after Chat DO persists.
    } catch {
      this.sendErr(ws, "PERSIST_FAILED", "send rejected");
    }
  }

  // ── Presence RPC (called by Chat DO before push fanout) ──────────────────
  // Returns the set of deviceIds with an open WS attached to this user. The
  // empty string is filtered out — pre-M6 clients connect without a `did`
  // query param and we treat those as "presence unknown" rather than
  // "device empty-string is online". Cheap: walks in-memory socket list.
  async attachedDeviceIds(): Promise<string[]> {
    const sockets = this.ctx.getWebSockets();
    if (sockets.length === 0) return [];
    const out = new Set<string>();
    for (const ws of sockets) {
      if (ws.readyState !== WebSocket.READY_STATE_OPEN) continue;
      const att = ws.deserializeAttachment() as SocketAttachment | null;
      if (!att || !att.deviceId) continue;
      out.add(att.deviceId);
    }
    return [...out];
  }

  // ── RPC entrypoints (called by Chat DO) ───────────────────────────────────

  // Fan a list of `msg` frames to every socket of this user. One RPC carries
  // N messages so a chat batch of 10 msgs to 50 recipients = 50 RPCs (not 500).
  async deliverBatch(payloads: MsgPayload[]): Promise<void> {
    if (payloads.length === 0) return;
    const sockets = this.ctx.getWebSockets();
    if (sockets.length === 0) return;
    const frames = payloads.map((p) =>
      encodeFrame({ t: "msg", ...p } satisfies ServerToClient),
    );
    for (const ws of sockets) {
      if (ws.readyState !== WebSocket.READY_STATE_OPEN) continue;
      for (const frame of frames) {
        try {
          ws.send(frame);
        } catch {
          // Drop failed send; close handler will clean up.
        }
      }
    }
  }

  // Fan a list of `ack` frames to every socket of this user (multi-device
  // sender sees acks on every device, flipping optimistic → confirmed).
  async ackBatch(payloads: AckPayload[]): Promise<void> {
    if (payloads.length === 0) return;
    const sockets = this.ctx.getWebSockets();
    if (sockets.length === 0) return;
    const frames = payloads.map((p) =>
      encodeFrame({ t: "ack", ...p } satisfies ServerToClient),
    );
    for (const ws of sockets) {
      if (ws.readyState !== WebSocket.READY_STATE_OPEN) continue;
      for (const frame of frames) {
        try {
          ws.send(frame);
        } catch {
          // ignore
        }
      }
    }
  }

  // Fan a single `mls-welcome` wake-up to every socket of this user. Called
  // by the Worker's /internal/notify endpoint after the API publishes one or
  // more Welcomes addressed to this user. Lets the client skip the 30s
  // background poll on new-chat and add-member-mid-conv flows.
  async notifyMlsWelcome(payload: { ts: number }): Promise<void> {
    const sockets = this.ctx.getWebSockets();
    if (sockets.length === 0) return;
    const frame = encodeFrame({
      t: "mls-welcome",
      ts: payload.ts,
    } satisfies ServerToClient);
    for (const ws of sockets) {
      if (ws.readyState !== WebSocket.READY_STATE_OPEN) continue;
      try {
        ws.send(frame);
      } catch {
        // ignore
      }
    }
  }

  // Send a single `err` frame to every socket of this user. Connection stays
  // open — errors are soft and routed by code.
  async error(payload: { code: ChatErrorCode; msg?: string }): Promise<void> {
    const sockets = this.ctx.getWebSockets();
    if (sockets.length === 0) return;
    const frame = encodeFrame({
      t: "err",
      code: payload.code,
      msg: payload.msg,
    } satisfies ServerToClient);
    for (const ws of sockets) {
      if (ws.readyState !== WebSocket.READY_STATE_OPEN) continue;
      try {
        ws.send(frame);
      } catch {
        // ignore
      }
    }
  }

  // ── Internal helpers ──────────────────────────────────────────────────────
  private sendErr(ws: WebSocket, code: ChatErrorCode, msg?: string): void {
    try {
      ws.send(encodeFrame({ t: "err", code, msg } satisfies ServerToClient));
    } catch {
      // ignore
    }
  }
}
