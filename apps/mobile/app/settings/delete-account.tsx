// Delete account — App Store Guideline 5.1.1(v) + Play Store account-
// deletion policy compliance. Two-step flow: explain what gets deleted →
// require user to type "DELETE" → final confirmation → server cascade →
// local sign-out + nav to landing.
//
// The "DELETE" literal is also enforced server-side (account.deleteSelf
// input zod.literal). Defence in depth against accidental calls.

import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { Button, Input, Spinner, Text, View, XStack, YStack } from "tamagui";

import { trpc } from "@/lib/trpc/client";
import { authClient } from "@/lib/auth/client";
import { useAuthStore } from "@/store/auth";
import { clearSessionToken } from "@/lib/auth/session";

const DESTRUCTIVE = "#dc2626";

export default function DeleteAccountScreen() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = confirmText === "DELETE" && !busy;

  const onDelete = useCallback(() => {
    if (!canSubmit) return;
    Alert.alert(
      "Delete account permanently?",
      "This cannot be undone. All your messages, profile, posts, follows, and devices will be removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            setError(null);
            try {
              await trpc.account.deleteSelf.mutate({ confirmation: "DELETE" });
              // Best-effort local cleanup. The session is already invalid
              // server-side; signOut/clearSessionToken just tidy local
              // state. Failures here are non-fatal — we still nav away.
              try {
                await authClient.signOut();
              } catch {
                /* ignore — session already gone */
              }
              await clearSessionToken().catch(() => {});
              clearSession();
              router.replace("/(auth)/sign-in" as never);
            } catch (err) {
              setError(err instanceof Error ? err.message : String(err));
              setBusy(false);
            }
          },
        },
      ],
    );
  }, [canSubmit, clearSession, router]);

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
          Delete account
        </Text>
        <View width={60} />
      </XStack>

      <YStack px="$4" py="$3" gap="$4">
        <Text fontSize="$5" fontWeight="700" color={DESTRUCTIVE}>
          This cannot be undone.
        </Text>

        <YStack gap="$2">
          <Text fontSize="$3" fontWeight="600">
            What we delete immediately:
          </Text>
          <Text fontSize="$3" color="$placeholderColor">
            • Your profile, posts, comments, likes, and follows{"\n"}• Your chat
            membership (other members see you leave){"\n"}• Your devices, push
            tokens, and encryption keys{"\n"}• Your block list and any reports
            you filed
          </Text>
        </YStack>

        <YStack gap="$2">
          <Text fontSize="$3" fontWeight="600">
            What stays:
          </Text>
          <Text fontSize="$3" color="$placeholderColor">
            • Messages you sent in group chats — they remain encrypted on
            recipients’ devices; the server cannot read them and they will
            appear as “Unknown sender” once your account is gone.
          </Text>
        </YStack>

        <YStack gap="$2" pt="$2">
          <Text fontSize="$3" fontWeight="600">
            Type DELETE to confirm:
          </Text>
          <Input
            value={confirmText}
            onChangeText={setConfirmText}
            placeholder="DELETE"
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </YStack>

        {error && (
          <Text fontSize="$2" color={DESTRUCTIVE}>
            {error}
          </Text>
        )}

        <Button
          size="$4"
          disabled={!canSubmit}
          opacity={canSubmit ? 1 : 0.5}
          onPress={onDelete}
          style={{ backgroundColor: DESTRUCTIVE }}
        >
          {busy ? (
            <Spinner size="small" />
          ) : (
            <Text color="white" fontWeight="700">
              Delete my account
            </Text>
          )}
        </Button>
      </YStack>
    </YStack>
  );
}
