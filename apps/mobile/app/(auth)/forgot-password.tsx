import { useState } from "react";
import { Feather } from "@expo/vector-icons";
import { Spinner, YStack, useTheme } from "tamagui";
import { Button } from "@repo/ui/glacier/button";
import { TextField } from "@repo/ui/glacier/text-field";
import { BodyMd, BodySm, Title } from "@repo/ui/glacier/typography";
import { authClient } from "@/lib/auth/client";
import { AuthShell, AuthFooter } from "@/lib/auth/ui";

export default function ForgotPassword() {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const iconColor = theme.onSurfaceVariant.val;

  async function handleRequestReset() {
    if (!email) return;
    setLoading(true);
    try {
      // Fire-and-forget. We show the confirmation regardless of the result so
      // the screen never signals whether an account exists (no user
      // enumeration). Works end-to-end once an email provider is wired
      // server-side (login/DESIGN.md — no sendResetPassword handler yet).
      await authClient.requestPasswordReset({ email });
    } catch {
      // swallowed — same confirmation either way
    } finally {
      setLoading(false);
      setSent(true);
    }
  }

  const footer = (
    <AuthFooter prompt="Remember it?" action="Sign In" href="/(auth)/sign-in" />
  );

  if (sent) {
    return (
      <AuthShell subtitle="We'll email you a reset link" footer={footer}>
        <YStack ai="center" gap="$sm" py="$sm">
          <Feather name="mail" size={40} color={theme.primary.val} />
          <Title>Check your inbox</Title>
          <BodySm color="$onSurfaceVariant" textAlign="center">
            If an account exists for {email}, a link to reset your password is
            on its way.
          </BodySm>
        </YStack>
      </AuthShell>
    );
  }

  return (
    <AuthShell subtitle="We'll email you a reset link" footer={footer}>
      <YStack gap="$sm">
        <BodyMd color="$onSurfaceVariant">
          Enter the email tied to your account to receive a reset link.
        </BodyMd>

        <TextField
          icon={<Feather name="mail" size={18} color={iconColor} />}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          inputMode="email"
          autoCapitalize="none"
          autoComplete="email"
          enterKeyHint="send"
          onSubmitEditing={handleRequestReset}
        />

        <Button
          size="lg"
          alignSelf="stretch"
          mt="$xs"
          onPress={handleRequestReset}
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
          Send Reset Link
        </Button>
      </YStack>
    </AuthShell>
  );
}
