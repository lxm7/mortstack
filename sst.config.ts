/// <reference path="./.sst/platform/config.d.ts" />

// Multi-cloud infrastructure config
// Providers:
//   AWS         → Lambda (API, moderation, notifications), ECS (SUI indexer),
//                 API Gateway WebSocket (real-time)
//   Cloudflare  → R2 (media storage, zero egress), CDN
//   Neon        → PostgreSQL (external, connected via secret)
//   Upstash     → Redis + Kafka (external, connected via secret)
//
// DO NOT RUN `sst deploy` without confirming environment setup.
// Use `sst dev` for local development.
// Use `sst diff` to preview changes before deploying.

export default $config({
  app(input) {
    return {
      name: 'sessions',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
      providers: {
        aws: {
          region: 'eu-west-1',
        },
        cloudflare: {
          accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
        },
      },
    };
  },

  async run() {
    // Shared VPC — all AWS compute uses this
    await import('./infra/stacks/vpc');

    // Secrets (Neon, Upstash, Cloudflare, Better Auth)
    const { secrets } = await import('./infra/stacks/secrets');

    // Storage (Cloudflare R2 buckets + CDN)
    const { storage } = await import('./infra/stacks/storage');

    // API (Lambda — tRPC + Better Auth)
    const { api } = await import('./infra/stacks/api');

    // SUI blockchain indexer (ECS Fargate Spot — stub)
    await import('./infra/stacks/sui-indexer');

    // Content moderation (Lambda + Rekognition — stub)
    await import('./infra/stacks/moderation');

    // Real-time WebSocket (API Gateway v2 — stub)
    await import('./infra/stacks/realtime');

    // Push notifications (Lambda + Expo Push — stub)
    await import('./infra/stacks/notifications');

    return {
      api: api.url,
      uploadUrl: api.uploadUrl,
      mediaBucket: storage.mediaBucket.name,
      cdnUrl: storage.cdnUrl,
    };
  },
});
