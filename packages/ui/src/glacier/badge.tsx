// Glacier unread-count Badge (components/Badge.md). Numbered, not a bare dot.
// Circular for 1–2 digits, pill for "99+". Distinct from the avatar presence
// pip — this answers "how many unread", the pip answers "are they online".
import { Text, YStack, styled } from "tamagui";

const CountBadge = styled(YStack, {
  name: "GlacierCountBadge",
  minWidth: 19,
  height: 19,
  paddingHorizontal: 4,
  borderRadius: "$full",
  backgroundColor: "$primary",
  alignItems: "center",
  justifyContent: "center",
});

const CountBadgeText = styled(Text, {
  name: "GlacierCountBadgeText",
  fontFamily: "$body",
  fontWeight: "600",
  fontSize: 10,
  lineHeight: 12,
  color: "$onPrimary",
  fontVariant: ["tabular-nums"],
});

export interface BadgeProps {
  count: number;
}

export function Badge({ count }: BadgeProps) {
  if (count <= 0) return null;
  return (
    <CountBadge>
      <CountBadgeText>{count > 99 ? "99+" : count}</CountBadgeText>
    </CountBadge>
  );
}

export { CountBadge, CountBadgeText };
