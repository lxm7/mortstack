import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Spinner, YStack, useTheme } from "tamagui";
import { Button } from "@repo/ui/glacier/button";
import { TextField } from "@repo/ui/glacier/text-field";
import { BodyMd, BodySm, Title } from "@repo/ui/glacier/typography";
import { authClient } from "@/lib/auth/client";
import { AuthShell, AuthFooter } from "@/lib/auth/ui";

// Mirrors the server rule (services/api/src/lib/auth.ts minPasswordLength).
const MIN_PASSWORD = 8;

export default function ResetPassword() {
  const theme = useTheme();
  // Deep link: mortstack-chatapp://reset-password?token=…
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const iconColor = theme.onSurfaceVariant.val;
  const passwordTooShort =
    password.length > 0 && password.length < MIN_PASSWORD;

  async function handleReset() {
    if (!token) {
      setError("This reset link is invalid or has expired.");
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (result.error) throw new Error(result.error.message);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  const footer = (
    <AuthFooter
      prompt="Remembered it?"
      action="Sign In"
      href="/(auth)/sign-in"
    />
  );

  if (done) {
    return (
      <AuthShell subtitle="Password updated" footer={footer}>
        <YStack ai="center" gap="$sm" py="$sm">
          <Feather name="check-circle" size={40} color={theme.primary.val} />
          <Title>All set</Title>
          <BodySm color="$onSurfaceVariant" textAlign="center">
            Your password has been reset. Sign in with your new password.
          </BodySm>
          <Button
            size="lg"
            alignSelf="stretch"
            mt="$sm"
            onPress={() => router.replace("/(auth)/sign-in")}
          >
            Go to Sign In
          </Button>
        </YStack>
      </AuthShell>
    );
  }

  return (
    <AuthShell subtitle="Choose a new password" footer={footer}>
      <YStack gap="$sm">
        <BodyMd color="$onSurfaceVariant">
          Enter a new password for your account.
        </BodyMd>

        <TextField
          icon={<Feather name="lock" size={18} color={iconColor} />}
          placeholder="New Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          enterKeyHint="go"
          onSubmitEditing={handleReset}
          error={!!error || passwordTooShort}
        />

        {(error || passwordTooShort) && (
          <BodySm color="$error">
            {error ?? `Password must be at least ${MIN_PASSWORD} characters`}
          </BodySm>
        )}

        <Button
          size="lg"
          alignSelf="stretch"
          mt="$xs"
          onPress={handleReset}
          disabled={loading}
          icon={loading ? <Spinner color="$onPrimary" /> : undefined}
          iconAfter={
            loading ? undefined : (
              <Feather
                name="arrow-right"
                size={18}
                color={theme.onPrimary.val}
              />
            )
          }
        >
          Reset Password
        </Button>
      </YStack>
    </AuthShell>
  );
}
