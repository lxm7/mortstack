// Verify a Better Auth bearer token on WS connect.
//
// Cache-aside edge cache (ADR-0017): check Cloudflare KV first; on a miss verify
// via the API Lambda (Neon-authoritative) and populate KV with a short TTL.
// Neon stays the source of truth — this only takes the DB round-trip off the
// hot path for cache hits. Revocation is bounded by the TTL (backstop) plus the
// write-through purge (/internal/session/purge, added in B1.5).
//
// Invariants:
//   - Key is sha256(token) hex, never the raw bearer (a KV dump ≠ credentials).
//   - Value is minimal: { userId, exp }. exp guards against serving a session
//     that expired inside the TTL window.
//   - Negatives are NEVER cached (a failed verify must not poison KV).
//   - KV is best-effort: any KV error falls back to origin verification.
//   - SESSION_CACHE_ENABLED="0"/"false" is a kill-switch → origin-only, no KV.
//
// HMAC secret comes from `Resource.ChatWsHmacSecret.value` — SST `link`s on
// Cloudflare Workers expose secrets via the Resource module, not env bindings.

import { Resource } from "sst";

export interface VerifySessionResult {
  userId: string;
}

// Cached value (ADR-0017 §2). exp = session expiry, unix seconds.
interface CachedSession {
  userId: string;
  exp: number;
}

// Origin returns exp too so the cache can store it. exp is null when the origin
// did not send one (e.g. an older Lambda mid-rollout) — auth still succeeds, we
// just skip the cache write, so Worker/Lambda deploy in any order.
interface OriginSession {
  userId: string;
  exp: number | null;
}

const TTL_MIN = 60; // KV expirationTtl floor + ADR-0017 §3 lower bound
const TTL_MAX = 300; // ADR-0017 §3 upper bound
const TTL_DEFAULT = 120;

function cacheEnabled(env: Env): boolean {
  const v = env.SESSION_CACHE_ENABLED?.toLowerCase();
  return v !== "0" && v !== "false";
}

function cacheTtl(env: Env): number {
  const n = Number(env.SESSION_CACHE_TTL);
  if (!Number.isFinite(n)) return TTL_DEFAULT;
  return Math.min(TTL_MAX, Math.max(TTL_MIN, Math.trunc(n)));
}

// Load-test instrumentation (B1.7). Off unless SESSION_CACHE_METRICS === "1".
// One compact line per verify, prefixed "SCM" so `wrangler tail | grep SCM` can
// tally hit rate and KV write rate during a run. r = hit | miss | disabled |
// fail; w = whether a KV write happened. Left in, off by default — flip the env
// to "1" for a run, back to "0" after (avoids per-connect log volume in prod).
function metric(env: Env, r: string, wrote = false): void {
  if (env.SESSION_CACHE_METRICS === "1") {
    console.log(`SCM ${JSON.stringify({ r, w: wrote })}`);
  }
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  let hex = "";
  for (const b of new Uint8Array(digest))
    hex += b.toString(16).padStart(2, "0");
  return hex;
}

// Origin verification — the existing Lambda round-trip. Neon authoritative.
async function verifyOrigin(
  env: Env,
  bearerToken: string,
): Promise<OriginSession | null> {
  const url = `${env.API_INTERNAL_URL.replace(/\/$/, "")}/internal/chat/verify-session`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-chat-ws-secret": Resource.ChatWsHmacSecret.value,
    },
    body: JSON.stringify({ token: bearerToken }),
  });

  if (resp.status !== 200) return null;

  const body = (await resp.json()) as { userId?: string; exp?: number };
  if (!body.userId || typeof body.userId !== "string") return null;
  // exp only bounds cache staleness — it must NOT gate auth. A missing/invalid
  // exp (older origin during a rollout) yields null; auth still passes.
  const exp =
    typeof body.exp === "number" && Number.isFinite(body.exp) ? body.exp : null;
  return { userId: body.userId, exp };
}

export async function verifySession(
  env: Env,
  bearerToken: string,
): Promise<VerifySessionResult | null> {
  // Kill-switch: skip the cache entirely, verify at origin.
  if (!cacheEnabled(env)) {
    const origin = await verifyOrigin(env, bearerToken);
    metric(env, "disabled");
    return origin ? { userId: origin.userId } : null;
  }

  const key = await sha256Hex(bearerToken);
  const nowSec = Math.floor(Date.now() / 1000);

  // Read-through. exp guard prevents serving a session that expired within the
  // TTL window. KV failures are non-fatal — fall through to origin.
  try {
    const hit = await env.SESSION_CACHE.get<CachedSession>(key, "json");
    if (hit && typeof hit.userId === "string" && hit.exp > nowSec) {
      metric(env, "hit");
      return { userId: hit.userId };
    }
  } catch {
    // ignore — treat as a miss
  }

  // Miss → origin. Negatives are NOT cached (ADR-0017 §1).
  const origin = await verifyOrigin(env, bearerToken);
  if (!origin) {
    metric(env, "fail");
    return null;
  }

  // Populate on success, but only with a real expiry to bound staleness.
  // Without exp (older origin mid-rollout) we skip the write and degrade to
  // no-cache rather than caching an unbounded entry. Best-effort — a write
  // failure just means the next connect re-verifies at origin.
  let wrote = false;
  if (origin.exp !== null) {
    try {
      await env.SESSION_CACHE.put(
        key,
        JSON.stringify({
          userId: origin.userId,
          exp: origin.exp,
        } satisfies CachedSession),
        { expirationTtl: cacheTtl(env) },
      );
      wrote = true;
    } catch {
      // non-fatal
    }
  }

  metric(env, "miss", wrote);
  return { userId: origin.userId };
}
