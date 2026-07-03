// Glacier Button (components/Button.md). Three variants share one shape
// language; sizes sm/md/lg all meet the 44pt tap-target floor. Icon-agnostic:
// pass rendered icon nodes via `icon` / `iconAfter` (screens own the icon set).
import type { ReactNode } from "react";
import { styled, Text, YStack, type GetProps } from "tamagui";

const ButtonFrame = styled(YStack, {
  name: "GlacierButton",
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

const ButtonLabel = styled(Text, {
  name: "GlacierButtonLabel",
  fontFamily: "$body",
  fontSize: 13,
  lineHeight: 16,
  fontWeight: "500",
  letterSpacing: 0.26,

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
  ...rest
}: ButtonProps) {
  return (
    <ButtonFrame variant={variant} size={size} {...rest}>
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
