import { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@repo/api";
import { useAuthStore } from "../../store/auth";

export default function SignInScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const insets = useSafeAreaInsets();
  const [error, setError] = useState("");

  const signIn = api.auth.signIn.useMutation({
    onSuccess: async (data) => {
      await setAuth(
        {
          id: data.user.id,
          username: data.user.username,
          avatar: null,
          walletAddress: null,
          identityTier: "NONE",
        },
        data.accessToken,
        data.refreshToken,
      );
      router.replace("/(tabs)/feed");
    },
    onError: (err) => setError(err.message),
  });

  return (
    <View
      style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
      className="bg-background"
    >
      <View className="flex-1 px-4 pt-4">
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-foreground-subtle text-base">← Back</Text>
        </TouchableOpacity>

        <View className="mt-6 gap-2">
          <Text className="text-foreground font-bold text-2xl">Sign in</Text>
          <Text className="text-foreground-subtle">Welcome back.</Text>
        </View>

        <View className="mt-6 gap-3">
          <TextInput
            className="bg-background-soft border border-border rounded-xl px-4 py-3 text-foreground text-base"
            placeholder="Email"
            placeholderTextColor="#888888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            className="bg-background-soft border border-border rounded-xl px-4 py-3 text-foreground text-base"
            placeholder="Password"
            placeholderTextColor="#888888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? <Text className="text-red-500 text-sm">{error}</Text> : null}

          <TouchableOpacity
            className="bg-foreground rounded-xl py-4 items-center mt-2"
            style={{
              opacity: signIn.isPending || !email || !password ? 0.6 : 1,
            }}
            onPress={() => signIn.mutate({ email, password })}
            disabled={signIn.isPending || !email || !password}
          >
            <Text className="text-background font-bold text-base">
              {signIn.isPending ? "Signing in..." : "Sign in"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
