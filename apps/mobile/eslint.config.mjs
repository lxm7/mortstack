import expo from "eslint-config-expo/flat.js";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  ...expo,
  eslintConfigPrettier,
  {
    ignores: ["dist/**", "android/**", "ios/**", ".expo/**", "sst-env.d.ts"],
  },
];
