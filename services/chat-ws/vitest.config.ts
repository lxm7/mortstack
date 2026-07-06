import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Pure-logic units only: the backfill KV-skip / paging / cursor rules
    // (docs/message-backfill.md, ADR-0020), exercised through injected fakes for
    // the KV and Neon seams — no Durable Object runtime, no Neon round-trip.
    // End-to-end DO behaviour is covered by the Maestro offline-catch-up flow.
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
