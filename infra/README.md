# Infrastructure

Multi-cloud setup using SST Ion (v3).

## Provider Map

| What               | Provider        | Why                                         |
| ------------------ | --------------- | ------------------------------------------- |
| API (Lambda)       | AWS             | tRPC + Better Auth handler                  |
| Media storage      | Cloudflare R2   | Zero egress fees vs S3                      |
| CDN                | Cloudflare      | Global, fast, free egress                   |
| PostgreSQL         | Neon            | Serverless, branches per PR, scales to zero |
| Redis              | Upstash         | Serverless, pay-per-request                 |
| Kafka              | Upstash         | Inter-service event bus                     |
| Content moderation | AWS Rekognition | No viable alternative                       |
| SUI indexer        | AWS ECS Fargate | Persistent WebSocket to SUI RPC             |
| Real-time          | AWS API Gateway  | WebSocket API, scales to zero              |
| Push notifications | Expo Push API   | Free, wraps APNs + FCM                     |

## Stacks

```
infra/stacks/
├── vpc.ts            Shared VPC for all AWS compute
├── secrets.ts        All external credentials (Neon, Upstash, JWT, Cloudflare)
├── storage.ts        Cloudflare R2 buckets (media, NFT metadata)
├── api.ts            AWS Lambda (tRPC API + upload presigner)
├── sui-indexer.ts    AWS ECS Fargate Spot (SUI blockchain event listener) [STUB]
├── moderation.ts     AWS Rekognition content moderation [STUB]
├── realtime.ts       API Gateway WebSocket for live updates [STUB]
└── notifications.ts  Push notifications via Expo Push API [STUB]
```

## Prerequisites

### 1. Create external accounts

- **Neon**: https://neon.tech — create a project, get connection string
- **Upstash Redis**: https://console.upstash.com — create a Redis database
- **Upstash Kafka**: https://console.upstash.com — create a Kafka cluster (1 topic, name it `events`)

### 2. AWS credentials

```bash
aws configure
# or
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_DEFAULT_REGION=eu-west-1
```

### 3. Cloudflare credentials

```bash
export CLOUDFLARE_ACCOUNT_ID=...
export CLOUDFLARE_API_TOKEN=...  # Needs R2 read/write permissions
```

## Local Development Setup

### 1. Create `.env` files

`packages/database/.env`:
```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.eu-west-1.aws.neon.tech/sessions?sslmode=require"
```

`services/api/.env`:
```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.eu-west-1.aws.neon.tech/sessions?sslmode=require"
BETTER_AUTH_SECRET="generate-a-random-32-char-string-here"
TRUSTED_ORIGINS="http://localhost:3000,http://localhost:8081"
```

### 2. Push schema and seed

```bash
pnpm --filter @repo/database db:migrate:dev
pnpm --filter @repo/database db:seed
```

### 3. Start API

```bash
pnpm --filter api dev
```

### 4. Start RN app

```bash
cd apps/rn-tamagui
npx expo start --dev-client
```

### Test credentials (seeded)

All accounts use password `password123`:

| Email               | Tier    | Profiles                                    |
| ------------------- | ------- | ------------------------------------------- |
| alice@example.com   | ARTIST  | alice-music, alice-studio                   |
| bob@example.com     | CREATOR | bob-beats, the-collective (owner)           |
| carol@example.com   | CREATOR | carol-creates, the-collective (member)      |
| dave@example.com    | BASIC   | fabric-london                               |
| eve@example.com     | BASIC   | warehouse-events                            |
| frank@example.com   | NONE    | none (new user edge case)                   |

## Deployment Setup (first time)

```bash
# 1. Set all secrets for your stage
sst secret set DatabaseUrl "postgresql://..." --stage production
sst secret set BetterAuthSecret "$(openssl rand -hex 32)" --stage production
sst secret set UpstashRedisUrl "rediss://..." --stage production
sst secret set UpstashRedisToken "..." --stage production
sst secret set UpstashKafkaUrl "..." --stage production
sst secret set UpstashKafkaUsername "..." --stage production
sst secret set UpstashKafkaPassword "..." --stage production
sst secret set JwtSecret "$(openssl rand -hex 32)" --stage production
sst secret set JwtRefreshSecret "$(openssl rand -hex 32)" --stage production
sst secret set CloudflareR2AccessKeyId "..." --stage production
sst secret set CloudflareR2SecretAccessKey "..." --stage production

# 2. Preview what will be deployed (no changes made)
sst diff --stage production

# 3. Deploy (only when ready)
sst deploy --stage production
```

## Stages

| Stage        | Purpose           | Notes                                     |
| ------------ | ----------------- | ----------------------------------------- |
| `dev`        | Local development | Neon dev branch, SUI testnet              |
| `staging`    | Pre-production    | Neon staging branch, SUI testnet          |
| `production` | Live app          | Neon main branch, SUI mainnet, retained   |

## Cost Estimate (monthly, low traffic)

| Service               | Free tier          | ~1k users |
| --------------------- | ------------------ | --------- |
| AWS Lambda            | 1M requests        | < $1      |
| AWS ECS (SUI indexer) | —                  | ~$6 (Fargate Spot arm64) |
| AWS Rekognition       | 1000 images        | ~$1       |
| AWS API GW WebSocket  | 1M msgs / 750K min | Free      |
| Cloudflare R2         | 10GB + 1M ops      | Free      |
| Cloudflare CDN        | Unlimited egress   | Free      |
| Neon PostgreSQL       | 0.5GB compute      | Free      |
| Upstash Redis         | 10k req/day        | Free      |
| Upstash Kafka         | 10k messages/day   | Free      |
| **Total**             |                    | **~$8/mo** |
