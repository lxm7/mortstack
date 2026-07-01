// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

// Multi-cloud infrastructure config
// Providers:
//   AWS         → Lambda (API, moderation, notifications), ECS (SUI indexer),
//                 SNS + SQS (event bus)
//   Cloudflare  → R2 (media storage, zero egress), CDN
//   Neon        → PostgreSQL (external, connected via secret)
//
// DO NOT RUN `sst deploy` without confirming environment setup.
// Use `sst dev` for local development.
// Use `sst diff` to preview changes before deploying.

export default $config({
  app(input) {
    return {
      name: "mortstack-chatapp",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          region: "eu-west-1",
        },
        cloudflare: true,
      },
    };
  },

  // The object returned at the bottom is what SST prints after every
  // `sst deploy` / `sst dev` and writes to `.sst/outputs.json`. SST v3 has no
  // `sst output <name>` subcommand — read the JSON or re-run deploy.
  // At runtime, linked code reads via `Resource.<Name>` from the sst SDK.
  async run() {
    // VPC deferred — nothing currently runs inside it. Reactivate when the
    // SUI indexer (ECS Fargate) ships. A provisioned VPC with NAT costs
    // ~$32/mo on managed mode, ~$3-5/mo on EC2 mode, even when idle.
    // await import("./infra/stacks/vpc");

    // Secrets (Neon, Cloudflare, Better Auth)
    await import("./infra/stacks/secrets");

    // chat push secrets (APNs + FCM credentials for the M6 push fanout Lambda). These
    await import("./infra/stacks/chat-push-secrets");

    // Storage (Cloudflare R2 buckets + CDN)
    const { storage } = await import("./infra/stacks/storage");

    // Event bus (SNS topics + SQS queues — fan-out pattern)
    await import("./infra/stacks/events");

    // API (Lambda — tRPC + Better Auth)
    const { api } = await import("./infra/stacks/api");

    // SUI blockchain indexer (ECS Fargate Spot — stub)
    //  await import("./infra/stacks/sui-indexer");

    // Content moderation (Rekognition — stub, subscribes via events.ts)
    // await import("./infra/stacks/moderation");

    // Chat WebSocket transport (Cloudflare Worker + Durable Objects)
    // M1 of the chat MVP. Per-user inbox DO + per-chat DO; await-then-ack
    // persistence with 100ms batching.
    const { chatWs } = await import("./infra/stacks/chat-ws");

    // Push notifications (stub, subscribes via events.ts)
    // await import("./infra/stacks/notifications");

    return {
      api: api.url,
      uploadUrl: api.uploadUrl,
      chatWs: chatWs.url,
      mediaBucket: storage.mediaBucket.name,
      cdnUrl: storage.cdnUrl,
    };
  },
});
