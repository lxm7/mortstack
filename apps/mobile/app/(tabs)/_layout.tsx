// Chat-only app: no tab bar. The chat-list screen owns a single "New Chat"
// bottom action bar instead (chat-list/DESIGN.md 2.1.0 — the 5-icon tab bar and
// Stories row were cut). This group is now just a headerless Stack whose index
// is the conversations list.
import { Stack } from "expo-router";

export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
