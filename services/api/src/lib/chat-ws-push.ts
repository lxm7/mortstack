// API → chat-ws Worker push helpers. Best-effort by design — the 30s
// background poll on the client is the correctness fallback. Push exists
// only to skip that poll delay for time-sensitive flows (instant new-chat,
// instant member-add).
//
// Auth reuses the existing ChatWsHmacSecret (same secret the Worker uses
// to call back into /internal/chat/verify-session). Single trusted caller
// in either direction; no need for separate secrets per direction.

import { Resource } from "sst";

declare module "sst" {
  interface Resource {
    ChatWsHmacSecret: {
      type: "sst.sst.Secret";
      value: string;
    };
    ChatWsInternalUrl: {
      type: "sst.sst.Secret";
      value: string;
    };
  }
}

const SECRET_HEADER = "x-chat-ws-secret";

// chat-ws Worker URL — sourced from the ChatWsInternalUrl SST secret. The
// operator sets this once after the first chat-ws deploy via:
//   pnpm sst secret set ChatWsInternalUrl "<worker-url>"
// Until that's done the secret resolves to an empty string and push becomes
// a no-op — the 30s client poll remains the correctness fallback.
function chatWsUrl(): string | null {
  const v = Resource.ChatWsInternalUrl.value;
  if (!v) return null;
  return v.replace(/\/$/, "");
}

interface NotifyResult {
  /** true iff the POST returned 200. false on any failure (network,
   *  4xx/5xx, missing URL). Caller MUST NOT block on this — push is
   *  always best-effort. */
  ok: boolean;
}

/**
 * Wake up the given users so their clients immediately poll Welcomes.
 * Called from `mls.groups.publishWelcomes` after the DB insert succeeds.
 *
 * `authUserIds` must already be resolved by the caller — the Worker keys
 * UserInbox DOs by Better Auth user id, not accountId.
 */
export async function notifyMlsWelcome(
  authUserIds: string[],
): Promise<NotifyResult> {
  const url = chatWsUrl();
  if (!url || authUserIds.length === 0) return { ok: false };

  const unique = Array.from(new Set(authUserIds));
  try {
    const resp = await fetch(`${url}/internal/notify`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        [SECRET_HEADER]: Resource.ChatWsHmacSecret.value,
      },
      body: JSON.stringify({
        userIds: unique,
        frame: { kind: "mls-welcome" },
      }),
    });
    return { ok: resp.status === 200 };
  } catch {
    return { ok: false };
  }
}

/**
 * Evict a session from the edge cache (ADR-0017 §3, write-through invalidation).
 * `tokenHash` is the hex sha256(token) — the same key the Worker writes — so the
 * raw token never leaves this service.
 *
 * Best-effort by design: the session row is already deleted (authoritative) and
 * the KV TTL backstops a missed purge, so callers MUST NOT block on the result
 * or fail sign-out / revoke if this returns `{ ok: false }`.
 */
export async function purgeSessionCache(
  tokenHash: string,
): Promise<{ ok: boolean }> {
  const url = chatWsUrl();
  if (!url || !tokenHash) return { ok: false };

  try {
    const resp = await fetch(`${url}/internal/session/purge`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        [SECRET_HEADER]: Resource.ChatWsHmacSecret.value,
      },
      body: JSON.stringify({ tokenHash }),
    });
    return { ok: resp.status === 200 };
  } catch {
    return { ok: false };
  }
}
