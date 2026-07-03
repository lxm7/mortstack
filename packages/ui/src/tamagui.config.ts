// ── Glacier design system ──────────────────────────────────────────────────
// Single source of truth in code for docs/design/THEME.md ("Glacier", v2.x).
// One system, App (Light) mode only — the crypto inspector moved to light in
// its DESIGN.md 2.1.0, so there is no `inspector_dark` theme here. Product UI
// is light-only.
//
// This file owns the `declare module "tamagui"` augmentation, so it lives in
// @repo/ui where the design-system components can type-check `$primary` etc.
// apps/mobile/tamagui.config.ts re-exports it (kept at that path for the metro
// plugin + providers).
//
// Fonts are loaded via useFonts() in the app's _layout.tsx — the `face` family
// names below MUST match the @expo-google-fonts export names exactly.

import { createFont, createTamagui, createTokens } from "tamagui";
import { createAnimations } from "@tamagui/animations-react-native";

// ── Animations ─────────────────────────────────────────────────────────────
// 160–220ms ease-out feel (THEME §7). `fast` = state feedback; `medium` = the
// inspector reveal beats; `slow` = ambient glow loops.
const animations = createAnimations({
  fast: { damping: 22, mass: 1, stiffness: 250 },
  medium: { damping: 18, mass: 0.9, stiffness: 120 },
  slow: { damping: 20, stiffness: 60 },
});

// ── Fonts (THEME §3) ────────────────────────────────────────────────────────
// Three families, three jobs. Weight/size/colour carry hierarchy inside a
// family; the family switch signals a change of register (voice → text → machine).
// Components pass literal fontSize/lineHeight per the type scale, so the size
// maps below only need to give sane defaults for bare <Text>.

const headingFont = createFont({
  family: "Sora",
  size: {
    1: 12,
    2: 13,
    3: 14,
    4: 16,
    5: 18,
    6: 20,
    7: 24,
    8: 32,
    9: 40,
    10: 48,
    true: 20,
  },
  lineHeight: {
    1: 16,
    2: 18,
    3: 20,
    4: 24,
    5: 28,
    6: 28,
    7: 32,
    8: 40,
    9: 48,
    10: 56,
    true: 28,
  },
  weight: { 1: "400", 2: "500", 3: "600", 4: "700" },
  letterSpacing: { 1: 0, 2: -0.2, 3: -0.5, 4: -1 },
  face: {
    400: { normal: "Sora_400Regular" },
    500: { normal: "Sora_500Medium" },
    600: { normal: "Sora_600SemiBold" },
    700: { normal: "Sora_700Bold" },
  },
});

const bodyFont = createFont({
  family: "PlusJakartaSans",
  size: {
    1: 11,
    2: 12,
    3: 13,
    4: 14,
    5: 16,
    6: 18,
    7: 20,
    8: 24,
    9: 30,
    10: 40,
    true: 16,
  },
  lineHeight: {
    1: 16,
    2: 16,
    3: 16,
    4: 20,
    5: 24,
    6: 28,
    7: 28,
    8: 32,
    9: 40,
    10: 48,
    true: 24,
  },
  weight: { 1: "400", 2: "500", 3: "600", 4: "700" },
  letterSpacing: { 1: 0, 2: 0.1, 3: 0.2, 4: 0.96 },
  face: {
    400: {
      normal: "PlusJakartaSans_400Regular",
      italic: "PlusJakartaSans_400Regular_Italic",
    },
    500: {
      normal: "PlusJakartaSans_500Medium",
      italic: "PlusJakartaSans_500Medium_Italic",
    },
    600: { normal: "PlusJakartaSans_600SemiBold" },
    700: { normal: "PlusJakartaSans_700Bold" },
  },
});

const monoFont = createFont({
  family: "JetBrainsMono",
  size: {
    1: 11,
    2: 12,
    3: 13,
    4: 14,
    5: 15,
    6: 16,
    7: 18,
    8: 20,
    9: 24,
    10: 30,
    true: 13,
  },
  lineHeight: {
    1: 16,
    2: 18,
    3: 20,
    4: 20,
    5: 22,
    6: 24,
    7: 26,
    8: 28,
    9: 32,
    10: 40,
    true: 20,
  },
  weight: { 1: "400", 2: "500", 3: "600", 4: "700" },
  letterSpacing: { 1: 0, 2: 0, 3: 0, 4: 0 },
  face: {
    400: { normal: "JetBrainsMono_400Regular" },
    500: { normal: "JetBrainsMono_500Medium" },
  },
});

// ── Raw palette ─────────────────────────────────────────────────────────────
// THEME §2 hexes. Themes map these to semantic slots below; components never
// reference raw hex — they use the semantic theme tokens ($primary, $surface…).
const palette = {
  // Shared accent ramp (§2.1)
  ice100: "#e6f7ff",
  ice300: "#7dd3fc",
  ice500: "#00f5ff",
  ice700: "#00696e",
  violet500: "#5400c3",
  lavender300: "#c8a0f0",

  // App (Light) surfaces + ink (§2.2)
  background: "#f9f9fd",
  surface: "#ffffff",
  surfaceContainerLow: "#f3f3f7",
  surfaceContainer: "#eeedf2",
  surfaceContainerHigh: "#e8e8ec",
  surfaceContainerHighest: "#e2e2e6",
  onSurface: "#1a1c1f",
  onSurfaceVariant: "#3a494a",
  outline: "#6a7a7b",
  outlineVariant: "#b9caca",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#00363a",
  onSecondary: "#ffffff",
  tertiary: "#5b5f61",
  error: "#ba1a1a",
  onError: "#ffffff",
  errorContainer: "#ffdad6",
  success: "#0f7a5a",

  black: "#000000",
  white: "#ffffff",
} as const;

