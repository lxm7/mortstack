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
    // Note: AWS creds for SigV4 publish come via `Resource.X.value` from
    // the SST `sst` import (linked CF Worker secrets pattern). They are NOT
    // exposed as env bindings; do not add them here.
  }
}

export {};
