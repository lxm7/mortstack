// Default entry — re-exports envelope + codec only. Safe to import from
// Cloudflare Workers (no DOM types, no WebSocket-the-class references).
//
// React Native / browser consumers that need the full WS client should
// import from `@repo/chat-transport/client` instead.

export * from "./envelope";
export * from "./codec";
