import { config } from "@repo/eslint-config/base";

export default [
  ...config,
  {
    // Deferred / aspirational files — @ts-nocheck allowed until ported.
    // Each entry must have a header comment explaining why it's deferred.
    files: [
      "services/api/src/lib/sui-auth-plugin.ts",
    ],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
];
