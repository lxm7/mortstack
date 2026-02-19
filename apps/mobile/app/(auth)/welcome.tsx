import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
      className="bg-background"
    >
      <View className="flex-1 px-4 pb-6 justify-between">
        {/* Header */}
        <View className="mt-8 gap-2">
          <Text className="text-foreground font-extrabold text-5xl leading-tight">
            The arts,{"\n"}on-chain.
          </Text>
          <Text className="text-foreground-subtle text-lg mt-2">
            Support artists. Collect performances.{"\n"}Own your culture.
          </Text>
        </View>

        {/* Actions */}
        <View className="gap-3">
          <TouchableOpacity
            className="bg-foreground rounded-xl py-4 items-center"
            onPress={() => router.push("/(auth)/connect-wallet")}
          >
            <Text className="text-background font-bold text-base">
              Connect Wallet
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center gap-3">
            <View className="flex-1 h-px bg-border" />
            <Text className="text-foreground-subtle text-xs">or</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          <TouchableOpacity
            className="border border-border rounded-xl py-4 items-center"
            onPress={() => router.push("/(auth)/sign-in")}
          >
            <Text className="text-foreground text-base">
              Sign in with Email
            </Text>
          </TouchableOpacity>

          <Text className="text-center text-foreground-subtle text-xs mt-2">
            By continuing you agree to our Terms of Service{"\n"}and Privacy
            Policy.
          </Text>
        </View>
      </View>
    </View>
  );
}
