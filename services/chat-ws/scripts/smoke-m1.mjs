/* global process, console, WebSocket, setTimeout, clearTimeout */
// M1 smoke test — proves Worker auth + UserInbox routing + bidirectional path.
//
// Connects to chat-ws with a Better Auth bearer, asserts:
//   1. Server emits a `hello` frame on open
//   2. msgpack `{t:"ping"}` round-trips to `{t:"pong"}`
//
// No DB rows required. Validates everything M1 needs except the persist path
// (that requires a real Chat row + members; M4 covers it).
//
// Usage:
//   CHAT_WS_URL=wss://chat-ws-xxx.workers.dev BEARER=<token> \
//     pnpm --filter @repo/chat-ws smoke:m1

import { encode, decode } from "@msgpack/msgpack";

const url = process.env.CHAT_WS_URL;
const token = process.env.BEARER;
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS ?? 8000);

if (!url || !token) {
  console.error("CHAT_WS_URL and BEARER env vars required");
  process.exit(2);
}

const ws = new WebSocket(url, ["bearer", token]);
ws.binaryType = "arraybuffer";

let helloSeen = false;
let pongSeen = false;

const timeout = setTimeout(() => {
  console.error(
    `FAIL — timeout after ${timeoutMs}ms (hello=${helloSeen} pong=${pongSeen})`,
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
    ws.send(encode({ t: "ping" }));
    return;
  }

  if (frame?.t === "pong") {
    pongSeen = true;
  }

  if (helloSeen && pongSeen) {
    clearTimeout(timeout);
    console.log("PASS — M1 transport smoke");
    ws.close();
    process.exit(0);
  }
});

ws.addEventListener("error", () => {
  // RN/Node WebSocket error events carry no useful payload.
  console.error("[ws] error event");
});

ws.addEventListener("close", (ev) => {
  if (!(helloSeen && pongSeen)) {
    console.error(
      `FAIL — closed before pass (code=${ev.code} reason=${ev.reason ?? ""})`,
    );
    clearTimeout(timeout);
    process.exit(1);
  }
});
