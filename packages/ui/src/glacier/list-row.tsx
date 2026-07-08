// Glacier List Row (components/ListRow.md). [Avatar lg] [name + preview] [meta:
// time + badge/tick]. No separators by default — density comes from padding.
// Unread lifts weight + turns the timestamp $primary and shows a numbered Badge.
import type { ReactNode } from "react";
import { Text, XStack, YStack, styled } from "tamagui";

import { Avatar, type AvatarProps } from "./avatar";
import { Badge } from "./badge";
import { Meta } from "./typography";

const RowFrame = styled(XStack, {
  name: "GlacierListRow",
  accessibilityRole: "button",
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
  fontSize: 16, // body-md (was off-scale 15) — THEME §3.1
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

// Composes the Meta preset (THEME §3.1 meta: 12/16/500, uppercase, tabular) —
// only the unread emphasis (primary + 600) differs.
const RowTimestamp = styled(Meta, {
  name: "RowTimestamp",
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
  /** E2E anchor forwarded to the row frame. */
  testID?: string;
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
  testID,
}: ListRowProps) {
  return (
    <RowFrame testID={testID} onPress={onPress} onLongPress={onLongPress}>
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
