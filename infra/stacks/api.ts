import { secrets } from "./secrets";
import { mediaBucket, nftMetadataBucket } from "./storage";

// ── tRPC + Better Auth API Lambda ────────────────────────────────────────────
// Handler: services/api/src/lambda.ts
// Routes: /auth/* → Better Auth, everything else → tRPC
//
// No VPC: Neon HTTP driver adapter reaches Postgres over public internet via
// fetch. Removing VPC kills NAT gateway cost and 1-3s cold-start penalty.
// VPC stack still provisioned for future ECS Fargate (SUI indexer).
export const apiFunction = new sst.aws.Function("Api", {
  url: true,
  handler: "services/api/src/lambda.handler",
  runtime: "nodejs22.x",
  architecture: "arm64",
  memory: "512 MB",
  timeout: "30 seconds",
  link: [...secrets, mediaBucket, nftMetadataBucket],
  environment: {
    NODE_ENV: $app.stage === "production" ? "production" : "development",
  },
});

// ── Media Upload Lambda ──────────────────────────────────────────────────────
// Generates R2 presigned upload URLs. Client uploads directly to R2.
export const uploadFunction = new sst.aws.Function("Upload", {
  url: true,
  handler: "services/upload/src/lambda.handler",
  runtime: "nodejs22.x",
  architecture: "arm64",
  memory: "256 MB",
  timeout: "10 seconds",
  link: [...secrets, mediaBucket],
});

export const api = {
  url: apiFunction.url,
  uploadUrl: uploadFunction.url,
};
