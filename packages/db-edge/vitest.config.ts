import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Pure-logic units only: messagesSince query construction + bytea/serial
    // row mapping, exercised through a fake tagged-template sql executor (no
    // Neon round-trip). The membership EXISTS gate is asserted as a query
    // property here; end-to-end enforcement is covered by the Maestro flow.
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
