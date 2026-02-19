import { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@repo/api";
import { useWallet } from "../../hooks/useWallet";
import { useAuthStore } from "../../store/auth";

function generateNonceMessage(nonce: string): string {
  return `Sign this message to authenticate with the app.\n\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;
}

export default function ConnectWalletScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { address, isLoading: walletLoading, createWallet, sign } = useWallet();
  const insets = useSafeAreaInsets();
  const [error, setError] = useState("");

  const getNonce = api.auth.getNonce.useMutation();
  const signInWithWallet = api.auth.signInWithWallet.useMutation({
    onSuccess: async (data) => {
      await setAuth(
        {
          id: data.user.id,
          username: data.user.username,
          avatar: data.user.avatar ?? null,
          walletAddress: data.user.walletAddress ?? null,
          identityTier: "NONE",
        },
        data.accessToken,
        data.refreshToken,
      );
      router.replace("/(tabs)/feed");
    },
    onError: (err) => setError(err.message),
  });

  const handleConnect = async () => {
    try {
      setError("");
      const walletAddress = address ?? (await createWallet());

      const { nonce } = await getNonce.mutateAsync({ walletAddress });
      const message = generateNonceMessage(nonce);
      const signature = await sign(message);

      await signInWithWallet.mutateAsync({ walletAddress, signature, message });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Connection failed");
    }
  };

  const isPending =
    walletLoading || getNonce.isPending || signInWithWallet.isPending;

  return (
    <View
      style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
      className="bg-background"
    >
      <View className="flex-1 px-4 pt-4 pb-6 justify-between">
        <View className="gap-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-foreground-subtle text-base">← Back</Text>
          </TouchableOpacity>

          <View className="mt-4 gap-2">
            <Text className="text-foreground font-bold text-2xl">
              Connect Wallet
            </Text>
            <Text className="text-foreground-subtle">
              Your wallet is your identity.{"\n"}
              No password needed — just your signature.
            </Text>
          </View>

          {address && (
            <View className="bg-background-soft rounded-xl p-4 gap-1">
              <Text className="text-foreground-subtle text-xs">
                Your wallet address
              </Text>
              <Text className="text-foreground text-sm font-mono">
                {address.slice(0, 12)}...{address.slice(-8)}
              </Text>
            </View>
          )}

          {error ? <Text className="text-red-500 text-sm">{error}</Text> : null}
        </View>

        <View className="gap-3">
          <TouchableOpacity
            className="bg-foreground rounded-xl py-4 items-center flex-row justify-center gap-2"
            style={{ opacity: isPending ? 0.6 : 1 }}
            onPress={handleConnect}
            disabled={isPending}
          >
            {isPending && <ActivityIndicator color="#0A0A0A" size="small" />}
            <Text className="text-background font-bold text-base">
              {isPending
                ? "Connecting..."
                : address
                  ? "Sign in with Wallet"
                  : "Create Wallet & Sign in"}
            </Text>
          </TouchableOpacity>

          <Text className="text-center text-foreground-subtle text-xs">
            A new SUI wallet will be created and stored{"\n"}
            securely on your device.
          </Text>
        </View>
      </View>
    </View>
  );
}
