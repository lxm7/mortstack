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

// ── Edge session cache (ADR-0017) ────────────────────────────────────────────
// Cache-aside KV in front of WS-connect session verification. Neon stays
// authoritative; KV is a short-TTL read-through cache keyed by sha256(token),
// value { userId, exp }. Bound raw as `env.SESSION_CACHE` (a namespace binding,
// like the DO namespaces — NOT a linked secret, so it is wired via
// transform.worker.bindings below rather than `link`). The cache-aside read
// path (B1.2+) and the HMAC-gated /internal/session/purge worker (B1.5) are
// separate steps; B1.1 provisions the namespace + binding only.
export const sessionCache = new sst.cloudflare.Kv("SessionCache");

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
    // Edge session cache (ADR-0017 §3). TTL bounds worst-case revocation lag;
    // 120s is the tuned starting point (60–300s viable). String because Worker
    // env vars are strings — the cache layer (B1.2) parses to seconds. Kept
    // env-tunable so it can be adjusted under B1.7 load testing without a code
    // change.
    SESSION_CACHE_TTL: "120",
    // Kill-switch (ADR-0017 consequences). "0"/"false" → the Worker falls back
    // to origin-only verification (existing Lambda path) with no redeploy.
    SESSION_CACHE_ENABLED: "1",
    // Load-test metrics (B1.7). "1" → per-verify "SCM" log for `wrangler tail`
    // to tally cache hit rate + KV write rate. Keep "0" in prod; flip to "1"
    // (+ redeploy) only for a load-test run, then flip back.
    SESSION_CACHE_METRICS: "0",
  },
  transform: {
    worker: (args) => {
      // Bind the Chat + UserInbox Durable Object namespaces.
      // SQLite-backed DOs are the recommended path on the Workers Paid plan
      // (cheaper, supports point-in-time recovery, modern API).
      // Object form of $resolve so each value keeps its own type — the array
      // form unifies mixed Output types into a union and widens namespace_id.
      args.bindings = $resolve({
        bindings: args.bindings,
        sessionCacheId: sessionCache.id,
      }).apply(({ bindings, sessionCacheId }) => [
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
        {
          // Edge session cache (ADR-0017). Raw KV namespace binding →
          // env.SESSION_CACHE. Not a DO class, so it does NOT touch the
          // migration shape below — but adding any binding is still a Worker
          // update, which requires the tag bump (see migrations note).
          type: "kv_namespace",
          name: "SESSION_CACHE",
          // MUST be camelCase `namespaceId` — the Pulumi provider's
          // WorkersScriptBinding uses camelCase (like `className` above).
          // snake_case `namespace_id` is silently dropped → CF 10021 "must have
          // a namespace_id". tsc does NOT catch it (excess-property check is
          // bypassed through Output.apply). Do not "fix" this back to snake_case.
          namespaceId: sessionCacheId,
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
      // UPDATE-SHAPE (B1.1, ADR-0017): this deploy adds the SESSION_CACHE KV
      // binding. That is a Worker-binding change with NO DO class add/rename/
      // delete, so it is an empty migration that only bumps the tag. Send
      // oldTag = the currently deployed tag so CF's precondition matches
      // (error 10079 "got tag X when expected Y" = oldTag ≠ deployed). Do NOT
      // re-declare Chat/UserInbox in newSqliteClasses (triggers 10074).
      //
      // ⚠ PRECONDITION — deployed tag. This assumes the prior code-only v1→v2
      // deploy (commit 265a35c) actually shipped, i.e. deployed tag == v2.
      // VERIFY with `sst diff` before apply. If the v1→v2 deploy never ran
      // (e.g. alice/bob was tested on local `wrangler dev`), the deployed tag
      // is still v1 — in that case set { oldTag: "v1", newTag: "v2" } here and
      // let the KV binding ride that deploy, rather than jumping to v3.
      args.migrations = {
        oldTag: "v2",
        newTag: "v3",
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
