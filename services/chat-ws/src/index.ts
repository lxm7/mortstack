// chat-ws Worker entry — handles WS upgrade, validates the bearer token via
// the API Lambda, and forwards the upgrade request to UserInbox<userId>.
//
// Also serves a small internal HTTP surface (/internal/notify) for the API
// Lambda to push wake-up frames to specific users — see handleInternal.

import { Resource } from "sst";
import { verifySession } from "./auth";
import { Chat } from "./durable/chat";
import { UserInbox } from "./durable/user-inbox";

export { Chat, UserInbox };

const INTERNAL_SECRET_HEADER = "x-chat-ws-secret";

// Decode a base64url string (no padding) — the client encodes the bearer this
// way so it survives as a Sec-WebSocket-Protocol tchar. Mirror of the encoder
// in packages/chat-transport/src/client.ts.
function base64UrlDecode(s: string): string {
  const b64 =
    s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  return atob(b64);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Internal API → Worker push path. Gated by the same HMAC secret used
    // in the reverse direction (Worker → API verify-session); never
    // reachable from a client.
    if (url.pathname.startsWith("/internal/")) {
      return handleInternal(request, env, url.pathname);
    }

    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("chat-ws expects WebSocket upgrade", { status: 426 });
    }

    // Bearer token rides in the WS subprotocol as `bearer, <base64url-token>`
    // — NOT the URL, so it never lands in access/request logs. Better Auth
    // tokens carry `=` padding (invalid as a Sec-WebSocket-Protocol tchar), so
    // the client base64url-encodes and we decode here. Keep in sync with
    // packages/chat-transport/src/client.ts.
    const proto = request.headers.get("Sec-WebSocket-Protocol") ?? "";
    const parts = proto.split(",").map((p) => p.trim());
    const encoded = parts[0] === "bearer" ? (parts[1] ?? "") : "";
    if (!encoded) {
      return new Response("missing token subprotocol", { status: 401 });
    }
    let token: string;
    try {
      token = base64UrlDecode(encoded);
    } catch {
      return new Response("bad token encoding", { status: 401 });
    }

    const session = await verifySession(env, token);
    if (!session) return new Response("unauthorized", { status: 401 });

    // M6: deviceId is optional. UserInbox stores it on the WS attachment so
    // Chat DO can ask "is this recipient device attached?" before publishing
    // a push event. Unknown / missing deviceId is treated as offline (= a
    // push will be sent), so this is safe to omit during client rollout.
    const deviceId = url.searchParams.get("did") ?? "";

    // Route to per-user inbox DO. idFromName makes routing deterministic.
    const stub = env.USER_INBOX.get(env.USER_INBOX.idFromName(session.userId));

    // Forward the upgrade with userId as a header so the DO doesn't need to
    // re-verify.
    const forwarded = new Request(request, {
      headers: new Headers(request.headers),
    });
    forwarded.headers.set("x-user-id", session.userId);
    if (deviceId) forwarded.headers.set("x-device-id", deviceId);

    return stub.fetch(forwarded);
  },
} satisfies ExportedHandler<Env>;

// ── Internal surface ────────────────────────────────────────────────────────
//
// POST /internal/notify
//   header:  x-chat-ws-secret: <ChatWsHmacSecret>
//   body:    { userIds: string[], frame: { kind: "mls-welcome" } }
//   200:     { delivered: number }
//   401:     bad/missing secret
//
// API Lambda fans wake-up signals here (e.g. on mls.groups.publishWelcomes
// success) so the recipient's UserInbox DOs can push to all connected
// sockets without waiting for the 30s background poll.
//
// POST /internal/session/purge  (ADR-0017 §3 — write-through invalidation)
//   header:  x-chat-ws-secret: <ChatWsHmacSecret>
//   body:    { tokenHash: string }   sha256(token) hex, computed API-side
//   200:     { purged: boolean }     false = delete failed; TTL is the backstop
//   401:     bad/missing secret
//
// The API's Better Auth sign-out / revoke hook (B1.4) computes sha256(token)
// and calls this so the edge session cache evicts immediately; the KV TTL
// bounds revocation lag if this call is ever missed. Raw tokens never reach
// this hop — only the hash — so a purge request can't be replayed as a bearer.
//
// Both endpoints share one trusted caller (the API Lambda) behind the same
// HMAC (verifyInternalAuth); never reachable from a client.

interface InternalNotifyBody {
  userIds?: string[];
  frame?: { kind?: string };
}

interface InternalPurgeBody {
  tokenHash?: string;
}

function verifyInternalAuth(request: Request): boolean {
  const got = request.headers.get(INTERNAL_SECRET_HEADER);
  if (!got) return false;
  const expected = Resource.ChatWsHmacSecret.value;
  if (got.length !== expected.length) return false;
  let acc = 0;
  for (let i = 0; i < got.length; i++) {
    acc |= got.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return acc === 0;
}

async function handleInternal(
  request: Request,
  env: Env,
  pathname: string,
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }
  if (!verifyInternalAuth(request)) {
    return new Response("unauthorized", { status: 401 });
  }

  if (pathname === "/internal/session/purge") {
    return handleSessionPurge(request, env);
  }
  if (pathname !== "/internal/notify") {
    return new Response("not found", { status: 404 });
  }

  let body: InternalNotifyBody;
  try {
    body = (await request.json()) as InternalNotifyBody;
  } catch {
    return new Response("bad json", { status: 400 });
  }

  const userIds = Array.isArray(body.userIds) ? body.userIds : [];
  const kind = body.frame?.kind;
  if (userIds.length === 0) {
    return new Response(JSON.stringify({ delivered: 0 }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
  if (kind !== "mls-welcome") {
    return new Response(`unknown frame kind: ${kind}`, { status: 400 });
  }

  const ts = Date.now();
  let delivered = 0;
  await Promise.all(
    userIds.map(async (userId) => {
      try {
        const stub = env.USER_INBOX.get(env.USER_INBOX.idFromName(userId));
        await stub.notifyMlsWelcome({ ts });
        delivered++;
      } catch {
        // best-effort; the 30s client poll is the correctness fallback
      }
    }),
  );

  return new Response(JSON.stringify({ delivered }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

// Evict a session from the edge cache (ADR-0017 §3). Body carries the hex
// sha256(token) — the same key auth.ts writes — so the raw token never reaches
// this hop. Best-effort: a failed delete returns { purged: false } (never 5xx),
// because the KV TTL is the revocation backstop and a caller must not fail its
// sign-out just because a cache eviction missed.
async function handleSessionPurge(
  request: Request,
  env: Env,
): Promise<Response> {
  let body: InternalPurgeBody;
  try {
    body = (await request.json()) as InternalPurgeBody;
  } catch {
    return new Response("bad json", { status: 400 });
  }

  const hash = body.tokenHash;
  // sha256 hex is exactly 64 lowercase hex chars — reject anything else so a
  // malformed caller can't spray junk keys at KV.
  if (typeof hash !== "string" || !/^[0-9a-f]{64}$/.test(hash)) {
    return new Response("bad tokenHash", { status: 400 });
  }

  let purged = true;
  try {
    await env.SESSION_CACHE.delete(hash);
  } catch {
    purged = false; // TTL backstops the missed eviction
  }

  return new Response(JSON.stringify({ purged }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
