/// <reference path="./.sst/platform/config.d.ts" />

// Multi-cloud infrastructure config
// Providers:
//   AWS         → Lambda (tRPC API), Rekognition (moderation), ECS (SUI indexer)
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
      name: 'myapp',
      // Retain resources on removal in production to prevent accidental data loss
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
      providers: {
        aws: {
          region: 'eu-west-1', // Change to your preferred region
        },
        cloudflare: {
          accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
        },
      },
    };
  },

  async run() {
    // Load stacks in dependency order
    const { secrets } = await import('./infra/stacks/secrets');
    const { storage } = await import('./infra/stacks/storage');
    const { api } = await import('./infra/stacks/api');
    await import('./infra/stacks/sui-indexer');
    await import('./infra/stacks/moderation');

    // Outputs - printed after deploy
    return {
      api: api.url,
      mediaBucket: storage.mediaBucket.name,
      cdnUrl: storage.cdnUrl,
    };
  },
});
