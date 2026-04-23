import { useState } from "react";
import { router } from "expo-router";
import { YStack, Text, Button, Input, Spinner } from "tamagui";
import { useAuthStore, type Session } from "@/store/auth";
import { authClient } from "@/lib/auth/client";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setSession = useAuthStore((s) => s.setSession);

  async function handleSignUp() {
    if (!email || !password || !name) return;
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
    <YStack f={1} bg="$background" px="$4" jc="center" gap="$4">
      <YStack gap="$1">
        <Text
          fontFamily="$heading"
          fontSize="$8"
          fontWeight="700"
          color="$color"
        >
          Create account
        </Text>
        <Text color="$colorHover" fontSize="$5">
          Join the Sessions network
        </Text>
      </YStack>

      <YStack gap="$3" mt="$4">
        <Input
          placeholder="Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          size="$5"
        />
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          size="$5"
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          size="$5"
        />

        {error && (
          <Text color="$error" fontSize="$3">
            {error}
          </Text>
        )}

        <Button
          size="$5"
          bg="$brand"
          // @ts-expect-error -- color is in ButtonContext but not yet in exported prop type (Tamagui RC)
          color="$brandText"
          onPress={handleSignUp}
          disabled={loading}
          icon={loading ? <Spinner /> : undefined}
        >
          Create account
        </Button>

        <Button
          size="$4"
          variant="outlined"
          onPress={() => router.back()}
          disabled={loading}
        >
          Back to sign in
        </Button>
      </YStack>
    </YStack>
  );
}
