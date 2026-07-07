// Three-dot typing pulse in an incoming-style bubble frame (chat/DESIGN.md
// §Typing): 1.2s staggered loop, dots in on-surface-variant. Respects
// prefers-reduced-motion — dots fade in place instead of bouncing.
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { YStack, useTheme } from "tamagui";

const DOT_COUNT = 3;
const PHASE_MS = 400;
const STAGGER_MS = 150;

function Dot({
  index,
  color,
  reduced,
}: {
  index: number;
  color: string;
  reduced: boolean;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      index * STAGGER_MS,
      withRepeat(
        withSequence(
          withTiming(1, { duration: PHASE_MS }),
          withTiming(0, { duration: PHASE_MS }),
        ),
        -1,
      ),
    );
    return () => cancelAnimation(progress);
  }, [index, progress]);

  const style = useAnimatedStyle(() => {
    const opacity = 0.35 + progress.value * 0.65;
    if (reduced) return { opacity };
    return { opacity, transform: [{ translateY: -3 * progress.value }] };
  });

  return (
    <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />
  );
}

export function TypingIndicator() {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const dotColor = theme.onSurfaceVariant?.val ?? "#3a494a";

  return (
    <YStack
      alignSelf="flex-start"
      marginHorizontal="$md"
      marginBottom="$xs"
      backgroundColor="$surface"
      borderWidth={0.5}
      borderColor="$outlineVariant"
      borderRadius="$lg"
      borderBottomLeftRadius={4}
      paddingHorizontal="$sm"
      paddingVertical={12}
    >
      <View style={styles.row}>
        {Array.from({ length: DOT_COUNT }, (_, i) => (
          <Dot key={i} index={i} color={dotColor} reduced={reduced} />
        ))}
      </View>
    </YStack>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 4, alignItems: "center" },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
