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
    // SST-linked secrets surface as SCREAMING_SNAKE_CASE env vars on the
    // Worker binding (same pattern as CHAT_WS_HMAC_SECRET above).
    CHAT_WS_AWS_ACCESS_KEY_ID: string;
    CHAT_WS_AWS_SECRET_ACCESS_KEY: string;
  }
}

export {};
