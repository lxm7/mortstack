// Verify a Better Auth bearer token by asking the API Lambda. Cheap on connect
// (one round-trip per WS open) — never per message.
//
// Future: short-lived JWT minted by Lambda at login + verified at the edge with
// shared HS256 secret would remove this round-trip entirely. Defer until WS
// connect latency is measured under load.

export interface VerifySessionResult {
  userId: string;
}

export async function verifySession(
  env: Env,
  bearerToken: string,
): Promise<VerifySessionResult | null> {
  const url = `${env.API_INTERNAL_URL.replace(/\/$/, "")}/internal/chat/verify-session`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-chat-ws-secret": env.CHAT_WS_HMAC_SECRET,
    },
    body: JSON.stringify({ token: bearerToken }),
  });

  if (resp.status !== 200) return null;

  const body = (await resp.json()) as { userId?: string };
  if (!body.userId || typeof body.userId !== "string") return null;
  return { userId: body.userId };
}
