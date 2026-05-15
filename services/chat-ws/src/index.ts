// chat-ws Worker entry — handles WS upgrade, validates the bearer token via
// the API Lambda, and forwards the upgrade request to UserInbox<userId>.

import { verifySession } from "./auth";
import { Chat } from "./durable/chat";
import { UserInbox } from "./durable/user-inbox";

export { Chat, UserInbox };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("chat-ws expects WebSocket upgrade", { status: 426 });
    }

    // Bearer token rides in `?token=<urlencoded>` query param. WS subprotocol
    // header (RFC 6455 tchar) can't carry Better Auth tokens that include `=`
    // padding. Client sends:
    //   new WebSocket(`${url}?token=${encodeURIComponent(token)}`)
    const token = new URL(request.url).searchParams.get("token") ?? "";
    if (!token) {
      return new Response("missing token query param", { status: 401 });
    }

    const session = await verifySession(env, token);
    if (!session) return new Response("unauthorized", { status: 401 });

    // Route to per-user inbox DO. idFromName makes routing deterministic.
    const stub = env.USER_INBOX.get(env.USER_INBOX.idFromName(session.userId));

    // Forward the upgrade with userId as a header so the DO doesn't need to
    // re-verify.
    const forwarded = new Request(request, {
      headers: new Headers(request.headers),
    });
    forwarded.headers.set("x-user-id", session.userId);

    return stub.fetch(forwarded);
  },
} satisfies ExportedHandler<Env>;
