import { createFont, createTamagui, createTokens } from 'tamagui'
import { createAnimations } from '@tamagui/animations-react-native'

// ── Animations ────────────────────────────────────────────────────────────────
const animations = createAnimations({
  fast: {
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  medium: {
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  slow: {
    damping: 20,
    stiffness: 60,
  },
})

// ── IBM Plex Sans font ────────────────────────────────────────────────────────
// Font data loaded via useFonts() in _layout.tsx — keys must match exactly.
const ibmPlexSans = createFont({
  family: 'IBMPlexSans',
  size: {
    1: 11,
    2: 12,
    3: 13,
    4: 14,
    5: 15,
    6: 16,
    7: 20,
    8: 23,
    9: 30,
    10: 46,
    11: 55,
    12: 62,
    13: 72,
    14: 92,
    15: 114,
    16: 134,
  },
  lineHeight: {
    1: 17,
    2: 18,
    3: 19,
    4: 20,
    5: 22,
    6: 24,
    7: 28,
    8: 32,
    9: 40,
    10: 56,
  },
  weight: {
    1: '400',
    2: '500',
    3: '600',
    4: '700',
  },
  letterSpacing: {
    1: 0,
    2: -0.5,
    3: -1,
  },
  face: {
    400: { normal: 'IBMPlexSans_400Regular', italic: 'IBMPlexSans_400Regular_Italic' },
    500: { normal: 'IBMPlexSans_500Medium', italic: 'IBMPlexSans_500Medium_Italic' },
    600: { normal: 'IBMPlexSans_600SemiBold', italic: 'IBMPlexSans_600SemiBold_Italic' },
    700: { normal: 'IBMPlexSans_700Bold', italic: 'IBMPlexSans_700Bold_Italic' },
  },
})

// ── Tokens ────────────────────────────────────────────────────────────────────
const size = {
  0: 0,
  0.25: 2,
  0.5: 4,
  0.75: 6,
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
  true: 16, // default
}

export const tokens = createTokens({
  size,
  space: { ...size, '-1': -8, '-1.5': -12, '-2': -16, '-2.5': -20 },
  radius: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 24,
    6: 32,
    true: 8,
    full: 9999,
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
  },
  color: {
    // Brand — electric violet
    brand50: '#f3f0ff',
    brand100: '#e9e3ff',
    brand200: '#d4caff',
    brand300: '#b8a9ff',
    brand400: '#9b7dff',
    brand500: '#7c3aed',
    brand600: '#6d28d9',
    brand700: '#5b21b6',
    brand800: '#4c1d95',
    brand900: '#3b0764',

    // Neutrals
    gray50: '#fafafa',
    gray100: '#f4f4f5',
    gray200: '#e4e4e7',
    gray300: '#d1d1d6',
    gray400: '#a1a1aa',
    gray500: '#71717a',
    gray600: '#52525b',
    gray700: '#3f3f46',
    gray800: '#27272a',
    gray900: '#18181b',
    gray950: '#09090b',

    // Semantic
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

    white: '#ffffff',
    black: '#000000',
  },
})

// ── Themes ────────────────────────────────────────────────────────────────────
const lightTheme = {
  background: tokens.color.white,
  backgroundHover: tokens.color.gray50,
  backgroundPress: tokens.color.gray100,
  backgroundFocus: tokens.color.gray100,
  backgroundStrong: tokens.color.gray100,
  backgroundTransparent: 'rgba(255,255,255,0)',

  color: tokens.color.gray950,
  colorHover: tokens.color.gray800,
  colorPress: tokens.color.gray700,
  colorFocus: tokens.color.gray900,
  colorTransparent: 'rgba(0,0,0,0)',

  borderColor: tokens.color.gray200,
  borderColorHover: tokens.color.gray300,
  borderColorFocus: tokens.color.brand500,
  borderColorPress: tokens.color.gray400,

  placeholderColor: tokens.color.gray400,
  outlineColor: tokens.color.brand500,

  // Brand
  brand: tokens.color.brand500,
  brandHover: tokens.color.brand600,
  brandPress: tokens.color.brand700,
  brandText: tokens.color.white,

  // Surfaces
  surface1: tokens.color.white,
  surface2: tokens.color.gray50,
  surface3: tokens.color.gray100,

  shadowColor: tokens.color.gray950,
  shadowColorStrong: tokens.color.gray950,
}

const darkTheme = {
  background: tokens.color.gray950,
  backgroundHover: tokens.color.gray900,
  backgroundPress: tokens.color.gray800,
  backgroundFocus: tokens.color.gray800,
  backgroundStrong: tokens.color.gray800,
  backgroundTransparent: 'rgba(0,0,0,0)',

  color: tokens.color.gray50,
  colorHover: tokens.color.gray100,
  colorPress: tokens.color.gray200,
  colorFocus: tokens.color.white,
  colorTransparent: 'rgba(255,255,255,0)',

  borderColor: tokens.color.gray800,
  borderColorHover: tokens.color.gray700,
  borderColorFocus: tokens.color.brand400,
  borderColorPress: tokens.color.gray600,

  placeholderColor: tokens.color.gray600,
  outlineColor: tokens.color.brand400,

  brand: tokens.color.brand400,
  brandHover: tokens.color.brand300,
  brandPress: tokens.color.brand200,
  brandText: tokens.color.gray950,

  surface1: tokens.color.gray950,
  surface2: tokens.color.gray900,
  surface3: tokens.color.gray800,

  shadowColor: tokens.color.black,
  shadowColorStrong: tokens.color.black,
}

// ── Config ────────────────────────────────────────────────────────────────────
const config = createTamagui({
  animations,
  fonts: {
    heading: ibmPlexSans,
    body: ibmPlexSans,
    mono: ibmPlexSans,
  },
  tokens,
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
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
    hoverable: { hover: 'hover' },
    touch: { pointer: 'coarse' },
  },
  shorthands: {
    px: 'paddingHorizontal',
    py: 'paddingVertical',
    pt: 'paddingTop',
    pb: 'paddingBottom',
    pl: 'paddingLeft',
    pr: 'paddingRight',
    p: 'padding',
    mx: 'marginHorizontal',
    my: 'marginVertical',
    mt: 'marginTop',
    mb: 'marginBottom',
    ml: 'marginLeft',
    mr: 'marginRight',
    m: 'margin',
    f: 'flex',
    w: 'width',
    h: 'height',
    bg: 'backgroundColor',
    br: 'borderRadius',
  } as const,
  settings: {
    allowedStyleValues: 'somewhat-strict',
    autocompleteSpecificTokens: 'except-special',
  },
})

type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config
