import { secrets, databaseUrl } from './secrets';
import { mediaBucket, nftMetadataBucket } from './storage';

// ── VPC ──────────────────────────────────────────────────────────────────────
// Lambda runs inside a VPC.
// nat: "ec2" is cheaper than "managed" (NAT Gateway ~$32/mo vs EC2 t4g.nano ~$3/mo)
// Low budget: use ec2 nat for dev/staging, evaluate managed for production
const vpc = new sst.aws.Vpc('Vpc', {
  nat: $app.stage === 'production' ? 'managed' : 'ec2',
});

// ── tRPC API Lambda ──────────────────────────────────────────────────────────
// Handler: services/api/src/lambda.ts (already exists)
// Prisma client binary must be copied in for Lambda to use it
export const apiFunction = new sst.aws.Function('Api', {
  vpc,
  url: true,                    // Lambda function URL (no API Gateway cost)
  handler: 'services/api/src/lambda.handler',
  runtime: 'nodejs22.x',
  architecture: 'arm64',        // Graviton - 20% cheaper, faster cold starts
  memory: 512,
  timeout: '30 seconds',
  link: [
    ...secrets,
    mediaBucket,
    nftMetadataBucket,
  ],
  // Prisma generates platform-specific binaries - include the correct one
  copyFiles: [
    { from: 'packages/database/src/generated/libquery_engine-linux-arm64-openssl-3.0.x.so.node' },
  ],
  environment: {
    // Map SST Resource values to the env vars your app expects
    // These are resolved at runtime via Resource.<Name>.value
    NODE_ENV: $app.stage === 'production' ? 'production' : 'development',
  },
  nodejs: {
    // Bundle from monorepo root so workspace packages resolve correctly
    install: ['@prisma/client'],
  },
});

// ── Media Upload Lambda ───────────────────────────────────────────────────────
// Separate function for generating R2 presigned upload URLs.
// Keeps the main API Lambda lean. Client calls this, gets a URL, uploads directly.
export const uploadFunction = new sst.aws.Function('Upload', {
  vpc,
  url: true,
  handler: 'services/upload/src/lambda.handler',
  runtime: 'nodejs22.x',
  architecture: 'arm64',
  memory: 256,
  timeout: '10 seconds',
  link: [
    ...secrets,
    mediaBucket,
  ],
});

export const api = {
  url: apiFunction.url,
  uploadUrl: uploadFunction.url,
};
