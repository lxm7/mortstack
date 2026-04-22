import { YStack, Text } from 'tamagui'

// Feed screen — populated via Replicache subscriptions in next iteration
export default function Feed() {
  return (
    <YStack f={1} bg="$background" ai="center" jc="center">
      <Text color="$color" fontSize="$6">
        Feed
      </Text>
    </YStack>
  )
}
