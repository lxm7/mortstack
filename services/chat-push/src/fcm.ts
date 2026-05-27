// FCM HTTP v1 dispatch (D4) — raw fetch + google-auth-library, no SDK.
//
// One OAuth2 access token per Lambda container, cached ~55 min (Google
// tokens are valid 1 h; refresh 5 min early). Per-device send via the
// `messages:send` endpoint; no batch because FCM batches are deprecated
// in v1 and `sendEach` from firebase-admin runs the same per-device fanout
// under the hood — keeping it explicit here avoids the 30 MB SDK.
//
// Data-only message (D9): the app's FirebaseMessagingService receives the
// data payload while the device is dozing, decrypts via the sealed MLS
// snapshot, and posts a NotificationCompat with plaintext. No `notification`
// field — that would let FCM render a system notification before decrypt
// and break the E2E UX.

import { JWT } from "google-auth-library";
import { Resource } from "sst";

const FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const TOKEN_CACHE_MS = 55 * 60 * 1000;

interface FcmTarget {
  id: string;
  token: string;
}

interface FcmEvent {
  chatId: string;
  serverMsgId: string;
  senderId: string;
  ciphertextB64: string;
  nonceB64: string;
  ts: number;
}

export interface FcmResult {
  tokenId: string;
  ok: boolean;
  status: number;
  dead: boolean;
}

interface ServiceAccount {
  client_email: string;
  private_key: string;
  project_id: string;
}

let cachedSa: ServiceAccount | null = null;
function getServiceAccount(): ServiceAccount {
  if (cachedSa) return cachedSa;
  cachedSa = JSON.parse(Resource.FcmServiceAccount.value) as ServiceAccount;
  return cachedSa;
}

let cachedJwt: { client: JWT; exp: number } | null = null;
function getAuth(): JWT {
  if (cachedJwt && cachedJwt.exp > Date.now()) return cachedJwt.client;
  const sa = getServiceAccount();
  const client = new JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: [FCM_SCOPE],
  });
  cachedJwt = { client, exp: Date.now() + TOKEN_CACHE_MS };
  return client;
}

async function sendOne(
  target: FcmTarget,
  ev: FcmEvent,
  accessToken: string,
  projectId: string,
): Promise<FcmResult> {
  const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
  const body = {
    message: {
      token: target.token,
      // Data values must be strings per FCM v1 spec.
      data: {
        chatId: ev.chatId,
        serverMsgId: ev.serverMsgId,
        senderId: ev.senderId,
        c: ev.ciphertextB64,
        n: ev.nonceB64,
        ts: String(ev.ts),
      },
      android: {
        priority: "HIGH",
        collapse_key: ev.serverMsgId.slice(0, 64),
        // ttl=0 means "deliver immediately or drop" — for chat we'd rather
        // re-send on next online than wake the device hours later.
        ttl: "0s",
      },
    },
  };

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const status = resp.status;
    if (status === 200) {
      return { tokenId: target.id, ok: true, status, dead: false };
    }
    let dead = false;
    if (status === 404) dead = true;
    else if (status === 400) {
      const txt = await resp.text();
      if (
        txt.includes("UNREGISTERED") ||
        txt.includes("INVALID_ARGUMENT") ||
        txt.includes("registration-token-not-registered")
      ) {
        dead = true;
      }
    }
    return { tokenId: target.id, ok: false, status, dead };
  } catch {
    return { tokenId: target.id, ok: false, status: 0, dead: false };
  }
}

export async function sendFcm(
  targets: FcmTarget[],
  ev: FcmEvent,
): Promise<FcmResult[]> {
  const auth = getAuth();
  const sa = getServiceAccount();
  const { token: accessToken } = await auth.getAccessToken().then((r) => ({
    token: typeof r === "string" ? r : (r?.token ?? ""),
  }));
  if (!accessToken) {
    return targets.map((t) => ({
      tokenId: t.id,
      ok: false,
      status: 0,
      dead: false,
    }));
  }
  return Promise.all(
    targets.map((t) => sendOne(t, ev, accessToken, sa.project_id)),
  );
}
