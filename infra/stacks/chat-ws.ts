import { apiFunction } from "./api";
import {
  chatWsAwsAccessKeyId,
  chatWsAwsSecretAccessKey,
} from "./chat-push-credentials";
import { chatWsHmacSecret } from "./chat-secrets";
import { chatDeliveredTopic } from "./events";
import { databaseUrl } from "./secrets";

// ── Chat WebSocket Worker (Cloudflare DO) ────────────────────────────────────
// M2 — Worker → Neon HTTP direct (ADR-010). Lambda hop on persist removed.
//
// Topology (per E1 / Option A):
//   device ──WS──► UserInbox<userId> ──RPC──► Chat<chatId> ──RPC──► UserInbox<otherUser> ──WS──► device
//
//   - One WS per device. UserInbox holds device sockets, fan-routes per chat.
//   - Chat DO owns the per-chat fanout. Hibernates when idle.
//   - Persistence: Chat DO buffers sends for ~100ms, writes batch directly to
//     Neon via @repo/db-edge (@neondatabase/serverless), then acks sender +
//     broadcasts. server_serial is DO-assigned (ADR-012).
//   - API_INTERNAL_URL kept only for /internal/chat/verify-session callback.
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
  link: [chatWsHmacSecret, chatWsAwsAccessKeyId, chatWsAwsSecretAccessKey],
  environment: {
    // Worker needs the API URL for /internal/chat/verify-session only.
    // apiFunction.url is a Pulumi Output<string> — interpolated at deploy time.
    API_INTERNAL_URL: apiFunction.url.apply((u) => u ?? ""),
    // Neon HTTP connection string for direct persist (ADR-010). The neon()
    // factory in @repo/db-edge reads this and issues stateless HTTPS queries.
    DATABASE_URL: databaseUrl.value,
    // Push fanout (ADR-013) — Chat DO publishes chat.msg.delivered to this
    // topic after a successful Neon write. SigV4-signed via aws4fetch from
    // the Worker; chat-push Lambda (deferred to M6) consumes and dispatches.
    CHAT_DELIVERED_TOPIC_ARN: chatDeliveredTopic.arn,
    // IAM credentials for the Worker-side SigV4 publisher. Sourced from a
    // dedicated IAM user with sns:Publish scoped to this topic only.
    // Provisioned out-of-band; secrets are set via `sst secret set`.
    AWS_REGION: $app.providers?.aws?.region ?? "eu-west-1",
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
      // Tag-only bumps — each deploy that changes no DO classes still has to
      // advance the tag because Pulumi diffs the migrations object. Chat +
      // UserInbox already exist as SQLite-backed DO classes; do NOT re-declare
      // them in newSqliteClasses (CF error 10074: "already depended on by
      // existing Durable Objects"). On error 10079 ("got tag X expected Y"),
      // align oldTag with the current deployed tag and bump newTag.
      args.migrations = {
        oldTag: "v6",
        newTag: "v7",
        newSqliteClasses: [],
        renamedClasses: [],
        deletedClasses: [],
      };

      // Compatibility date with WebSocket auto-reply-to-close behaviour
      // (so we don't have to manually echo close frames).
      args.compatibilityDate = "2026-04-15";
      // nodejs_compat — SST's `Resource` import in services/chat-ws/src/auth.ts
      // pulls process/fs/crypto from Node built-ins. Required for both deploy
      // and local wrangler dev (mirrored in services/chat-ws/wrangler.jsonc).
      args.compatibilityFlags = ["nodejs_compat"];
    },
  },
});

export const chatWs = {
  url: chatWsWorker.url,
};
