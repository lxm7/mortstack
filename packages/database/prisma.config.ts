import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Migrations need a direct (non-pooler) connection — Neon's pooler runs
  // PgBouncer in transaction mode which breaks DDL + prepared statements.
  // Runtime queries still go through DATABASE_URL (pooler) via Prisma Client.
  // Sourced from process.env directly (not SST Resource) — this config runs
  // under the Prisma CLI, not Lambda. Empty fallback lets `prisma generate`
  // succeed in CI postinstall where DIRECT_URL isn't set; migrate/seed steps
  // must export DIRECT_URL themselves.
  // datasource: {
  //   url: process.env.DIRECT_URL ?? "",
  // },
});
