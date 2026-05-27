// Secrets shared between the Chat WebSocket Worker (Cloudflare) and the API
// Lambda (AWS). Kept in their own file to avoid a circular import between
// chat-ws.ts (which links the secret to the Worker) and api.ts (which links
// the same secret to the Lambda so it can validate the HMAC header on
// /internal/chat/* requests).
//
// Set after first deploy:
// pnpm sst secret set ChatWsHmacSecret "$(openssl rand -hex 32)"

export const chatWsHmacSecret = new sst.Secret("ChatWsHmacSecret");

// chat-ws Worker URL — value comes from the deploy. Defined here (not in
// chat-ws.ts) so api.ts can `link` it without inducing the api → chat-ws →
// api cycle (chat-ws.ts already imports apiFunction.url from api.ts).
//
// Set after first deploy of chat-ws:
//   1. Read the Worker URL: `cat .sst/outputs.json | jq -r .chatWs`
//   2. pnpm sst secret set ChatWsInternalUrl "<that-url>"
//
// Workers URLs change on account/zone rebinds but are stable across normal
// deploys; re-set only when the Worker is re-created.
export const chatWsInternalUrl = new sst.Secret("ChatWsInternalUrl");
