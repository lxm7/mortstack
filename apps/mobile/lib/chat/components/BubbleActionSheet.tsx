// Bottom-sheet action menu for message bubbles. Two modes:
//   - Own bubble in status="failed" → Retry + Delete (Plan 1 retry path).
//   - Other user's bubble → Report message (App Store Guideline 1.2).
// Own bubbles in status "sending" / "sent" don't open a sheet (edit /
// delete-sent are post-MVP).

import { Alert } from "react-native";
import { Button, Sheet, Text, YStack } from "tamagui";

import type { Message } from "@repo/chat";

export interface BubbleActionSheetProps {
  message: Message | null;
  isMine: boolean;
  onClose: () => void;
  onRetry: (message: Message) => void;
  onDelete: (message: Message) => void;
  onReport: (message: Message, reason: "SPAM" | "HARASSMENT" | "OTHER") => void;
}

export function BubbleActionSheet({
  message,
  isMine,
  onClose,
  onRetry,
  onDelete,
  onReport,
}: BubbleActionSheetProps) {
  const ownFailed = isMine && message?.status === "failed";
  const otherMode = !isMine && !!message;
  const open = ownFailed || otherMode;

  const handleReport = () => {
    if (!message) return;
    Alert.alert(
      "Report this message?",
      "We'll review within 24 hours. Choose a reason:",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Spam", onPress: () => onReport(message, "SPAM") },
        {
          text: "Harassment",
          onPress: () => onReport(message, "HARASSMENT"),
        },
        { text: "Other", onPress: () => onReport(message, "OTHER") },
      ],
    );
    onClose();
  };

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={(next: boolean) => {
        if (!next) onClose();
      }}
      dismissOnSnapToBottom
      snapPointsMode="fit"
    >
      <Sheet.Overlay />
      <Sheet.Frame padding="$4" gap="$3">
        <Sheet.Handle />
        {ownFailed ? (
          <>
            <Text fontSize="$5" fontWeight="700">
              Message failed to send
            </Text>
            <Text fontSize="$2" color="$placeholderColor">
              The server didn't accept this message after several attempts.
            </Text>
            <YStack gap="$2" pt="$2">
              <Button
                onPress={() => {
                  if (message) onRetry(message);
                  onClose();
                }}
              >
                Retry
              </Button>
              <Button
                chromeless
                onPress={() => {
                  if (message) onDelete(message);
                  onClose();
                }}
              >
                <Text color="#d33">Delete</Text>
              </Button>
              <Button chromeless onPress={onClose}>
                Cancel
              </Button>
            </YStack>
          </>
        ) : (
          <>
            <Text fontSize="$5" fontWeight="700">
              Message actions
            </Text>
            <YStack gap="$2" pt="$2">
              <Button chromeless onPress={handleReport}>
                <Text color="#d33">Report message</Text>
              </Button>
              <Button chromeless onPress={onClose}>
                Cancel
              </Button>
            </YStack>
          </>
        )}
      </Sheet.Frame>
    </Sheet>
  );
}
