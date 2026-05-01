// import { vpc } from './vpc';
// import { secrets } from './secrets';

// ── SUI Indexer (ECS Fargate Spot) ───────────────────────────────────────────
// Long-running service that:
//   1. Subscribes to SUI blockchain events (NFT minted, listed, transferred)
//   2. Syncs on-chain identity credentials (IdentityCredential objects)
//   3. Publishes events to SNS "ChainEvent" topic → consumed by downstream queues
//
// Fargate Spot on arm64: ~$6/month. AWS may reclaim with 2min warning —
// acceptable for an indexer that can resume from last checkpoint.
//
// Publishing pattern:
//   indexer detects on-chain event → SNS publish to chainEventTopic
//   → fans out to NotificationQueue (push notifs) and any future consumers
//
// STUB: Service definition only. Container image not yet built.
// To activate:
//   1. Create services/sui-indexer/ with Dockerfile
//   2. Uncomment the Service below
//   3. Set SUI_NETWORK and SUI_PACKAGE_ID secrets
//   4. Link chainEventTopic from events.ts for publishing

// TODO: Uncomment cluster + service when services/sui-indexer is ready
//
// import { chainEventTopic } from './events';
//
// export const cluster = new sst.aws.Cluster('SuiCluster', { vpc });
//
// export const indexerService = new sst.aws.Service('SuiIndexer', {
//   cluster,
//   link: [...secrets, chainEventTopic],
//   architecture: 'arm64',
//   capacity: $app.stage === 'production'
//     ? { fargate: { weight: 1, base: 1 }, spot: { weight: 1 } }
//     : 'spot',
//   cpu: '0.25 vCPU',
//   memory: '0.5 GB',
//   image: {
//     context: 'services/sui-indexer',
//     dockerfile: 'Dockerfile',
//   },
//   environment: {
//     SUI_NETWORK: $app.stage === 'production' ? 'mainnet' : 'testnet',
//     SUI_RPC_URL: $app.stage === 'production'
//       ? 'https://fullnode.mainnet.sui.io'
//       : 'https://fullnode.testnet.sui.io',
//   },
//   scaling: {
//     min: 1,
//     max: 2,
//     cpuUtilization: 70,
//   },
// });
