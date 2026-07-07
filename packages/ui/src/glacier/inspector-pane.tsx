// Glacier Inspector Pane (components/InspectorPane.md). One card, two
// structurally-identical but visually-opposite tones — the contrast IS the
// feature. recessed = "on the wire / at rest" (muted, flat, mono). emphasized
// = "on this device" (primary-tinted panel, bold plaintext, soft glow).
// App-Light: dim/bright is carried by tint + border + weight, not a dark canvas.
import type { ReactNode } from "react";
import { Text, XStack, YStack, styled } from "tamagui";

import { BodyLg, Meta, MonoMd } from "./typography";

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
        backgroundColor: "$revealFill",
        borderWidth: 0.5,
        borderColor: "$revealBorder",
        shadowColor: "$primary",
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
    },
  } as const,
  defaultVariants: { tone: "recessed" },
});

// Composes the Meta preset (THEME §3.1 meta: 12/16/500, uppercase, tabular) —
// only the tone colour differs.
const PaneLabel = styled(Meta, {
  name: "GlacierPaneLabel",

  variants: {
    tone: {
      recessed: { color: "$onSurfaceVariant" },
      emphasized: { color: "$primary" },
    },
  } as const,
});

// Ciphertext / hexdump — dim, recessed, machine. Composes MonoMd (THEME §3.1
// mono-md: mono 13/20/500, tabular).
export const PaneMonoContent = styled(MonoMd, {
  name: "GlacierPaneMono",
});

// Plaintext — bright, forward, human. Composes BodyLg (18/28) + the forward
// emphasis (weight 600, on-primary-container ink).
export const PanePlaintext = styled(BodyLg, {
  name: "GlacierPanePlaintext",
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
