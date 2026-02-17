# Infrastructure

Multi-cloud setup using SST Ion (v3).

## Provider Map

| What | Provider | Why |
|---|---|---|
| API (Lambda) | AWS | tRPC handler, Rekognition access |
| Media storage | Cloudflare R2 | Zero egress fees vs S3 |
| CDN | Cloudflare | Global, fast, free egress |
| PostgreSQL | Neon | Serverless, branches per PR, scales to zero |
| Redis | Upstash | Serverless, pay-per-request |
| Kafka | Upstash | SUI indexer events → API consumers |
| Content moderation | AWS Rekognition | No viable alternative |
| SUI indexer | AWS ECS Fargate | Persistent WebSocket to SUI RPC |

## Stacks

```
infra/stacks/
├── secrets.ts        All external credentials (Neon, Upstash, JWT, Cloudflare)
├── storage.ts        Cloudflare R2 buckets (media, NFT metadata)
├── api.ts            AWS Lambda (tRPC API + upload presigner)
├── sui-indexer.ts    AWS ECS (SUI blockchain event listener) [STUB]
└── moderation.ts     AWS Rekognition content moderation [STUB]
```

## Prerequisites

Before running any SST commands:

### 1. AWS credentials
```bash
aws configure
# or
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_DEFAULT_REGION=eu-west-1
```

### 2. Cloudflare credentials
```bash
export CLOUDFLARE_ACCOUNT_ID=...
export CLOUDFLARE_API_TOKEN=...  # Needs R2 read/write permissions
```

### 3. Create external accounts
- **Neon**: https://neon.tech — create a project, get connection string
- **Upstash Redis**: https://console.upstash.com — create a Redis database
- **Upstash Kafka**: https://console.upstash.com — create a Kafka cluster

## Setup (first time)

```bash
# 1. Set all secrets for your stage
sst secret set DatabaseUrl "postgresql://..." --stage production
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

## Development

```bash
# Start local dev mode - proxies live AWS to your machine
sst dev

# This starts:
# - tRPC Lambda running locally at http://localhost:3001
# - Upload Lambda running locally at http://localhost:3002
# - Connects to your local PostgreSQL (DATABASE_URL in .env)
# - Uses Upstash dev credentials from secrets
```

## Stages

| Stage | Purpose | Notes |
|---|---|---|
| `dev` | Local development | Points to local Postgres, testnet SUI |
| `staging` | Pre-production | Full cloud, SUI testnet |
| `production` | Live app | SUI mainnet, retained resources |

## Cost Estimate (monthly, low traffic)

| Service | Free tier | ~1k users |
|---|---|---|
| AWS Lambda | 1M requests | < $1 |
| AWS ECS (SUI indexer) | — | ~$10 (t3.micro equivalent) |
| AWS Rekognition | 1000 images | ~$1 |
| Cloudflare R2 | 10GB + 1M ops | Free |
| Cloudflare CDN | Unlimited egress | Free |
| Neon PostgreSQL | 0.5GB compute | Free |
| Upstash Redis | 10k req/day | Free |
| Upstash Kafka | 10k messages/day | Free |
| **Total** | | **~$12/mo** |
