// Glacier Button (components/Button.md). Three variants share one shape
// language. md/lg are ≥44pt tall; sm is a compact 36pt but reaches the 44pt
// tap-target floor (THEME §8) via hitSlop, so the touch area is always ≥44.
// Icon-agnostic: pass rendered icon nodes via `icon` / `iconAfter` (screens
// own the icon set).
import type { ReactNode } from "react";
import { styled, YStack, type GetProps } from "tamagui";

import { Label } from "./typography";

const ButtonFrame = styled(YStack, {
  name: "GlacierButton",
  accessibilityRole: "button",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: "$xs",
  borderRadius: "$true", // radius.DEFAULT = 8; pass br="$full" for the pill
  paddingHorizontal: "$sm",
  height: 44,

  variants: {
    variant: {
      primary: {
        backgroundColor: "$primary",
        pressStyle: { backgroundColor: "$primary", opacity: 0.85 },
      },
      ghost: {
        backgroundColor: "transparent",
        borderWidth: 0.5,
        borderColor: "$outlineVariant",
        pressStyle: { backgroundColor: "$surfaceContainerLow" },
      },
      ghostDanger: {
        backgroundColor: "transparent",
        borderWidth: 0.5,
        borderColor: "$error",
        opacity: 0.9,
        pressStyle: { backgroundColor: "$errorContainer" },
      },
    },
    size: {
      sm: { height: 36, paddingHorizontal: "$xs" },
      md: { height: 44, paddingHorizontal: "$sm" },
      lg: { height: 52, paddingHorizontal: "$md" },
    },
    disabled: {
      true: { opacity: 0.4, pointerEvents: "none" },
    },
  } as const,

  defaultVariants: { variant: "primary", size: "md" },
});

// Composes the Label preset (THEME §3.1 label: body 13/16/500) — only the
// per-variant colour differs.
const ButtonLabel = styled(Label, {
  name: "GlacierButtonLabel",

  variants: {
    variant: {
      primary: { color: "$onPrimary" },
      ghost: { color: "$onSurfaceVariant" },
      ghostDanger: { color: "$error" },
    },
  } as const,
});

type Variant = "primary" | "ghost" | "ghostDanger";
type Size = "sm" | "md" | "lg";

export type ButtonProps = Omit<
  GetProps<typeof ButtonFrame>,
  "variant" | "size"
> & {
  variant?: Variant;
  size?: Size;
  /** Rendered icon node (screen owns the icon set + colour). */
  icon?: ReactNode;
  iconAfter?: ReactNode;
  children?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconAfter,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  // sm is 36pt tall; extend the touch area by 4pt top/bottom so it meets the
  // 44pt floor (THEME §8) without changing the visual size.
  const hitSlop = size === "sm" ? { top: 4, bottom: 4 } : undefined;
  return (
    <ButtonFrame
      variant={variant}
      size={size}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityState={{ disabled: !!disabled }}
      {...rest}
    >
      {icon}
      {typeof children === "string" ? (
        <ButtonLabel variant={variant}>{children}</ButtonLabel>
      ) : (
        children
      )}
      {iconAfter}
    </ButtonFrame>
  );
}

export { ButtonFrame, ButtonLabel };
