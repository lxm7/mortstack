// Glacier Inspector Pane (components/InspectorPane.md). One card, two
// structurally-identical but visually-opposite tones — the contrast IS the
// feature. recessed = "on the wire / at rest" (muted, flat, mono). emphasized
// = "on this device" (primary-tinted panel, bold plaintext, soft glow).
// App-Light: dim/bright is carried by tint + border + weight, not a dark canvas.
import type { ReactNode } from "react";
import { Text, XStack, YStack, styled } from "tamagui";

const PaneFrame = styled(YStack, {
  name: "GlacierInspectorPane",
  borderRadius: "$lg",
  padding: "$md",
  gap: "$xs",

  variants: {
    tone: {
      recessed: {
        backgroundColor: "$surfaceContainerLow",
        borderWidth: 0.5,
        borderColor: "$outlineVariant",
      },
      emphasized: {
        backgroundColor: "rgba(0,105,110,0.06)",
        borderWidth: 0.5,
        borderColor: "rgba(0,105,110,0.25)",
        shadowColor: "$primary",
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
    },
  } as const,
  defaultVariants: { tone: "recessed" },
});

const PaneLabel = styled(Text, {
  name: "GlacierPaneLabel",
  fontFamily: "$body",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "500",
  letterSpacing: 0.96,
  textTransform: "uppercase",
  fontVariant: ["tabular-nums"],

  variants: {
    tone: {
      recessed: { color: "$onSurfaceVariant" },
      emphasized: { color: "$primary" },
    },
  } as const,
});

// Ciphertext / hexdump — dim, recessed, machine.
export const PaneMonoContent = styled(Text, {
  name: "GlacierPaneMono",
  fontFamily: "$mono",
  fontSize: 13,
  lineHeight: 20,
  color: "$onSurfaceVariant",
  fontVariant: ["tabular-nums"],
});

// Plaintext — bright, forward, human.
export const PanePlaintext = styled(Text, {
  name: "GlacierPanePlaintext",
  fontFamily: "$body",
  fontSize: 18,
  lineHeight: 28,
  fontWeight: "600",
  color: "$onPrimaryContainer",
});

type Tone = "recessed" | "emphasized";

export interface InspectorPaneProps {
  tone?: Tone;
  /** Uppercase pane label, e.g. "ON THE WIRE". */
  label: string;
  /** Sub-label, e.g. "what the server received". */
  sub?: string;
  /** Leading icon node (screen owns the icon set). */
  icon?: ReactNode;
  /** Trailing action, e.g. a Copy button. */
  action?: ReactNode;
  children?: ReactNode;
}

export function InspectorPane({
  tone = "recessed",
  label,
  sub,
  icon,
  action,
  children,
}: InspectorPaneProps) {
  return (
    <PaneFrame tone={tone}>
      <XStack alignItems="center" gap="$xs">
        {icon}
        <PaneLabel tone={tone}>{label}</PaneLabel>
        {action ? (
          <YStack flex={1} alignItems="flex-end">
            {action}
          </YStack>
        ) : null}
      </XStack>
      {sub ? (
        <Text
          fontFamily="$body"
          fontSize={12}
          lineHeight={16}
          fontStyle="italic"
          color="$onSurfaceVariant"
        >
          {sub}
        </Text>
      ) : null}
      <YStack pt="$xs">{children}</YStack>
    </PaneFrame>
  );
}

export { PaneFrame, PaneLabel };
