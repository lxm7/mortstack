// Glacier TextField (components/TextField.md). Follows THEME §6 input rule:
// inactive = bottom hairline only; focus = full 0.5px accent box + soft primary
// glow. Icon-agnostic — pass a rendered leading icon node (screens own the icon
// set + colour), same contract as glacier/button.tsx.
import { useState, type ReactNode } from "react";
import { styled, Input, XStack, type GetProps } from "tamagui";

const FieldFrame = styled(XStack, {
  name: "GlacierTextFieldFrame",
  alignItems: "center",
  gap: "$xs",
  height: 52, // exceeds the 44pt tap-target floor (THEME §8)
  paddingHorizontal: "$sm",
  backgroundColor: "$surface",
  borderRadius: "$true", // radius.DEFAULT = 8
  // Rest state: bottom hairline only (THEME §6). Side/top borders are present
  // but transparent so the focus transition only recolours — no layout shift.
  borderWidth: 0.5,
  borderColor: "transparent",
  borderBottomColor: "$outlineVariant",
  // Soft accent halo — glow reserved for interactive/active (THEME §5). Kept
  // always-present at 0 opacity for the same reason as the border above: focus
  // only changes values on a fixed style signature, so Tamagui never
  // reconstructs the frame view (which would remount the Input and drop focus).
  shadowColor: "$primary",
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,

  variants: {
    focused: {
      true: {
        borderColor: "$primary",
        shadowOpacity: 0.18,
      },
    },
    error: {
      true: {
        borderColor: "$error",
        borderBottomColor: "$error",
      },
    },
  } as const,
});

export type TextFieldProps = GetProps<typeof Input> & {
  /** Rendered leading icon node (screen owns the icon set + colour). */
  icon?: ReactNode;
  /** Error state — recolours the border to `$error`. */
  error?: boolean;
};

export function TextField({
  icon,
  error,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(true);
  return (
    <FieldFrame focused={focused} error={error}>
      {icon}
      <Input
        flex={1}
        unstyled
        paddingVertical={10}
        fontFamily="$body"
        fontSize={16}
        color="$onSurface"
        placeholderTextColor="$onSurfaceVariant"
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
    </FieldFrame>
  );
}

export { FieldFrame };
