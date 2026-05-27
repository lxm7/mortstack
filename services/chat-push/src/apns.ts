// APNs HTTP/2 dispatch (D3) — raw node:http2 + JWT, no SDK.
//
// One persistent multiplexed h2 client per Lambda container; APNs allows
// thousands of concurrent streams on a single connection. JWT is cached for
// 10 minutes — Apple permits up to 1 hour but a tighter cache halves the
// blast radius of a leaked auth header in logs.
//
// Payload shape — data-only (content-available + mutable-content) so the
// iOS NSE wakes, reads ciphertext from `data.c` / `data.n`, decrypts via
// the sealed MLS snapshot, then mutates `bestAttemptContent` with the
// plaintext. No alert / sound / badge here — the NSE is the source of
// truth for the final user-visible notification.

import http2 from "node:http2";
import { SignJWT, importPKCS8, type KeyLike } from "jose";
import { Resource } from "sst";

const APNS_HOST = "https://api.push.apple.com";
const APNS_HOST_DEV = "https://api.sandbox.push.apple.com";
const JWT_CACHE_MS = 10 * 60 * 1000;

interface ApnsTarget {
  id: string;
  token: string;
  appBundleId: string;
}

interface ApnsEvent {
  chatId: string;
  serverMsgId: string;
  senderId: string;
  ciphertextB64: string;
  nonceB64: string;
  ts: number;
}

export interface ApnsResult {
  tokenId: string;
  ok: boolean;
  status: number;
  dead: boolean;
}

let cachedClient: { url: string; client: http2.ClientHttp2Session } | null =
  null;

function getClient(): http2.ClientHttp2Session {
  const url =
    Resource.ApnsEnvironment.value === "sandbox" ? APNS_HOST_DEV : APNS_HOST;
  if (cachedClient && !cachedClient.client.closed && cachedClient.url === url) {
    return cachedClient.client;
  }
  const client = http2.connect(url, {
    settings: { enablePush: false },
  });
  client.on("close", () => {
    if (cachedClient?.client === client) cachedClient = null;
  });
  client.on("error", () => {
    if (cachedClient?.client === client) cachedClient = null;
  });
  cachedClient = { url, client };
  return client;
}

let cachedKey: { kid: string; key: KeyLike } | null = null;
async function loadKey(): Promise<{ kid: string; key: KeyLike }> {
  if (cachedKey) return cachedKey;
  const pem = Resource.ApnsAuthKey.value;
  const kid = Resource.ApnsKeyId.value;
  const key = await importPKCS8(pem, "ES256");
  cachedKey = { kid, key };
  return cachedKey;
}

let cachedJwt: { token: string; exp: number } | null = null;
async function getJwt(): Promise<string> {
  if (cachedJwt && cachedJwt.exp > Date.now() + 30_000) return cachedJwt.token;
  const { kid, key } = await loadKey();
  const iat = Math.floor(Date.now() / 1000);
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid })
    .setIssuer(Resource.ApnsTeamId.value)
    .setIssuedAt(iat)
    .sign(key);
  cachedJwt = { token, exp: Date.now() + JWT_CACHE_MS };
  return token;
}

function buildPayload(ev: ApnsEvent): Buffer {
  // content-available=1 wakes the app for silent processing; mutable-content
  // triggers the NSE. `c`/`n` are short keys to keep the JSON under APNs'
  // 4KB payload limit for groups + long ciphertexts.
  const body = {
    aps: {
      "content-available": 1,
      "mutable-content": 1,
      // Empty alert so iOS shows something if the NSE crashes / times out
      // (30s budget). Real plaintext is set by the NSE in bestAttemptContent.
      alert: { title: "" },
    },
    chatId: ev.chatId,
    serverMsgId: ev.serverMsgId,
    senderId: ev.senderId,
    c: ev.ciphertextB64,
    n: ev.nonceB64,
    ts: ev.ts,
  };
  return Buffer.from(JSON.stringify(body));
}

async function sendOne(
  target: ApnsTarget,
  jwt: string,
  payload: Buffer,
  collapseId: string,
): Promise<ApnsResult> {
  const client = getClient();
  return new Promise<ApnsResult>((resolve) => {
    const req = client.request({
      ":method": "POST",
      ":path": `/3/device/${target.token}`,
      authorization: `bearer ${jwt}`,
      "apns-topic": target.appBundleId,
      "apns-push-type": "alert",
      "apns-priority": "10",
      "apns-collapse-id": collapseId.slice(0, 64),
      "content-type": "application/json",
      "content-length": String(payload.length),
    });
    let status = 0;
    req.on("response", (headers) => {
      status = Number(headers[":status"] ?? 0);
    });
    let body = "";
    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      // 410 Gone or 400 with reason BadDeviceToken → permanent.
      let dead = status === 410;
      if (status === 400 && body.includes("BadDeviceToken")) dead = true;
      resolve({ tokenId: target.id, ok: status === 200, status, dead });
    });
    req.on("error", () => {
      resolve({ tokenId: target.id, ok: false, status: 0, dead: false });
    });
    req.end(payload);
  });
}

export async function sendApns(
  targets: ApnsTarget[],
  ev: ApnsEvent,
): Promise<ApnsResult[]> {
  const jwt = await getJwt();
  const payload = buildPayload(ev);
  return Promise.all(
    targets.map((t) => sendOne(t, jwt, payload, ev.serverMsgId)),
  );
}
