// Secrets shared between the Chat WebSocket Worker (Cloudflare) and the API
// Lambda (AWS). Kept in their own file to avoid a circular import between
// chat-ws.ts (which links the secret to the Worker) and api.ts (which links
// the same secret to the Lambda so it can validate the HMAC header on
// /internal/chat/* requests).
//
// Set after first deploy:
// pnpm sst secret set ChatWsHmacSecret "$(openssl rand -hex 32)"

export const chatWsHmacSecret = new sst.Secret("ChatWsHmacSecret");
