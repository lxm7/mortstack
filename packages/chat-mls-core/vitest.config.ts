import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Acceptance suite runs against the napi-rs binding + Maps-backed
    // mlsStore + mock MlsRpc. No native bridge, no live server. Each test
    // hosts N "devices" in one Node process.
    include: ["test/**/*.test.ts"],
    // OpenMLS work + Welcome routing across 5 devices is bound by Rust
    // CPU; default 5s is plenty but reserve a little headroom for CI.
    testTimeout: 15_000,
    hookTimeout: 15_000,
    // Run serially: per-test isolation is already enforced by the
    // per-device factory (each test allocates fresh state). Concurrent
    // file execution adds zero throughput here while complicating debug.
    fileParallelism: false,
    pool: "forks",
  },
});
