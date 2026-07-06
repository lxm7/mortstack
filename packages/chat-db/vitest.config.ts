import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Pure-SQL units: the backfill_cursors migration + store helpers, run
    // against an in-memory node:sqlite that adapts to the op-sqlite DB shape
    // (see backfill-cursors.test.ts). Native op-sqlite / SQLCipher paths are out
    // of scope here — this exercises the SQL, not the RN binding.
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
