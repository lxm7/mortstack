import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BadgeCheck, Wallet, ShieldCheck } from "lucide-react-native";
import { useRouter } from "expo-router";
import { api } from "@repo/api";
import { useAuthStore } from "../../store/auth";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const insets = useSafeAreaInsets();

  const { data: profile } = api.user.getProfile.useQuery(
    { userId: user?.id },
    { enabled: !!user?.id },
  );

  const handleSignOut = async () => {
    await clearAuth();
    router.replace("/(auth)/welcome");
  };

  if (!profile) return null;

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-background">
      <ScrollView>
        <View className="px-4 py-6 gap-5">
          {/* Avatar + name */}
          <View className="flex-row items-center gap-4">
            <View
              className="w-18 h-18 rounded-full bg-background-soft items-center justify-center"
              style={{ width: 72, height: 72, borderRadius: 36 }}
            >
              <Text className="text-foreground font-bold text-3xl">
                {profile.username[0]?.toUpperCase() ?? "?"}
              </Text>
            </View>
            <View className="gap-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-foreground font-bold text-xl">
                  @{profile.username}
                </Text>
                {profile.isVerified && <BadgeCheck size={18} color="#60A5FA" />}
              </View>
              {profile.bio && (
                <Text className="text-foreground-subtle text-sm">
                  {profile.bio}
                </Text>
              )}
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row justify-around bg-background-soft rounded-xl py-4">
            <View className="items-center gap-1">
              <Text className="text-foreground font-bold text-xl">
                {profile._count.posts}
              </Text>
              <Text className="text-foreground-subtle text-xs">Posts</Text>
            </View>
            <View className="w-px bg-border" />
            <View className="items-center gap-1">
              <Text className="text-foreground font-bold text-xl">
                {profile._count.followers}
              </Text>
              <Text className="text-foreground-subtle text-xs">Followers</Text>
            </View>
            <View className="w-px bg-border" />
            <View className="items-center gap-1">
              <Text className="text-foreground font-bold text-xl">
                {profile._count.follows}
              </Text>
              <Text className="text-foreground-subtle text-xs">Following</Text>
            </View>
          </View>

          {/* Identity tier */}
          <View className="bg-background-soft rounded-xl p-4 gap-3">
            <View className="flex-row items-center gap-2">
              <ShieldCheck size={18} color="#60A5FA" />
              <Text className="text-foreground font-semibold">Identity</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground-subtle text-sm">
                Tier: {user?.identityTier ?? "NONE"}
              </Text>
              {user?.identityTier === "NONE" && (
                <TouchableOpacity className="border border-border rounded-lg px-3 py-1.5">
                  <Text className="text-foreground text-sm">Verify</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Wallet */}
          {user?.walletAddress && (
            <View className="bg-background-soft rounded-xl p-4 gap-2">
              <View className="flex-row items-center gap-2">
                <Wallet size={18} color="#888888" />
                <Text className="text-foreground font-semibold">Wallet</Text>
              </View>
              <Text className="text-foreground-subtle text-xs font-mono">
                {user.walletAddress.slice(0, 16)}...
                {user.walletAddress.slice(-8)}
              </Text>
            </View>
          )}

          <TouchableOpacity
            className="border border-border rounded-xl py-4 items-center mt-4"
            onPress={handleSignOut}
          >
            <Text className="text-foreground-subtle text-base">Sign out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
