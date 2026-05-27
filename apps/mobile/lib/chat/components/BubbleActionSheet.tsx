// Bottom-sheet action menu for own message bubbles. Currently only opens
// for failed sends — Retry requeues the outbox row + flips status back to
// "sending"; Delete drops the row + removes the bubble from the in-memory
// thread. Sent + sending states have no actionable options yet (edit /
// delete-sent are post-MVP).

import { Button, Sheet, Text, YStack } from "tamagui";

import type { Message } from "@repo/chat";

export interface BubbleActionSheetProps {
  message: Message | null;
  onClose: () => void;
  onRetry: (message: Message) => void;
  onDelete: (message: Message) => void;
}

export function BubbleActionSheet({
  message,
  onClose,
  onRetry,
  onDelete,
}: BubbleActionSheetProps) {
  const open = message?.status === "failed";

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
      </Sheet.Frame>
    </Sheet>
  );
}
