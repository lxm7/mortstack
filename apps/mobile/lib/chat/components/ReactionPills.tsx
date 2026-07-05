// Reaction pills folded under a message bubble. Groups a target's reactions by
// emoji with a count, tints the pill when it includes mine, and pops in with a
// spring on first mount (reduced-motion → no pop). Tapping a pill toggles my
// reaction with that emoji (add ⇆ del) via the screen's onToggle.
import { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Text, XStack } from "tamagui";

import type { Reaction } from "@repo/chat";

interface Grouped {
  emoji: string;
  count: number;
  mine: boolean;
  sending: boolean;
}

function groupByEmoji(
  reactions: Reaction[],
  myAuthUserId: string | null,
): Grouped[] {
  const map = new Map<string, Grouped>();
  for (const r of reactions) {
    const g = map.get(r.emoji) ?? {
      emoji: r.emoji,
      count: 0,
      mine: false,
      sending: false,
    };
    g.count += 1;
    if (r.senderAuthUserId === myAuthUserId) g.mine = true;
    if (r.status === "sending") g.sending = true;
    map.set(r.emoji, g);
  }
  return [...map.values()];
}

function Pill({
  group,
  reduced,
  onPress,
}: {
  group: Grouped;
  reduced: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      scale.value = 1;
      return;
    }
    scale.value = withSpring(1, { damping: 12, stiffness: 220 });
  }, [reduced, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <Pressable onPress={onPress}>
        <XStack
          alignItems="center"
          gap={3}
          paddingHorizontal={8}
          paddingVertical={3}
          borderRadius="$full"
          backgroundColor="$surfaceContainerLow"
          borderWidth={group.mine ? 1 : 0.5}
          borderColor={group.mine ? "$primary" : "$outlineVariant"}
          opacity={group.sending ? 0.6 : 1}
        >
          <Text fontSize={13}>{group.emoji}</Text>
          {group.count > 1 ? (
            <Text
              fontSize={12}
              color="$onSurfaceVariant"
              fontVariant={["tabular-nums"]}
            >
              {group.count}
            </Text>
          ) : null}
        </XStack>
      </Pressable>
    </Animated.View>
  );
}

export function ReactionPills({
  reactions,
  myAuthUserId,
  onToggle,
}: {
  reactions: Reaction[];
  myAuthUserId: string | null;
  onToggle: (emoji: string) => void;
}) {
  const reduced = useReducedMotion();
  const groups = groupByEmoji(reactions, myAuthUserId);
  if (groups.length === 0) return null;
  return (
    <>
      {groups.map((g) => (
        <Pill
          key={g.emoji}
          group={g}
          reduced={reduced}
          onPress={() => onToggle(g.emoji)}
        />
      ))}
    </>
  );
}
