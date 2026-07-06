import type { ServerToClient } from "@repo/chat-transport";
import type { BackfilledMessageRow } from "@repo/db-edge";

// Backfill page size (docs/message-backfill.md, ADR-0020). Server fetches
// PAGE_SIZE+1 to detect whether another page exists; drop to 50–100 if
// ciphertexts grow large.
export const BACKFILL_PAGE_SIZE = 200;

type BfdFrame = Extract<ServerToClient, { t: "bfd" }>;

// The two side-effecting seams `resolveBackfillPage` needs, injected so the
// per-chat logic is unit-testable without a Durable Object or a Neon round-trip
// (mirrors the db-edge testing approach — fake the seam, Maestro covers e2e).
export interface BackfillDeps {
  // env.CHAT_MAX_CACHE.get(key). Null when the KV namespace is unbound (local
  // dev / a deploy before the binding lands) → treated as "no skip available".
  kvGet: ((key: string) => Promise<string | null>) | null;
  // Membership-gated Neon read (packages/db-edge messagesSince). The EXISTS
  // ChatMember gate inside the query is the authorization boundary, so a
  // non-member simply yields zero rows here.
  messagesSince: (
    chatId: string,
    userId: string,
    after: bigint,
    limit: number,
  ) => Promise<BackfilledMessageRow[]>;
}

export interface BackfillPageResult {
  frame: BfdFrame;
  // Whether the KV skip-cache short-circuited the Neon read (for metrics).
  skipped: boolean;
  // Rows served on this page (for metrics).
  rows: number;
}

// Resolve a single chat's backfill request into a `bfd` frame. Pure of socket
// and env I/O — the DO wraps this and fans the sends. Ordering / cursor rules
// are ADR-0020 §3–§6.
export async function resolveBackfillPage(
  deps: BackfillDeps,
  userId: string,
  c: { chatId: string; after: string; force?: boolean },
): Promise<BackfillPageResult> {
  const after = BigInt(c.after);

  // KV skip (§3): the client's cursor already covers the chat's max serial → no
  // Neon, no rows. Safe by the core invariant — a stale-low/missing KV entry
  // only delays catch-up (the next send rewrites chatmax and the full-range
  // query returns the gap). A fresh login sets force:true to bypass it. On any
  // KV read error we fall through to Neon: never skip on uncertainty.
  let skipped = false;
  if (!c.force && deps.kvGet) {
    try {
      const kvMax = await deps.kvGet(`chatmax:${c.chatId}`);
      if (kvMax !== null && BigInt(kvMax) <= after) skipped = true;
    } catch {
      // fall through to Neon
    }
  }
  if (skipped) {
    return {
      frame: {
        t: "bfd",
        chatId: c.chatId,
        messages: [],
        upTo: c.after,
        more: false,
      },
      skipped: true,
      rows: 0,
    };
  }

  // Membership-gated read (§2). Fetch PAGE+1 to detect a further page.
  const rows = await deps.messagesSince(
    c.chatId,
    userId,
    after,
    BACKFILL_PAGE_SIZE + 1,
  );
  const more = rows.length > BACKFILL_PAGE_SIZE;
  const served = more ? rows.slice(0, BACKFILL_PAGE_SIZE) : rows;
  // upTo advances the cursor even on an empty page (§5) → no refetch-loop wedge.
  const upTo =
    served.length > 0
      ? served[served.length - 1]!.serverSerial.toString()
      : c.after;

  return {
    frame: {
      t: "bfd",
      chatId: c.chatId,
      messages: served.map((r) => ({
        serverMsgId: r.serverSerial.toString(),
        senderId: r.senderId,
        ciphertext: r.ciphertext,
        nonce: r.nonce,
        ts: r.createdAt.getTime(),
      })),
      upTo,
      more,
    },
    skipped: false,
    rows: served.length,
  };
}
