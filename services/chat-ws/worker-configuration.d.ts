/// <reference types="@cloudflare/workers-types" />

import type { Chat } from "./src/durable/chat";
import type { UserInbox } from "./src/durable/user-inbox";

declare global {
  interface Env {
    CHAT: DurableObjectNamespace<Chat>;
    USER_INBOX: DurableObjectNamespace<UserInbox>;
    // SST-managed secret (HMAC shared with services/api).
    CHAT_WS_HMAC_SECRET: string;
    // Lambda Function URL for /internal/chat/* endpoints.
    API_INTERNAL_URL: string;
  }
}

export {};
