import { secrets } from './secrets';

// ── SUI Indexer (ECS Fargate) ─────────────────────────────────────────────────
// Long-running service that:
//   1. Subscribes to SUI blockchain events (NFT minted, listed, transferred)
//   2. Syncs on-chain identity credentials (IdentityCredential objects)
//   3. Publishes events to Upstash Kafka → consumed by API
//
// Why ECS not Lambda:
//   - SUI event subscription requires a persistent WebSocket connection
//   - Lambda max timeout is 15 min; indexers need to run indefinitely
//
// STUB: Service definition only. Container image not yet built.
// To activate:
//   1. Create services/sui-indexer/ with Dockerfile
//   2. Uncomment the cluster.addService() call below
//   3. Set SUI_NETWORK and SUI_PACKAGE_ID secrets

// ── ECS Cluster ──────────────────────────────────────────────────────────────
// Shared cluster - add more services here as the SUI layer grows
// (e.g. stake monitor, NFT price oracle)
const vpc = new sst.aws.Vpc('IndexerVpc', {
  nat: 'ec2',
});

export const cluster = new sst.aws.Cluster('SuiCluster', { vpc });

// TODO: Uncomment when services/sui-indexer is ready
//
// cluster.addService('SuiIndexer', {
//   link: [
//     ...secrets,
//   ],
//   image: {
//     context: 'services/sui-indexer',
//     dockerfile: 'Dockerfile',
//   },
//   environment: {
//     SUI_NETWORK: $app.stage === 'production' ? 'mainnet' : 'testnet',
//     SUI_RPC_URL: $app.stage === 'production'
//       ? 'https://fullnode.mainnet.sui.io'
//       : 'https://fullnode.testnet.sui.io',
//     // SUI_PACKAGE_ID: set once contracts are deployed
//   },
//   scaling: {
//     min: 1,
//     max: 2, // Scale up during high chain activity
//     cpuUtilization: 70,
//   },
// });
