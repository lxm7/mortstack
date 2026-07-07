// Glacier Composer (components/Composer.md). Pill input (emoji trailing, inside
// the pill) + a circular send button. Send is $primary-tinted when active —
// NEVER success-green (that's an inspector-only token). Focus lifts the pill to
// a full 0.5px $primary box + soft glow.
import { useState, type ReactNode } from "react";
import { Input, Spinner, XStack, YStack, styled } from "tamagui";

const ComposerBar = styled(XStack, {
  name: "GlacierComposerBar",
  alignItems: "flex-end",
  gap: "$sm",
  paddingHorizontal: "$md",
  paddingVertical: "$xs",
  backgroundColor: "$surface",
  borderTopWidth: 0.5,
  borderTopColor: "$outlineVariant",
});

const ComposerPill = styled(XStack, {
  name: "GlacierComposerPill",
  flex: 1,
  alignItems: "center",
  minHeight: 44,
  paddingHorizontal: "$sm",
  borderRadius: "$full",
  backgroundColor: "$surfaceContainerLow",
  borderWidth: 1,
  borderColor: "$outlineVariant",
  // Glow kept always-present at 0 opacity so focus only changes values on a
  // fixed style signature — otherwise adding shadow* on focus makes Tamagui
  // reconstruct the pill view, remounting the Input and dropping focus.
  shadowColor: "$primary",
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,

  variants: {
    focused: {
      true: {
        borderColor: "$primary",
        borderWidth: 1.5,
        shadowOpacity: 0.15,
      },
    },
  } as const,
});

const SendButton = styled(YStack, {
  name: "GlacierSendButton",
  accessibilityRole: "button",
  width: 44,
  height: 44,
  borderRadius: "$md",
  alignItems: "center",
  justifyContent: "center",

  variants: {
    active: {
      true: { backgroundColor: "$primaryTint" },
      false: { backgroundColor: "$surfaceContainerLow" },
    },
  } as const,
  defaultVariants: { active: false },
});

export interface ComposerProps {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  sending?: boolean;
  disabled?: boolean;
  placeholder?: string;
  bottomInset?: number;
  /** Emoji affordance, trailing inside the pill. */
  emojiIcon?: ReactNode;
  /** Send glyph — receives `active` so the screen can colour it. */
  renderSendIcon?: (active: boolean) => ReactNode;
}

export function Composer({
  value,
  onChangeText,
  onSend,
  sending,
  disabled,
  placeholder = "Write a message…",
  bottomInset = 0,
  emojiIcon,
  renderSendIcon,
}: ComposerProps) {
  const [focused, setFocused] = useState(false);
  const active = value.trim().length > 0 && !disabled;

  return (
    <ComposerBar paddingBottom={bottomInset ? bottomInset + 8 : "$xs"}>
      <ComposerPill focused={focused}>
        <Input
          testID="composer-input"
          flex={1}
          unstyled
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="$onSurfaceVariant"
          fontFamily="$body"
          fontSize={16}
          color="$onSurface"
          paddingVertical={10}
          multiline
          maxHeight={120}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={onSend}
          blurOnSubmit={false}
        />
        {emojiIcon ? <YStack pl="$xs">{emojiIcon}</YStack> : null}
      </ComposerPill>

      <SendButton
        testID="composer-send"
        active={active}
        accessibilityLabel="Send message"
        accessibilityState={{ disabled: !active }}
        onPress={active ? onSend : undefined}
        pressStyle={active ? { opacity: 0.85 } : undefined}
      >
        {sending ? (
          <Spinner size="small" color="$primary" />
        ) : (
          renderSendIcon?.(active)
        )}
      </SendButton>
    </ComposerBar>
  );
}

export { ComposerBar, ComposerPill, SendButton };
