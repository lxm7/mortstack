// Glacier config lives in @repo/ui (it owns the `declare module "tamagui"`
// augmentation so the design-system components type-check $primary etc.).
// This re-export keeps the path stable for the metro plugin (metro.config.js
// → config: "./tamagui.config.ts") and providers/index.tsx.
export { default, tokens } from "@repo/ui/tamagui.config";
export { default as config } from "@repo/ui/tamagui.config";