// ── Tokens ──────────────────────────────────────────────────────────────────
// size/space keep a numeric scale (used by width/height/size props + a few
// retained non-chat screens) AND add the named 8pt scale from THEME §4 that the
// design-system components consume ($xs $sm $md $lg $xl). radius likewise carries
// numeric + named keys; per-group resolution means radius.$md (12) and
// space.$md (24) coexist without collision.
const sizeScale = {
  0: 0,
  0.5: 4,
  1: 8,
  1.5: 12,
  2: 16,
  2.5: 20,
  3: 24,
  3.5: 28,
  4: 32,
  5: 40,
  6: 48,
  7: 56,
  8: 64,
  9: 72,
  10: 80,
  true: 16,
};

export const tokens = createTokens({
  size: sizeScale,
  space: {
    ...sizeScale,
    "-1": -8,
    "-2": -16,
    // Named 8pt scale (THEME §4)
    base: 4,
    xs: 8,
    sm: 16,
    md: 24,
    lg: 40,
    xl: 64,
    gutter: 16,
  },
  radius: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 24,
    6: 32,
    true: 8,
    // Named radii (THEME §4): sm 4 · DEFAULT 8 · md 12 · lg 16 · xl 24
    sm: 4,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  zIndex: { 0: 0, 1: 100, 2: 200, 3: 300, 4: 400, 5: 500 },
  color: palette,
});

// ── Theme (App Light) ────────────────────────────────────────────────────────
// Glacier semantic slots + a small set of legacy aliases (background/color/
// borderColor/brand/placeholderColor…) so the retained non-chat screens
// (settings, auth, chat/new, chat/info) keep rendering until they're restyled.
const light = {
  // Glacier semantic (THEME §2.2)
  background: palette.background,
  surface: palette.surface,
  surfaceContainerLow: palette.surfaceContainerLow,
  surfaceContainer: palette.surfaceContainer,
  surfaceContainerHigh: palette.surfaceContainerHigh,
  surfaceContainerHighest: palette.surfaceContainerHighest,
  onSurface: palette.onSurface,
  onSurfaceVariant: palette.onSurfaceVariant,
  outline: palette.outline,
  outlineVariant: palette.outlineVariant,
  primary: palette.ice700,
  onPrimary: palette.onPrimary,
  primaryContainer: palette.ice500,
  onPrimaryContainer: palette.onPrimaryContainer,
  secondary: palette.violet500,
  onSecondary: palette.onSecondary,
  tertiary: palette.tertiary,
  error: palette.error,
  onError: palette.onError,
  errorContainer: palette.errorContainer,
  success: palette.success,

  // Accent thread used by the outgoing chat-bubble gradient (ChatBubble.md).
  // iceLight = ice-300 so the outgoing fill reads ice-blue → violet.
  iceLight: palette.ice300,

  // Semantic crypto slots (light-mode equivalents — colour + label + weight
  // carry the wire/device contrast, per crypto-inspector 2.1.0). cipher = dim
  // recessed ink; plaintext = bright forward ink.
  cipher: palette.onSurfaceVariant,
  plaintext: palette.onSurface,
  verified: palette.success,
  tamper: palette.error,

  // Tamagui built-in interaction slots
  backgroundHover: palette.surfaceContainerLow,
  backgroundPress: palette.surfaceContainer,
  backgroundFocus: palette.surfaceContainerLow,
  backgroundStrong: palette.surfaceContainer,
  backgroundTransparent: "rgba(249,249,253,0)",
  color: palette.onSurface,
  colorHover: palette.onSurfaceVariant,
  colorPress: palette.onSurfaceVariant,
  colorFocus: palette.onSurface,
  colorTransparent: "rgba(0,0,0,0)",
  borderColor: palette.outlineVariant,
  borderColorHover: palette.outline,
  borderColorFocus: palette.ice700,
  borderColorPress: palette.outline,
  placeholderColor: palette.onSurfaceVariant,
  outlineColor: palette.ice700,
  shadowColor: palette.black,
  shadowColorStrong: palette.black,

  // Legacy aliases (retained screens) → mapped to Glacier equivalents
  brand: palette.ice700,
  brandHover: palette.onPrimaryContainer,
  brandPress: palette.onPrimaryContainer,
  brandText: palette.onPrimary,
  surface1: palette.surface,
  surface2: palette.surfaceContainerLow,
  surface3: palette.surfaceContainer,
};

// Product is light-only. `dark` mirrors `light` so a stray dark colorScheme
// can't crash TamaguiProvider — the app forces `light` in providers regardless.
const dark = { ...light };

// ── Config ────────────────────────────────────────────────────────────────
const config = createTamagui({
  animations,
  fonts: { heading: headingFont, body: bodyFont, mono: monoFont },
  tokens,
  themes: { light, dark },
  defaultFont: "body",
  media: {
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1650 },
    xxl: { minWidth: 1651 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverable: { hover: "hover" },
    touch: { pointer: "coarse" },
  },
  shorthands: {
    px: "paddingHorizontal",
    py: "paddingVertical",
    pt: "paddingTop",
    pb: "paddingBottom",
    pl: "paddingLeft",
    pr: "paddingRight",
    p: "padding",
    mx: "marginHorizontal",
    my: "marginVertical",
    mt: "marginTop",
    mb: "marginBottom",
    ml: "marginLeft",
    mr: "marginRight",
    m: "margin",
    f: "flex",
    w: "width",
    h: "height",
    bg: "backgroundColor",
    br: "borderRadius",
    ai: "alignItems",
    jc: "justifyContent",
  } as const,
  settings: {
    allowedStyleValues: "somewhat-strict",
    autocompleteSpecificTokens: "except-special",
  },
});

type AppConfig = typeof config;

declare module "tamagui" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
