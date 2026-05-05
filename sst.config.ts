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
      name: "sessions",
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

  async run() {
    // VPC deferred — nothing currently runs inside it. Reactivate when the
    // SUI indexer (ECS Fargate) ships. A provisioned VPC with NAT costs
    // ~$32/mo on managed mode, ~$3-5/mo on EC2 mode, even when idle.
    // await import("./infra/stacks/vpc");

    // Secrets (Neon, Cloudflare, Better Auth)
    await import("./infra/stacks/secrets");

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

    // Real-time (deferred — using push notifications + polling)
    // await import("./infra/stacks/realtime");

    // Push notifications (stub, subscribes via events.ts)
    // await import("./infra/stacks/notifications");

    return {
      api: api.url,
      uploadUrl: api.uploadUrl,
      mediaBucket: storage.mediaBucket.name,
      cdnUrl: storage.cdnUrl,
    };
  },
});
