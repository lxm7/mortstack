// Glacier Chat Bubble (components/ChatBubble.md). Incoming = flat surface + thin
// border, tail bottom-left. Outgoing = ice→violet diagonal gradient, tail
// bottom-right, soft glow. Timestamp + read-receipt sit BELOW the bubble, never
// inside. Presentational only — the screen wraps it in a Pressable for
// long-press (→ the crypto inspector).
import type { ReactNode } from "react";
import { Text, XStack, YStack, styled } from "tamagui";
import { LinearGradient } from "@tamagui/linear-gradient";

import { BodyMd, BodySm, Meta } from "./typography";

export type BubbleStatus = "sending" | "sent" | "delivered" | "read" | "failed";

const IncomingShell = styled(YStack, {
  name: "IncomingBubble",
  alignSelf: "flex-start",
  maxWidth: "85%",
  backgroundColor: "$surface",
  borderWidth: 0.5,
  borderColor: "$outlineVariant",
  borderRadius: "$lg",
  borderBottomLeftRadius: 4,
  paddingHorizontal: "$sm",
  paddingVertical: 10,

  variants: {
    failed: {
      true: { borderWidth: 1, borderColor: "$error" },
    },
  } as const,
});

export interface ChatBubbleProps {
  text: string;
  outgoing: boolean;
  /** Pre-formatted "10:42 AM" style label. */
  timestamp?: string;
  /** Only the last bubble in a same-sender run shows its timestamp. */
  showTimestamp?: boolean;
  /** Sender name — incoming group messages only. */
  sender?: string | null;
  status?: BubbleStatus;
  /** Read-receipt tick node (outgoing only; screen owns the icon). */
  receipt?: ReactNode;
  /** Reaction pills, rendered attached below the bubble body (screen owns the
   *  node — it needs reanimated, which this package doesn't depend on). */
  reactions?: ReactNode;
  onRetryPress?: () => void;
}

export function ChatBubble({
  text,
  outgoing,
  timestamp,
  showTimestamp = true,
  sender,
  status = "sent",
  receipt,
  reactions,
  onRetryPress,
}: ChatBubbleProps) {
  const sending = status === "sending";
  const failed = status === "failed";

  return (
    <YStack
      alignSelf={outgoing ? "flex-end" : "flex-start"}
      maxWidth="85%"
      gap={4}
      opacity={sending ? 0.6 : 1}
    >
      {outgoing ? (
        // Gradient is an absolute fill behind the text, not the sizing element.
        // expo LinearGradient shrink-wraps to min-content (longest word), which
        // wrapped bubbles far too narrow — letting the padded YStack size to the
        // text (like IncomingShell) fixes the width. The gradient self-clips via
        // matching radii; shadow lives on the outer YStack so it isn't masked.
        <YStack
          borderRadius="$lg"
          borderBottomRightRadius={4}
          paddingHorizontal="$sm"
          paddingVertical={10}
          borderWidth={failed ? 1 : 0}
          borderColor={failed ? "$error" : "transparent"}
          // soft ownership glow (THEME §5 — interactive/owned only)
          shadowColor="#007a74"
          shadowOpacity={0.2}
          shadowRadius={10}
          shadowOffset={{ width: 0, height: 4 }}
        >
          <LinearGradient
            fullscreen
            colors={["$primary", "$secondary"]}
            start={[0, 0]}
            end={[1, 1]}
            borderRadius="$lg"
            borderBottomRightRadius={4}
          />
          <BodyMd color="$onPrimary">{text}</BodyMd>
        </YStack>
      ) : (
        <IncomingShell failed={failed}>
          {sender ? (
            <Meta
              color="$onSurfaceVariant"
              mb={2}
              textTransform="none"
              letterSpacing={0.2}
            >
              {sender}
            </Meta>
          ) : null}
          <BodyMd color="$onSurface">{text}</BodyMd>
        </IncomingShell>
      )}

      {/* Reaction pills — attached under the bubble, aligned to its side. */}
      {reactions ? (
        <XStack
          alignSelf={outgoing ? "flex-end" : "flex-start"}
          gap={4}
          flexWrap="wrap"
        >
          {reactions}
        </XStack>
      ) : null}

      {/* Footer: timestamp + receipt, or the failed affordance */}
      {failed ? (
        <XStack
          alignSelf={outgoing ? "flex-end" : "flex-start"}
          onPress={onRetryPress}
        >
          <BodySm color="$error">Tap to retry</BodySm>
        </XStack>
      ) : sending || !showTimestamp ? null : (
        <XStack
          alignSelf={outgoing ? "flex-end" : "flex-start"}
          alignItems="center"
          gap={4}
          paddingHorizontal={2}
        >
          {timestamp ? <Meta>{timestamp}</Meta> : null}
          {outgoing ? receipt : null}
        </XStack>
      )}
    </YStack>
  );
}

// Day-divider pill (chat/DESIGN.md) — centred chip above a run of messages.
export function DayDivider({ label }: { label: string }) {
  return (
    <YStack alignSelf="center" my="$xs">
      <YStack
        backgroundColor="$surfaceContainerLow"
        borderRadius="$full"
        paddingHorizontal="$sm"
        paddingVertical={6}
      >
        <Text
          fontFamily="$body"
          fontSize={12}
          lineHeight={16}
          fontWeight="500"
          letterSpacing={0.96}
          textTransform="uppercase"
          color="$onSurfaceVariant"
          fontVariant={["tabular-nums"]}
        >
          {label}
        </Text>
      </YStack>
    </YStack>
  );
}

export { IncomingShell };
