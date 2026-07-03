// Glacier List Row (components/ListRow.md). [Avatar lg] [name + preview] [meta:
// time + badge/tick]. No separators by default — density comes from padding.
// Unread lifts weight + turns the timestamp $primary and shows a numbered Badge.
import type { ReactNode } from "react";
import { Text, XStack, YStack, styled } from "tamagui";

import { Avatar, type AvatarProps } from "./avatar";
import { Badge } from "./badge";

const RowFrame = styled(XStack, {
  name: "GlacierListRow",
  alignItems: "center",
  gap: "$sm",
  paddingHorizontal: "$sm",
  paddingVertical: 12,
  borderRadius: "$md",
  pressStyle: { backgroundColor: "$surfaceContainerLow" },
});

const RowTitle = styled(Text, {
  name: "RowTitle",
  fontFamily: "$body",
  fontSize: 15,
  lineHeight: 20,
  color: "$onSurface",
  numberOfLines: 1,
  variants: {
    unread: { true: { fontWeight: "600" }, false: { fontWeight: "500" } },
  } as const,
});

const RowPreview = styled(Text, {
  name: "RowPreview",
  fontFamily: "$body",
  fontSize: 14,
  lineHeight: 20,
  numberOfLines: 1,
  variants: {
    unread: {
      true: { color: "$onSurface", fontWeight: "500" },
      false: { color: "$onSurfaceVariant", fontWeight: "400" },
    },
    system: {
      true: { fontStyle: "italic", color: "$outline", fontWeight: "500" },
    },
  } as const,
});

const RowTimestamp = styled(Text, {
  name: "RowTimestamp",
  fontFamily: "$body",
  fontSize: 12,
  lineHeight: 16,
  letterSpacing: 0.96,
  textTransform: "uppercase",
  fontVariant: ["tabular-nums"],
  variants: {
    unread: {
      true: { color: "$primary", fontWeight: "600" },
      false: { color: "$onSurfaceVariant", fontWeight: "500" },
    },
  } as const,
});

export interface ListRowProps {
  name: string;
  preview: string;
  timestamp: string;
  unread?: boolean;
  unreadCount?: number;
  /** System/status row (e.g. "You're now an admin") — italic preview, no meta. */
  system?: boolean;
  /** Read-receipt tick node (read 1:1 only; screen owns the icon). */
  receipt?: ReactNode;
  avatar?: Omit<AvatarProps, "size">;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function ListRow({
  name,
  preview,
  timestamp,
  unread,
  unreadCount = 0,
  system,
  receipt,
  avatar,
  onPress,
  onLongPress,
}: ListRowProps) {
  return (
    <RowFrame onPress={onPress} onLongPress={onLongPress}>
      <Avatar size="lg" name={name} {...avatar} />

      <YStack flex={1} minWidth={0} gap={2}>
        <RowTitle unread={unread}>{name}</RowTitle>
        <RowPreview unread={unread} system={system}>
          {preview}
        </RowPreview>
      </YStack>

      <YStack alignItems="flex-end" gap={6} minWidth={44}>
        <RowTimestamp unread={unread}>{timestamp}</RowTimestamp>
        {system ? null : unread && unreadCount > 0 ? (
          <Badge count={unreadCount} />
        ) : (
          receipt
        )}
      </YStack>
    </RowFrame>
  );
}

export { RowFrame, RowTitle, RowPreview, RowTimestamp };
