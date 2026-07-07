// Glacier Avatar (components/Avatar.md). Photo or deterministic initials, with
// an optional presence pip. Hue is picked deterministically from a small fixed
// accent palette; fill is that hue at 15%, initials at full opacity.
import { Image, Text, YStack, styled } from "tamagui";

import { palette } from "../tamagui.config";

type Size = "sm" | "md" | "lg";
type Status = "online" | "away" | "offline";

const DIAMETER: Record<Size, number> = { sm: 32, md: 40, lg: 48 };

// Fixed accent palette (THEME §2): primary teal, secondary violet, slate —
// sourced from the token palette so a §2 recolour propagates here.
const HUES = [
  palette.ice700,
  palette.violet500,
  palette.onSurfaceVariant,
] as const;

function hueFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return HUES[h % HUES.length] as string;
}

function tint15(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},0.15)`;
}

function initialsOf(name: string): string {
  const t = name.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return t.slice(0, 2).toUpperCase();
}

const AvatarFrame = styled(YStack, {
  name: "GlacierAvatar",
  borderRadius: "$full",
  overflow: "hidden",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "$surfaceContainerLow",

  variants: {
    inactive: { true: { opacity: 0.8 } },
  } as const,
});

const StatusPip = styled(YStack, {
  name: "GlacierStatusPip",
  position: "absolute",
  bottom: -1,
  right: -1,
  width: 12,
  height: 12,
  borderRadius: "$full",
  borderWidth: 2,
  borderColor: "$surface",

  variants: {
    status: {
      online: { backgroundColor: "$success" },
      away: { backgroundColor: "$tertiary" },
      offline: { display: "none" },
    },
  } as const,
});

export interface AvatarProps {
  size?: Size;
  /** Photo URL; falls back to initials when absent. */
  uri?: string | null;
  /** Display name → initials + deterministic hue. */
  name?: string | null;
  /** Stable seed for the hue (e.g. accountId). Defaults to `name`. */
  seed?: string;
  status?: Status;
  inactive?: boolean;
}

export function Avatar({
  size = "lg",
  uri,
  name,
  seed,
  status = "offline",
  inactive,
}: AvatarProps) {
  const d = DIAMETER[size];
  const hue = hueFor(seed ?? name ?? "?");
  const showPip = status !== "offline";

  return (
    <YStack width={d} height={d}>
      <AvatarFrame
        width={d}
        height={d}
        inactive={inactive}
        borderWidth={0.5}
        borderColor="$outlineVariant"
        style={{ backgroundColor: uri ? undefined : tint15(hue) }}
      >
        {uri ? (
          <Image source={{ uri, width: d, height: d }} width={d} height={d} />
        ) : (
          <Text
            fontFamily="$heading"
            fontWeight="600"
            fontSize={size === "sm" ? 12 : size === "md" ? 14 : 16}
            style={{ color: hue }}
          >
            {initialsOf(name ?? "?")}
          </Text>
        )}
      </AvatarFrame>
      {showPip && <StatusPip status={status} />}
    </YStack>
  );
}

export { AvatarFrame, StatusPip };
