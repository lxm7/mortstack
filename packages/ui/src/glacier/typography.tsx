// Glacier type scale (THEME §3.1) as styled Text presets. Three families:
// Sora (heading), Plus Jakarta Sans (body/meta), JetBrains Mono (machine).
// letterSpacing is em→px at each size; meta + mono carry tabular figures.
import { styled, Text } from "tamagui";

// ── Sora (display & headlines) ──────────────────────────────────────────────
export const DisplayLg = styled(Text, {
  name: "DisplayLg",
  fontFamily: "$heading",
  fontSize: 48,
  lineHeight: 56,
  fontWeight: "700",
  letterSpacing: -0.96,
  color: "$onSurface",
});

export const HeadlineLg = styled(Text, {
  name: "HeadlineLg",
  fontFamily: "$heading",
  fontSize: 32,
  lineHeight: 40,
  fontWeight: "600",
  letterSpacing: -0.32,
  color: "$onSurface",
});

export const HeadlineMd = styled(Text, {
  name: "HeadlineMd",
  fontFamily: "$heading",
  fontSize: 24,
  lineHeight: 32,
  fontWeight: "600",
  color: "$onSurface",
});

export const Title = styled(Text, {
  name: "Title",
  fontFamily: "$heading",
  fontSize: 20,
  lineHeight: 28,
  fontWeight: "600",
  color: "$onSurface",
});

// ── Plus Jakarta Sans (body, labels, metadata) ──────────────────────────────
export const BodyLg = styled(Text, {
  name: "BodyLg",
  fontFamily: "$body",
  fontSize: 18,
  lineHeight: 28,
  fontWeight: "400",
  color: "$onSurface",
});

export const BodyMd = styled(Text, {
  name: "BodyMd",
  fontFamily: "$body",
  fontSize: 16,
  lineHeight: 24,
  fontWeight: "400",
  letterSpacing: 0.16,
  color: "$onSurface",
});

export const BodySm = styled(Text, {
  name: "BodySm",
  fontFamily: "$body",
  fontSize: 14,
  lineHeight: 20,
  fontWeight: "400",
  letterSpacing: 0.14,
  color: "$onSurface",
});

export const Label = styled(Text, {
  name: "Label",
  fontFamily: "$body",
  fontSize: 13,
  lineHeight: 16,
  fontWeight: "500",
  letterSpacing: 0.26,
  color: "$onSurface",
});

// "Today" · "Delivered" · timestamps — uppercase, tracked, tabular.
export const Meta = styled(Text, {
  name: "Meta",
  fontFamily: "$body",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "500",
  letterSpacing: 0.96,
  textTransform: "uppercase",
  color: "$onSurfaceVariant",
  fontVariant: ["tabular-nums"],
});

// ── JetBrains Mono (cipher hex, fingerprints, byte counts) ──────────────────
export const MonoMd = styled(Text, {
  name: "MonoMd",
  fontFamily: "$mono",
  fontSize: 13,
  lineHeight: 20,
  fontWeight: "500",
  color: "$onSurfaceVariant",
  fontVariant: ["tabular-nums"],
});

export const MonoSm = styled(Text, {
  name: "MonoSm",
  fontFamily: "$mono",
  fontSize: 12,
  lineHeight: 18,
  fontWeight: "400",
  color: "$onSurfaceVariant",
  fontVariant: ["tabular-nums"],
});
