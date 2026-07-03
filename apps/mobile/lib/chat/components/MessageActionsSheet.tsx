// Long-press context menu for a message bubble (chat/DESIGN.md §Long-press).
// Everyday actions (Copy · Delete/Report · Retry-on-failed) sit above a hairline;
// the advanced "Inspect encryption" entry sits below it and opens the crypto
// inspector for THIS message. Inspect is demo-gated (__DEV__ / demo flag).
import { Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Separator, Sheet, XStack, useTheme } from "tamagui";

import type { Message } from "@repo/chat";
import { Label } from "@repo/ui/glacier/typography";

const INSPECTOR_ENABLED =
  __DEV__ || process.env.EXPO_PUBLIC_DEMO_CRYPTO_INSPECTOR === "1";

export interface MessageActionsSheetProps {
  message: Message | null;
  isMine: boolean;
  onClose: () => void;
  onDelete: (message: Message) => void;
  onRetry: (message: Message) => void;
  onReport: (message: Message, reason: "SPAM" | "HARASSMENT" | "OTHER") => void;
  onInspect: (message: Message) => void;
}

function MenuItem({
  icon,
  label,
  danger,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <XStack
      alignItems="center"
      gap="$sm"
      height={52}
      paddingHorizontal="$sm"
      borderRadius="$md"
      pressStyle={{ backgroundColor: "$surfaceContainerLow" }}
      onPress={onPress}
    >
      {icon}
      <Label color={danger ? "$error" : "$onSurface"} fontSize={15}>
        {label}
      </Label>
    </XStack>
  );
}

export function MessageActionsSheet({
  message,
  isMine,
  onClose,
  onDelete,
  onRetry,
  onReport,
  onInspect,
}: MessageActionsSheetProps) {
  const theme = useTheme();
  const open = message !== null;
  const isFailed = message?.status === "failed";
  const ink = theme.onSurface?.val;
  const err = theme.error?.val;
  const primary = theme.primary?.val;

  const handleCopy = async () => {
    if (message) {
      await Clipboard.setStringAsync(message.text);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };

  const handleReport = () => {
    if (!message) return;
    Alert.alert(
      "Report this message?",
      "We'll review within 24 hours. Choose a reason:",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Spam", onPress: () => onReport(message, "SPAM") },
        { text: "Harassment", onPress: () => onReport(message, "HARASSMENT") },
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
      <Sheet.Overlay opacity={0.4} />
      <Sheet.Frame
        backgroundColor="$surface"
        borderTopLeftRadius="$lg"
        borderTopRightRadius="$lg"
        padding="$sm"
        paddingBottom="$md"
        gap="$base"
      >
        <Sheet.Handle backgroundColor="$outlineVariant" />

        <MenuItem
          icon={<Feather name="copy" size={20} color={ink} />}
          label="Copy"
          onPress={handleCopy}
        />

        {isMine && isFailed ? (
          <MenuItem
            icon={<Feather name="refresh-cw" size={20} color={ink} />}
            label="Retry"
            onPress={() => {
              if (message) onRetry(message);
              onClose();
            }}
          />
        ) : null}

        {isMine ? (
          <MenuItem
            icon={<Feather name="trash-2" size={20} color={err} />}
            label="Delete"
            danger
            onPress={() => {
              if (message) onDelete(message);
              onClose();
            }}
          />
        ) : (
          <MenuItem
            icon={<Feather name="flag" size={20} color={ink} />}
            label="Report"
            onPress={handleReport}
          />
        )}

        {INSPECTOR_ENABLED ? (
          <>
            <Separator marginVertical="$base" borderColor="$outlineVariant" />
            <MenuItem
              icon={
                <MaterialCommunityIcons
                  name="shield-search"
                  size={20}
                  color={primary}
                />
              }
              label="Inspect encryption"
              onPress={() => {
                if (message) onInspect(message);
                onClose();
              }}
            />
          </>
        ) : null}
      </Sheet.Frame>
    </Sheet>
  );
}
