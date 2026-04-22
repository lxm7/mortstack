import { Tabs } from 'expo-router'
import { Text } from 'tamagui'

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text fontSize="$2" color={focused ? '$brand' : '$placeholderColor'} mt="$1">
      {label}
    </Text>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: undefined,
        tabBarInactiveTintColor: undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ focused }) => <TabIcon label="Feed" focused={focused} />,
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="gigs"
        options={{
          title: 'Gigs',
          tabBarIcon: ({ focused }) => <TabIcon label="Gigs" focused={focused} />,
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Post',
          tabBarIcon: ({ focused }) => <TabIcon label="+" focused={focused} />,
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon label="Me" focused={focused} />,
          tabBarShowLabel: false,
        }}
      />
    </Tabs>
  )
}
