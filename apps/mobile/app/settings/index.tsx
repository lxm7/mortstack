// Settings hub — entry point for compliance + privacy controls. App Store
// Guideline 5.1.1(v) requires account deletion to be reachable inside the
// app; this screen + delete-account.tsx satisfy that. Blocked accounts
// management satisfies Guideline 1.2 (UGC).

import { useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { Button, Switch, Text, View, XStack, YStack } from "tamagui";

import { useSettingsStore } from "@/store/settings";

export default function SettingsScreen() {
  const router = useRouter();
  const readReceipts = useSettingsStore((s) => s.readReceipts);
  const setReadReceipts = useSettingsStore((s) => s.setReadReceipts);

  return (
    <YStack flex={1} backgroundColor="$background">
      <XStack
        px="$3"
        py="$3"
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth={1}
        borderColor="$borderColor"
      >
        <Button size="$2" chromeless onPress={() => router.back()}>
          ‹ Back
        </Button>
        <Text fontSize="$5" fontWeight="700">
          Settings
        </Text>
        <View width={60} />
      </XStack>

      <YStack px="$4" py="$3" gap="$2">
        <Text fontSize="$2" color="$placeholderColor" pt="$2">
          PRIVACY
        </Text>
        <SettingsRow
          label="Blocked accounts"
          onPress={() => router.push("/settings/blocks" as never)}
        />
        {/* Symmetric: off = we send no receipts AND hide peers' (see the thread
            screen's read-tick + useReadEmitter gating). */}
        <SettingsToggleRow
          label="Read receipts"
          value={readReceipts}
          onValueChange={setReadReceipts}
        />

        <Text fontSize="$2" color="$placeholderColor" pt="$4">
          ACCOUNT
        </Text>
        <SettingsRow
          label="Delete account"
          color="$error"
          onPress={() => router.push("/settings/delete-account" as never)}
        />
      </YStack>
    </YStack>
  );
}

function SettingsRow({
  label,
  color,
  onPress,
}: {
  label: string;
  color?: ComponentProps<typeof Text>["color"];
  onPress: () => void;
}) {
  return (
    <Button
      chromeless
      onPress={onPress}
      justifyContent="space-between"
      px="$3"
      py="$3"
      borderBottomWidth={1}
      borderColor="$borderColor"
    >
      <Text fontSize="$4" color={color ?? "$color"}>
        {label}
      </Text>
      <Text fontSize="$4" color="$placeholderColor">
        ›
      </Text>
    </Button>
  );
}

function SettingsToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  return (
    <XStack
      justifyContent="space-between"
      alignItems="center"
      px="$3"
      py="$3"
      borderBottomWidth={1}
      borderColor="$borderColor"
    >
      <Text fontSize="$4" color="$color">
        {label}
      </Text>
      <Switch size="$3" checked={value} onCheckedChange={onValueChange}>
        <Switch.Thumb />
      </Switch>
    </XStack>
  );
}
