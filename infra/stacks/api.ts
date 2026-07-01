import { chatWsHmacSecret, chatWsInternalUrl } from "./chat-secrets";
import { databaseUrl, secrets } from "./secrets";
import { mediaBucket, nftMetadataBucket } from "./storage";

// Shared Prisma + Lambda bundling configuration. See ADR-009 for rationale.
//
// Why not `nodejs.install`? SST's install copies named packages from the
// project's node_modules into the Lambda package, but pnpm's symlinked
// layout makes the Prisma runtime subpaths (e.g. @prisma/client/runtime/
// library) unresolvable at runtime. `copyFiles` dereferences pnpm symlinks
// and physically places the directories at predictable paths.
//
// `esbuild.external` keeps `require("@prisma/client")` in the bundle so
// Node resolves against the copied node_modules at runtime instead of
// bundling the runtime (which has ESM/CJS mixing that breaks under
// esbuild's bundle transforms — see ADR-009 Investigation log).
const prismaLambdaBundling = {
  copyFiles: [
    { from: "node_modules/.prisma", to: "node_modules/.prisma" },
    { from: "node_modules/@prisma/client", to: "node_modules/@prisma/client" },
  ],
  nodejs: {
    esbuild: {
      platform: "node",
      external: ["@prisma/client"],
    },
  },
};

// ── tRPC + Better Auth API Lambda ────────────────────────────────────────────
// Handler: services/api/src/lambda.ts
// Routes: /auth/* → Better Auth, everything else → tRPC
//
// No VPC: Neon HTTP driver adapter reaches Postgres over public internet via
// fetch. Removing VPC kills NAT gateway cost and 1-3s cold-start penalty.
// VPC stack still provisioned for future ECS Fargate workloads.
export const apiFunction = new sst.aws.Function("Api", {
  url: true,
  handler: "services/api/src/lambda.handler",
  runtime: "nodejs22.x",
  architecture: "arm64",
  memory: "512 MB",
  timeout: "30 seconds",
  link: [
    ...secrets,
    chatWsHmacSecret,
    chatWsInternalUrl,
    mediaBucket,
    nftMetadataBucket,
  ],
  environment: {
    NODE_ENV: $app.stage === "production" ? "production" : "development",
    // SST `link` exposes secrets via Resource.X.value but does not inject
    // them into process.env. The Prisma + Neon adapter reads DATABASE_URL
    // directly, so we map it explicitly here. Pooler URL only — direct URL
    // is reserved for migrations.
    DATABASE_URL: databaseUrl.value,
  },
  ...prismaLambdaBundling,
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
  ...prismaLambdaBundling,
});

export const api = {
  url: apiFunction.url,
  uploadUrl: uploadFunction.url,
};
