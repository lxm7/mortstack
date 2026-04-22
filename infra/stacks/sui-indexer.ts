import { vpc } from './vpc';
import { secrets } from './secrets';

// ── SUI Indexer (ECS Fargate Spot) ───────────────────────────────────────────
// Long-running service that:
//   1. Subscribes to SUI blockchain events (NFT minted, listed, transferred)
//   2. Syncs on-chain identity credentials (IdentityCredential objects)
//   3. Publishes events to Upstash Kafka → consumed by API
//
// Fargate Spot on arm64: ~$6/month. AWS may reclaim with 2min warning —
// acceptable for an indexer that can resume from last checkpoint.
//
// STUB: Service definition only. Container image not yet built.
// To activate:
//   1. Create services/sui-indexer/ with Dockerfile
//   2. Uncomment the Service below
//   3. Set SUI_NETWORK and SUI_PACKAGE_ID secrets

// TODO: Uncomment cluster + service when services/sui-indexer is ready
//
// export const cluster = new sst.aws.Cluster('SuiCluster', { vpc });
//
// export const indexerService = new sst.aws.Service('SuiIndexer', {
//   cluster,
//   link: [...secrets],
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
