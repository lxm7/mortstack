/* global process, console, WebSocket, setTimeout, clearTimeout, TextEncoder, crypto */
// M2 smoke test — full path: WS auth → sub → send → ack from Neon-direct path.
//
// Validates the ADR-010 (Worker → Neon direct) + ADR-012 (DO-assigned serial)
// cutover end-to-end. The ack frame's `serverMsgId` is the BigInt-stringified
// per-chat serial assigned by the Chat DO and persisted to Neon.
//
// Prereqs (operator runs once before invoking):
//
//   1. Sign up a smoke user via the API:
//        curl -X POST $API_URL/auth/sign-up/email \
//          -H 'Content-Type: application/json' \
//          -d '{"email":"smoke@example.com","password":"password123","name":"Smoke"}'
//      Capture the `set-auth-token` response header value → BEARER.
//      Note the AuthUser.id for the user in the DB → USER_ID.
//
//   2. Seed a Chat + ChatMember rows in Neon (psql or Prisma Studio):
//        INSERT INTO "Chat" (id, kind) VALUES ('smoke-chat-001', 'DIRECT');
//        INSERT INTO "ChatMember" (id, "chatId", "userId")
//          VALUES ('smoke-mem-1', 'smoke-chat-001', '<USER_ID>');
//
//   3. Run:
//        CHAT_WS_URL=wss://chat-ws-xxx.workers.dev \
//        BEARER=<token>               \
//        CHAT_ID=smoke-chat-001       \
//          pnpm --filter @repo/chat-ws smoke:m2
//
// Asserts:
//   1. `hello` frame on open
//   2. `ack` frame comes back with non-empty `serverMsgId` and matching
//      `clientMsgId` within timeout.
//
// No deps beyond `@msgpack/msgpack` (already in chat-ws devDeps).

import { encode, decode } from "@msgpack/msgpack";

const url = process.env.CHAT_WS_URL;
const token = process.env.BEARER;
const chatId = process.env.CHAT_ID;
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS ?? 10000);

if (!url || !token || !chatId) {
  console.error(
    "CHAT_WS_URL, BEARER, and CHAT_ID env vars required. See script header.",
  );
  process.exit(2);
}

const clientMsgId = `smoke-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const ciphertext = new TextEncoder().encode(`smoke-payload-${clientMsgId}`);
const nonce = new Uint8Array(12);
crypto.getRandomValues(nonce);

const ws = new WebSocket(`${url}?token=${encodeURIComponent(token)}`);
ws.binaryType = "arraybuffer";

let helloSeen = false;
let ackSeen = false;

const timeout = setTimeout(() => {
  console.error(
    `FAIL — timeout after ${timeoutMs}ms (hello=${helloSeen} ack=${ackSeen})`,
  );
  try {
    ws.close();
  } catch {
    /* ignore */
  }
  process.exit(1);
}, timeoutMs);

ws.addEventListener("open", () => {
  console.log("[ws] open");
});

ws.addEventListener("message", (ev) => {
  if (typeof ev.data === "string") {
    console.log("[ws] text frame (unexpected):", ev.data);
    return;
  }
  let frame;
  try {
    frame = decode(new Uint8Array(ev.data));
  } catch (err) {
    console.error("[ws] msgpack decode failed", err);
    return;
  }
  console.log("[ws] frame", frame);

  if (frame?.t === "hello") {
    helloSeen = true;
    // Subscribe to the chat so UserInbox attaches to the Chat DO.
    ws.send(encode({ t: "sub", chatIds: [chatId] }));
    // Small delay so the sub RPC lands before we send. The transport will
    // also queue if needed — both paths should succeed.
    setTimeout(() => {
      ws.send(
        encode({
          t: "send",
          chatId,
          clientMsgId,
          ciphertext,
          nonce,
        }),
      );
    }, 100);
    return;
  }

  if (frame?.t === "err") {
    console.error("FAIL — server err frame", frame);
    clearTimeout(timeout);
    try {
      ws.close();
    } catch {
      /* ignore */
    }
    process.exit(1);
  }

  if (frame?.t === "ack" && frame.clientMsgId === clientMsgId) {
    if (
      typeof frame.serverMsgId === "string" &&
      frame.serverMsgId.length > 0
    ) {
      ackSeen = true;
      clearTimeout(timeout);
      console.log(
        `PASS — M2 persist+ack (clientMsgId=${clientMsgId} serverMsgId=${frame.serverMsgId})`,
      );
      try {
        ws.close();
      } catch {
        /* ignore */
      }
      process.exit(0);
    } else {
      console.error("FAIL — ack with empty serverMsgId", frame);
      clearTimeout(timeout);
      process.exit(1);
    }
  }
});

ws.addEventListener("error", () => {
  console.error("[ws] error event");
});

ws.addEventListener("close", (ev) => {
  console.log(`[ws] close code=${ev.code} reason=${ev.reason}`);
  if (!ackSeen) {
    clearTimeout(timeout);
    process.exit(1);
  }
});
