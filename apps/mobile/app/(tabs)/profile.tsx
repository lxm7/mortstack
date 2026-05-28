import { YStack, Text, Button } from "tamagui";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { authClient } from "@/lib/auth/client";

export default function Profile() {
  const { session, clearSession } = useAuthStore();

  async function handleSignOut() {
    await authClient.signOut();
    clearSession();
    router.replace("/(auth)/sign-in");
  }

  return (
    <YStack f={1} bg="$background" ai="center" jc="center" gap="$4">
      <Text color="$color" fontSize="$6">
        {session?.user?.name ?? "Profile"}
      </Text>
      <Text color="$colorHover" fontSize="$4">
        {session?.user?.email ?? ""}
      </Text>
      <Button onPress={() => router.push("/settings" as never)}>
        Settings
      </Button>
      <Button variant="outlined" onPress={handleSignOut}>
        Sign out
      </Button>
    </YStack>
  );
}
