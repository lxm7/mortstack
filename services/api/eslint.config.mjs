import { config } from "@repo/eslint-config/base";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    ignores: ["dist/**"],
  },
  {
    // Deferred SUI auth plugin — file-wide @ts-nocheck allowed until ported
    // to current better-auth API. See file header for migration notes.
    files: ["src/lib/sui-auth-plugin.ts"],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
];
