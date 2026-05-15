// Chat persistence — Worker → Neon HTTP direct (ADR-010).
//
// Replaces the M1 path (Chat DO → Lambda /internal/chat/persist → Neon). The
// Lambda hop is gone; Chat DO writes to Neon over HTTPS via @repo/db-edge.
//
// Module owns the cached ChatPersistClient instance — the neon() factory is
// cheap but caching saves a function-call per flush, and lets future cross-DO
// instrumentation (metrics, slow-query logging) live in one place.

import { ChatPersistClient } from "@repo/db-edge";

let cached: { url: string; client: ChatPersistClient } | null = null;

export function getPersistClient(env: Env): ChatPersistClient {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set on chat-ws Worker env");
  }
  if (cached && cached.url === env.DATABASE_URL) return cached.client;
  cached = {
    url: env.DATABASE_URL,
    client: new ChatPersistClient(env.DATABASE_URL),
  };
  return cached.client;
}

export type { PersistMessageInput, PersistedMessageRow } from "@repo/db-edge";
