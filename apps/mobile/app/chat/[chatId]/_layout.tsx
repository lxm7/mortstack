// Nested stack for a single chat: the thread (index) + info, plus the crypto
// inspector presented modally over the thread (crypto-inspector/DESIGN.md §4).
import { Stack } from "expo-router";

export default function ChatIdLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="inspect/[serverMsgId]"
        options={{ presentation: "modal" }}
      />
    </Stack>
  );
}
