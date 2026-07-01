import { getChatDb } from "@repo/chat-db";

// chatId → mls_group_id lookup, cached in-memory for the WS hot path.
// chats.mls_group_id is rewritten only when a chat's group is destroyed and
// recreated (split / leave+rejoin per ADR-015 §7) — so cache invalidation is
// rare and explicit via clearChatGroupCache(chatId).

const cache = new Map<string, Uint8Array | null>();

function toBytes(v: unknown): Uint8Array | null {
  if (v === null || v === undefined) return null;
  if (v instanceof Uint8Array) return v;
  if (v instanceof ArrayBuffer) return new Uint8Array(v);
  if (
    typeof v === "object" &&
    v !== null &&
    "buffer" in v &&
    (v as { buffer: unknown }).buffer instanceof ArrayBuffer
  ) {
    return new Uint8Array((v as { buffer: ArrayBuffer }).buffer);
  }
  return null;
}

// Returns the MLS GroupId bytes for a chat, or null when no v=2 group has
// been registered (legacy v=1 chat). Cached after the first hit; cache is
// process-local so cold launch refills from chat-db automatically.
export async function resolveChatGroupId(
  chatId: string,
): Promise<Uint8Array | null> {
  if (cache.has(chatId)) return cache.get(chatId) ?? null;

  const { db } = await getChatDb();
  const result = await db.execute(
    "SELECT mls_group_id FROM chats WHERE id = ?",
    [chatId],
  );
  const row = (result.rows?.[0] ?? null) as {
    mls_group_id: unknown;
  } | null;
  const bytes = row ? toBytes(row.mls_group_id) : null;
  cache.set(chatId, bytes);
  console.log("[resolve] chatId", chatId, "linked?", !!bytes);
  return bytes;
}

// Caller invokes this after switching a chat to v=2 (creating its MLS group),
// or after a leave+rejoin that produces a fresh GroupId. Forces the next
// resolveChatGroupId to re-read from chat-db.
export function clearChatGroupCache(chatId?: string): void {
  if (chatId) cache.delete(chatId);
  else cache.clear();
}
