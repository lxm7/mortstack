import { Tabs, Redirect } from "expo-router";
import { useAuthStore } from "../../store/auth";
import { Home, Search, PlusSquare, Bell, User } from "lucide-react-native";

export default function TabLayout() {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Redirect href="/(auth)/welcome" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0A0A0A",
          borderTopColor: "#222222",
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: "#F0F0F0",
        tabBarInactiveTintColor: "#555555",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          tabBarAccessibilityLabel: "Feed",
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
          tabBarAccessibilityLabel: "Discover",
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ color, size }) => (
            <PlusSquare color={color} size={size} />
          ),
          tabBarAccessibilityLabel: "Create",
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
          tabBarAccessibilityLabel: "Notifications",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          tabBarAccessibilityLabel: "Profile",
        }}
      />
    </Tabs>
  );
}
