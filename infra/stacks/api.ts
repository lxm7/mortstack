import { vpc } from './vpc';
import { secrets, databaseUrl } from './secrets';
import { mediaBucket, nftMetadataBucket } from './storage';

// ── tRPC + Better Auth API Lambda ────────────────────────────────────────────
// Handler: services/api/src/lambda.ts
// Routes: /auth/* → Better Auth, everything else → tRPC
export const apiFunction = new sst.aws.Function('Api', {
  vpc,
  url: true,
  handler: 'services/api/src/lambda.handler',
  runtime: 'nodejs22.x',
  architecture: 'arm64',
  memory: 512,
  timeout: '30 seconds',
  link: [
    ...secrets,
    mediaBucket,
    nftMetadataBucket,
  ],
  copyFiles: [
    { from: 'packages/database/src/generated/libquery_engine-linux-arm64-openssl-3.0.x.so.node' },
  ],
  environment: {
    NODE_ENV: $app.stage === 'production' ? 'production' : 'development',
  },
  nodejs: {
    install: ['@prisma/client'],
  },
});

// ── Media Upload Lambda ──────────────────────────────────────────────────────
// Generates R2 presigned upload URLs. Client uploads directly to R2.
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
