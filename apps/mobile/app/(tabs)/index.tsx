import { Link } from "expo-router";
import { YStack, Text, Button } from "tamagui";

// Feed screen — populated via Replicache subscriptions in next iteration
export default function Feed() {
  return (
    <YStack f={1} bg="$background" ai="center" jc="center" gap="$3">
      <Text color="$color" fontSize="$6">
        Feed
      </Text>
      {__DEV__ ? (
        <Link href="/chat-db-debug" asChild>
          <Button size="$3">chat-db debug</Button>
        </Link>
      ) : null}
    </YStack>
  );
}
