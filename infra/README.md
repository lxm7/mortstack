# Infrastructure

Multi-cloud setup using SST Ion (v3).

## Provider Map

| What               | Provider            | Why                                             |
| ------------------ | ------------------- | ----------------------------------------------- |
| API (Lambda)       | AWS                 | tRPC + Better Auth handler                      |
| Event bus (SNS)    | AWS                 | Fan-out topics, native Lambda triggers          |
| Event queues (SQS) | AWS                 | Per-consumer queues, independent retry/DLQ      |
| Media storage      | Cloudflare R2       | Zero egress fees vs S3                          |
| CDN                | Cloudflare          | Global, fast, free egress                       |
| PostgreSQL         | Neon                | Serverless, branches per PR, scales to zero     |
| Content moderation | AWS Rekognition     | No viable alternative                           |
| Real-time          | Expo Push + polling | WebSocket deferred (API GW too costly at scale) |
| Push notifications | Expo Push API       | Free, wraps APNs + FCM                          |

## Stacks

```
infra/stacks/
├── vpc.ts            Shared VPC for all AWS compute
├── secrets.ts        All external credentials (Neon, JWT, Cloudflare)
├── storage.ts        Cloudflare R2 buckets (media)
├── events.ts         SNS topics + SQS queues (event bus, fan-out pattern)
├── api.ts            AWS Lambda (tRPC API + upload presigner)
├── moderation.ts     AWS Rekognition content moderation [STUB — subscribes via events.ts]
├── realtime.ts       Real-time strategy (push notifs + polling, WebSocket deferred)
└── notifications.ts  Push notifications via Expo Push API [STUB — subscribes via events.ts]
```

## Prerequisites

### 1. Create external accounts

- **Neon**: https://neon.tech — create a project, get connection string

### 2. AWS credentials

```bash
aws configure
# or
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_DEFAULT_REGION=eu-west-1
```

### 3. Cloudflare credentials

These are **provider env vars** (not SST secrets) — needed by the Cloudflare provider to provision R2 buckets.

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
pnpm --filter @repo/api-server dev
```

### 4. Start RN app

```bash
cd apps/mobile
npx expo start --dev-client
```

### Test credentials (seeded)

All accounts use password `password123`:

| Email             | Tier    | Profiles                               |
| ----------------- | ------- | -------------------------------------- |
| alice@example.com | ARTIST  | alice-music, alice-studio              |
| bob@example.com   | CREATOR | bob-beats, the-collective (owner)      |
| carol@example.com | CREATOR | carol-creates, the-collective (member) |
| dave@example.com  | BASIC   | fabric-london                          |
| eve@example.com   | BASIC   | warehouse-events                       |
| frank@example.com | NONE    | none (new user edge case)              |

## Deployment Setup (first time)

### Provider env vars (set before `sst deploy`)

```bash
export CLOUDFLARE_ACCOUNT_ID=...
export CLOUDFLARE_API_TOKEN=...
```

### SST secrets (runtime values passed to Lambdas)

```bash
sst secret set DatabaseUrl "postgresql://..." --stage production
sst secret set BetterAuthSecret "$(openssl rand -hex 32)" --stage production
sst secret set JwtSecret "$(openssl rand -hex 32)" --stage production
sst secret set JwtRefreshSecret "$(openssl rand -hex 32)" --stage production
sst secret set CloudflareR2AccessKeyId "..." --stage production
sst secret set CloudflareR2SecretAccessKey "..." --stage production
```

### Deploy

```bash
# Preview what will be deployed (no changes made)
sst diff --stage production

# Deploy (only when ready)
sst deploy --stage production
```

## Stages

| Stage        | Purpose           | Notes                      |
| ------------ | ----------------- | -------------------------- |
| `dev`        | Local development | Neon dev branch            |
| `staging`    | Pre-production    | Neon staging branch        |
| `production` | Live app          | Neon main branch, retained |

## Cost Estimate (monthly, low traffic)

| Service         | Free tier        | ~1k users  |
| --------------- | ---------------- | ---------- |
| AWS Lambda      | 1M requests      | < $1       |
| AWS Rekognition | 1000 images      | ~$1        |
| AWS SNS         | 1M publishes     | Free       |
| AWS SQS         | 1M requests      | Free       |
| Cloudflare R2   | 10GB + 1M ops    | Free       |
| Cloudflare CDN  | Unlimited egress | Free       |
| Neon PostgreSQL | 0.5GB compute    | Free       |
| Expo Push       | Unlimited        | Free       |
| **Total**       |                  | **~$2/mo** |

### Rotation later

#### Same user, new key, decommission old:

aws iam create-access-key --user-name chat-ws-publisher #
new  
 sst secret set ChatWsAwsAccessKeyId "AKIA..." --stage production #
rotate in SST  
 sst secret set ChatWsAwsSecretAccessKey "..." --stage production
sst deploy --stage production #
Worker picks up
aws iam update-access-key --user-name chat-ws-publisher --access-key-id <OLD>  
 --status Inactive  
 aws iam delete-access-key --user-name chat-ws-publisher --access-key-id <OLD>

Don't skip the Inactive step — keeps the old key reversible for ~24h while you  
 confirm the new one is live in CloudWatch / Worker logs.
