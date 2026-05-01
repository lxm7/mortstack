// All external secrets - set via `sst secret set <Name> <value> --stage <stage>`
// Never hardcode values here. Never commit .env files with real values.
//
// Setup commands (run once per stage):
//
// ── Database ────────────────────────────────────────────────────────────────
// Neon serverless PostgreSQL
// Dev: points to local Postgres (set DATABASE_URL in .env)
// Staging/Prod: Neon connection string
export const databaseUrl = new sst.Secret("DatabaseUrl");

// ── Auth ────────────────────────────────────────────────────────────────────
export const jwtSecret = new sst.Secret("JwtSecret");
export const jwtRefreshSecret = new sst.Secret("JwtRefreshSecret");

// ── Cloudflare (R2 access from Lambda) ──────────────────────────────────────
export const cfR2AccessKeyId = new sst.Secret("CloudflareR2AccessKeyId");
export const cfR2SecretAccessKey = new sst.Secret(
  "CloudflareR2SecretAccessKey",
);

// All secrets as an array for easy linking to functions
export const secrets = [
  databaseUrl,
  jwtSecret,
  jwtRefreshSecret,
  cfR2AccessKeyId,
  cfR2SecretAccessKey,
];
