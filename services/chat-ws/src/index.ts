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

    // Bearer token rides in `?token=<urlencoded>` query param. WS subprotocol
    // header (RFC 6455 tchar) can't carry Better Auth tokens that include `=`
    // padding. Client sends:
    //   new WebSocket(`${url}?token=${encodeURIComponent(token)}`)
    const token = url.searchParams.get("token") ?? "";
    if (!token) {
      return new Response("missing token query param", { status: 401 });
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

// ── Internal push surface ───────────────────────────────────────────────────
//
// POST /internal/notify
//   header:  x-chat-ws-secret: <ChatWsHmacSecret>
//   body:    { userIds: string[], frame: { kind: "mls-welcome" } }
//   200:     { delivered: number }
//   401:     bad/missing secret
//
// API Lambda fans wake-up signals here (e.g. on mls.groups.publishWelcomes
// success) so the recipient's UserInbox DOs can push to all connected
// sockets without waiting for the 30s background poll. Single trusted
// caller — the API Lambda — guarded by the same shared HMAC.

interface InternalNotifyBody {
  userIds?: string[];
  frame?: { kind?: string };
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
