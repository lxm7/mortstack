import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Migrations need a direct (non-pooler) connection — Neon's pooler runs
  // PgBouncer in transaction mode which breaks DDL + prepared statements.
  // Runtime queries still go through DATABASE_URL (pooler) via Prisma Client.
  datasource: {
    url: env("DIRECT_URL") ?? "",
  },
});
