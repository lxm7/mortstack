// Chat message bubble — handles the three lifecycle states the store
// exposes (sending / sent / failed) with distinct visual cues + a
// long-press hook that opens BubbleActionSheet for retry/delete/copy.
//
// Extracted from chat/[chatId]/index.tsx so action handling stays out of
// the screen file's render path.

import { useCallback } from "react";
import { Pressable } from "react-native";
import { Text, XStack, YStack } from "tamagui";

import type { Member, Message } from "@repo/chat";

function formatTime(ms: number): string {
  const d = new Date(ms);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

function statusIcon(status: Message["status"]): string {
  if (status === "sending") return "⌛";
  if (status === "failed") return "⚠︎";
  return "✓";
}

export interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  isGroup: boolean;
  sender: Member | null;
  // Fires when the user long-presses an own bubble. Caller opens the
  // action sheet — kept as a prop (rather than the bubble owning the
  // sheet) so a single sheet instance can be shared across the list and
  // animated independently of any single row.
  onLongPress?: (message: Message) => void;
}

export function MessageBubble({
  message,
  isMine,
  isGroup,
  sender,
  onLongPress,
}: MessageBubbleProps) {
  const handleLongPress = useCallback(() => {
    if (!isMine) return;
    onLongPress?.(message);
  }, [isMine, message, onLongPress]);

  const isPending = message.status === "sending";
  const isFailed = message.status === "failed";

  // Visual deltas:
  //   pending → 60% opacity so the bubble reads as not-yet-confirmed
  //   failed  → 2px red left border + footer "Failed to send" label
  //   sent    → full opacity, no extra chrome
  return (
    <XStack px="$3" py="$1" justifyContent={isMine ? "flex-end" : "flex-start"}>
      <Pressable onLongPress={handleLongPress} delayLongPress={300}>
        <YStack
          maxWidth={320}
          backgroundColor={isMine ? "$brand" : "$backgroundHover"}
          px="$3"
          py="$2"
          borderRadius="$4"
          gap="$1"
          opacity={isPending ? 0.6 : 1}
          borderLeftWidth={isFailed ? 2 : 0}
          borderLeftColor={isFailed ? "#d33" : undefined}
        >
          {!isMine && isGroup && (
            <Text fontSize="$1" color="$placeholderColor" fontWeight="600">
              {sender?.handle ?? sender?.displayName ?? "Unknown"}
            </Text>
          )}
          <Text color={isMine ? "white" : "$color"} fontSize="$4">
            {message.text}
          </Text>
          <XStack justifyContent="flex-end" gap="$1" alignItems="center">
            <Text
              fontSize="$1"
              color={isMine ? "rgba(255,255,255,0.7)" : "$placeholderColor"}
            >
              {formatTime(message.createdAt)}
            </Text>
            {isMine && (
              <Text
                fontSize="$1"
                color={isFailed ? "#ffd1d1" : "rgba(255,255,255,0.85)"}
              >
                {statusIcon(message.status)}
              </Text>
            )}
          </XStack>
          {isMine && isFailed && (
            <Text fontSize="$1" color="#ffd1d1" fontStyle="italic">
              Failed to send · long-press to retry
            </Text>
          )}
        </YStack>
      </Pressable>
    </XStack>
  );
}
