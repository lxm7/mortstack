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

    // Bearer token rides in `Sec-WebSocket-Protocol`. Client sends:
    //   new WebSocket(url, ["bearer", "<token>"])
    // The server must echo back one of the offered subprotocols.
    const protoHeader = request.headers.get("Sec-WebSocket-Protocol") ?? "";
    const protocols = protoHeader
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const bearerIndex = protocols.findIndex((p) => p === "bearer");
    if (bearerIndex === -1 || !protocols[bearerIndex + 1]) {
      return new Response("missing bearer subprotocol", { status: 401 });
    }
    const token = protocols[bearerIndex + 1]!;

    const session = await verifySession(env, token);
    if (!session) return new Response("unauthorized", { status: 401 });

    // Route to per-user inbox DO. idFromName makes routing deterministic.
    const stub = env.USER_INBOX.get(env.USER_INBOX.idFromName(session.userId));

    // Forward the upgrade with userId as a header so the DO doesn't need to
    // re-verify. Sec-WebSocket-Protocol must be echoed back by the DO's
    // Response or the client will reject the handshake.
    const forwarded = new Request(request, {
      headers: new Headers(request.headers),
    });
    forwarded.headers.set("x-user-id", session.userId);
    forwarded.headers.set("Sec-WebSocket-Protocol", "bearer");

    const upgradeResponse = await stub.fetch(forwarded);

    // Echo the chosen subprotocol on the 101 so the client accepts the WS.
    const headers = new Headers(upgradeResponse.headers);
    headers.set("Sec-WebSocket-Protocol", "bearer");
    return new Response(upgradeResponse.body, {
      status: upgradeResponse.status,
      headers,
      webSocket: upgradeResponse.webSocket,
    });
  },
} satisfies ExportedHandler<Env>;
