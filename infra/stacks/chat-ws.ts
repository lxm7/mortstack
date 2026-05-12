import { apiFunction } from "./api";
import { chatWsHmacSecret } from "./chat-secrets";

// ── Chat WebSocket Worker (Cloudflare DO) ────────────────────────────────────
// M1 — End-to-end transport for the chat MVP.
//
// Topology (per E1 / Option A):
//   device ──WS──► UserInbox<userId> ──RPC──► Chat<chatId> ──RPC──► UserInbox<otherUser> ──WS──► device
//
//   - One WS per device. UserInbox holds device sockets, fan-routes per chat.
//   - Chat DO owns the per-chat fanout. Hibernates when idle.
//   - Persistence is await-then-ack (per F1 / Option Y) with 100ms DO batching:
//       Chat DO buffers sends for ~100ms, POSTs HMAC-signed batch to Lambda
//       /internal/chat/persist, awaits success, then acks sender + broadcasts.
//
// Cost shape:
//   - Hibernation API → idle DOs cost $0.
//   - Workers Paid plan baseline ~$5/mo.
//   - Linear scaling with actual msg volume; benchmark vs Fargate at >100k DAU.
//
// ⚠ DO bindings + migrations are configured via transform.worker. The Pulumi
// shape may shift between SST versions — verify `sst diff` before first deploy
// and tweak the transform if Cloudflare provider rejects the binding format.

export const chatWsWorker = new sst.cloudflare.Worker("ChatWs", {
  handler: "services/chat-ws/src/index.ts",
  url: true,
  link: [chatWsHmacSecret],
  environment: {
    // Worker needs to know where to POST persist + verify requests.
    // apiFunction.url is a Pulumi Output<string> — interpolated at deploy time.
    API_INTERNAL_URL: apiFunction.url.apply((u) => u ?? ""),
  },
  transform: {
    worker: (args) => {
      // Bind the Chat + UserInbox Durable Object namespaces.
      // SQLite-backed DOs are the recommended path on the Workers Paid plan
      // (cheaper, supports point-in-time recovery, modern API).
      args.bindings = $resolve([args.bindings]).apply(([bindings]) => [
        ...(bindings ?? []),
        {
          type: "durable_object_namespace",
          name: "CHAT",
          className: "Chat",
        },
        {
          type: "durable_object_namespace",
          name: "USER_INBOX",
          className: "UserInbox",
        },
      ]);

      // Migration shape — Pulumi cloudflare provider takes a single object
      // (the latest desired migration), not the wrangler-style array of
      // tagged migrations. Use `newTag` to mark the version, and `oldTag`
      // when a future migration needs to advance from a prior tag.
      //
      // Subsequent class changes (rename, delete, transition non-SQLite →
      // SQLite) require setting oldTag = current tag, newTag = next tag,
      // and the appropriate fields (renamedClasses, deletedClasses, etc.).
      args.migrations = {
        newTag: "v1",
        newSqliteClasses: ["Chat", "UserInbox"],
      };

      // Compatibility date with WebSocket auto-reply-to-close behaviour
      // (so we don't have to manually echo close frames).
      args.compatibilityDate = "2026-04-15";
    },
  },
});

export const chatWs = {
  url: chatWsWorker.url,
};
