import { Redirect } from "expo-router";
import { useAuthStore } from "../store/auth";

// Root redirect - send to feed if logged in, else to welcome screen
export default function Index() {
  const user = useAuthStore((s) => s.user);
  return <Redirect href={user ? "/(tabs)/feed" : "/(auth)/welcome"} />;
}
