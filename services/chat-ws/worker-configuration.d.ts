/// <reference types="@cloudflare/workers-types" />

import type { Chat } from "./src/durable/chat";
import type { UserInbox } from "./src/durable/user-inbox";

declare global {
  interface Env {
    CHAT: DurableObjectNamespace<Chat>;
    USER_INBOX: DurableObjectNamespace<UserInbox>;
    // SST-managed secret (HMAC shared with services/api) — used only by
    // /internal/chat/verify-session on the API Lambda. Persist hot path no
    // longer crosses Lambda (ADR-010).
    CHAT_WS_HMAC_SECRET: string;
    // Lambda Function URL for /internal/chat/verify-session only.
    API_INTERNAL_URL: string;
    // Neon HTTP connection string. Chat DO writes directly via @repo/db-edge
    // (ADR-010). Injected by SST + .dev.vars locally.
    DATABASE_URL: string;
    // SNS push fanout (ADR-013). The Worker SigV4-signs publish requests to
    // the chat-delivered topic; the chat-push Lambda (M6) dispatches APNs/FCM.
    CHAT_DELIVERED_TOPIC_ARN: string;
    AWS_REGION: string;
    // Edge session cache (ADR-0017). Cache-aside store for WS-connect session
    // verification, keyed by sha256(token). Raw namespace binding, not a
    // linked secret. Read/write logic lands in B1.2+.
    SESSION_CACHE: KVNamespace;
    // TTL in seconds (string; parsed by the cache layer). Default 120.
    SESSION_CACHE_TTL: string;
    // Kill-switch: "0"/"false" → origin-only verification, no cache.
    SESSION_CACHE_ENABLED: string;
    // Load-test metrics (B1.7): "1" → emit one "SCM {...}" log per verify for
    // wrangler-tail tally. Off ("0") in prod to avoid per-connect log volume.
    SESSION_CACHE_METRICS: string;
    // Note: AWS creds for SigV4 publish come via `Resource.X.value` from
    // the SST `sst` import (linked CF Worker secrets pattern). They are NOT
    // exposed as env bindings; do not add them here.
  }
}

export {};
