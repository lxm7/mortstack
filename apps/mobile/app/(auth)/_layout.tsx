import { Stack } from "expo-router";
import { useAuthStore } from "../../store/auth";
import { Redirect } from "expo-router";

export default function AuthLayout() {
  const user = useAuthStore((s) => s.user);

  // If already logged in, redirect to main app
  if (user) return <Redirect href="/(tabs)/feed" />;

  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="connect-wallet" />
    </Stack>
  );
}
