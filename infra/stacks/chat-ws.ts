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
      // tagged migrations.
      //
      // CREATE-SHAPE (current): the orphaned CF script (tag v7) is being
      // deleted out-of-band + `sst refresh` so Pulumi tracks this as a fresh
      // create. On a create the provider omits `old_tag`, so we must NOT send
      // one (CF error 10079: "got tag 'v7' when expected no tags" was Pulumi
      // create-path uploading with no old_tag against a still-existing v7
      // script). On a clean create the DO classes MUST be declared in
      // newSqliteClasses — they don't exist yet, so no 10074 ("already
      // depended on by existing Durable Objects").
      //
      // UPDATE-SHAPE (later DO changes — rename/delete/transition): once the
      // script exists, switch to oldTag = current deployed tag, newTag = next,
      // drop classes from newSqliteClasses, and use renamedClasses /
      // deletedClasses as needed. Do NOT re-declare existing classes in
      // newSqliteClasses on an update (triggers 10074).
      // UPDATE-SHAPE: the script already exists at migration tag v1 with the
      // Chat + UserInbox SQLite DO classes created. This deploy changes only
      // Worker code (no DO class add/rename/delete), so bump the tag with an
      // empty migration and send oldTag so CF's precondition matches the
      // deployed v1 (error 10079 "got tag '' when expected v1" = oldTag was
      // omitted by the create-shape). Do NOT re-declare existing classes in
      // newSqliteClasses (triggers 10074).
      args.migrations = {
        oldTag: "v1",
        newTag: "v2",
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
