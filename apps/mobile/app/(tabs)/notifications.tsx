import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell } from "lucide-react-native";

// Notifications will be driven by a Notification model + push tokens (Phase 6).
// Placeholder until that schema + router are built.
export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-background">
      <View className="flex-1 items-center justify-center gap-3">
        <Bell size={40} color="#333333" />
        <Text className="text-foreground-subtle text-base">
          Notifications coming soon.
        </Text>
      </View>
    </View>
  );
}
