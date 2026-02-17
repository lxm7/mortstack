// All external secrets - set via `sst secret set <Name> <value> --stage <stage>`
// Never hardcode values here. Never commit .env files with real values.
//
// Setup commands (run once per stage):
//
//   # Database (Neon)
//   sst secret set DatabaseUrl "postgresql://..." --stage production
//   sst secret set DatabaseUrl "postgresql://..." --stage staging
//
//   # Upstash Redis
//   sst secret set UpstashRedisUrl "rediss://..." --stage production
//   sst secret set UpstashRedisToken "..." --stage production
//
//   # Upstash Kafka
//   sst secret set UpstashKafkaUrl "..." --stage production
//   sst secret set UpstashKafkaUsername "..." --stage production
//   sst secret set UpstashKafkaPassword "..." --stage production
//
//   # JWT
//   sst secret set JwtSecret "..." --stage production
//   sst secret set JwtRefreshSecret "..." --stage production
//
//   # Cloudflare (needed for R2 access from Lambda)
//   sst secret set CloudflareAccountId "..." --stage production
//   sst secret set CloudflareR2AccessKeyId "..." --stage production
//   sst secret set CloudflareR2SecretAccessKey "..." --stage production

// ── Database ────────────────────────────────────────────────────────────────
// Neon serverless PostgreSQL
// Dev: points to local Postgres (set DATABASE_URL in .env)
// Staging/Prod: Neon connection string
export const databaseUrl = new sst.Secret('DatabaseUrl');

// ── Cache ───────────────────────────────────────────────────────────────────
// Upstash Redis (serverless, pay-per-request, multi-region)
export const upstashRedisUrl = new sst.Secret('UpstashRedisUrl');
export const upstashRedisToken = new sst.Secret('UpstashRedisToken');

// ── Event Streaming ─────────────────────────────────────────────────────────
// Upstash Kafka - for SUI indexer events → API consumers
export const upstashKafkaUrl = new sst.Secret('UpstashKafkaUrl');
export const upstashKafkaUsername = new sst.Secret('UpstashKafkaUsername');
export const upstashKafkaPassword = new sst.Secret('UpstashKafkaPassword');

// ── Auth ────────────────────────────────────────────────────────────────────
export const jwtSecret = new sst.Secret('JwtSecret');
export const jwtRefreshSecret = new sst.Secret('JwtRefreshSecret');

// ── Cloudflare (R2 access from Lambda) ──────────────────────────────────────
export const cfR2AccessKeyId = new sst.Secret('CloudflareR2AccessKeyId');
export const cfR2SecretAccessKey = new sst.Secret('CloudflareR2SecretAccessKey');

// All secrets as an array for easy linking to functions
export const secrets = [
  databaseUrl,
  upstashRedisUrl,
  upstashRedisToken,
  upstashKafkaUrl,
  upstashKafkaUsername,
  upstashKafkaPassword,
  jwtSecret,
  jwtRefreshSecret,
  cfR2AccessKeyId,
  cfR2SecretAccessKey,
];
