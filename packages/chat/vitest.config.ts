import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Pure-logic units only: the msgpack frame codec (crypto-pipe, exercised via
    // a passthrough MlsApi mock so no native crypto is needed) and the Zustand
    // store reducers. React hooks + the native chat-crypto module are out of
    // scope here — the frame tests mock @repo/chat-crypto since it calls
    // requireNativeModule() at import.
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
