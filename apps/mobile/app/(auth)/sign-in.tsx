import { useState } from "react";
import { router, Link } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Spinner, XStack, YStack, useTheme } from "tamagui";
import { Button } from "@repo/ui/glacier/button";
import { TextField } from "@repo/ui/glacier/text-field";
import { BodySm, Meta } from "@repo/ui/glacier/typography";
import { useAuthStore } from "@/store/auth";
import { authClient } from "@/lib/auth/client";
import { AuthShell, AuthFooter } from "@/lib/auth/ui";

export default function SignIn() {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setSession = useAuthStore((s) => s.setSession);

  const iconColor = theme.onSurfaceVariant.val;

  async function handleEmailSignIn() {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) throw new Error(result.error.message);
      setSession(result.data);
      router.replace("/(tabs)");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      subtitle="Sign in to your encrypted workspace"
      footer={
        <AuthFooter
          prompt="Don't have an account?"
          action="Sign Up"
          href="/(auth)/sign-up"
        />
      }
    >
      <YStack gap="$sm">
        <TextField
          icon={<Feather name="mail" size={18} color={iconColor} />}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          inputMode="email"
          autoCapitalize="none"
          autoComplete="email"
          enterKeyHint="next"
          error={!!error}
        />
        <TextField
          icon={<Feather name="lock" size={18} color={iconColor} />}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          enterKeyHint="go"
          onSubmitEditing={handleEmailSignIn}
          error={!!error}
        />

        <XStack jc="flex-end">
          <Link href="/(auth)/forgot-password" asChild>
            <Meta color="$primary">Forgot Password?</Meta>
          </Link>
        </XStack>

        {error && <BodySm color="$error">{error}</BodySm>}

        <Button
          size="lg"
          alignSelf="stretch"
          mt="$xs"
          onPress={handleEmailSignIn}
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
          Login
        </Button>
      </YStack>
    </AuthShell>
  );
}
