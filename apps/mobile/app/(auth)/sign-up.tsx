import { useState } from "react";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Spinner, YStack, useTheme } from "tamagui";
import { Button } from "@repo/ui/glacier/button";
import { TextField } from "@repo/ui/glacier/text-field";
import { BodySm } from "@repo/ui/glacier/typography";
import { useAuthStore, type Session } from "@/store/auth";
import { authClient } from "@/lib/auth/client";
import { AuthShell, AuthFooter } from "@/lib/auth/ui";

// Mirrors the server rule (services/api/src/lib/auth.ts minPasswordLength).
const MIN_PASSWORD = 8;

export default function SignUp() {
  const theme = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setSession = useAuthStore((s) => s.setSession);

  const iconColor = theme.onSurfaceVariant.val;
  const passwordTooShort =
    password.length > 0 && password.length < MIN_PASSWORD;

  async function handleSignUp() {
    if (!email || !password || !name) return;
    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await authClient.signUp.email({ email, password, name });
      if (result.error) throw new Error(result.error.message);
      setSession(result.data as Session | null);
      router.replace("/(tabs)");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      subtitle="Create your encrypted workspace"
      footer={
        <AuthFooter
          prompt="Already have an account?"
          action="Sign In"
          href="/(auth)/sign-in"
        />
      }
    >
      <YStack gap="$sm">
        <TextField
          icon={<Feather name="user" size={18} color={iconColor} />}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="name"
          enterKeyHint="next"
        />
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
          autoComplete="new-password"
          enterKeyHint="go"
          onSubmitEditing={handleSignUp}
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
          onPress={handleSignUp}
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
          Create Account
        </Button>
      </YStack>
    </AuthShell>
  );
}
