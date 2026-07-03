// Shared auth-flow UI (login/DESIGN.md). One shell for sign-in / sign-up /
// forgot-password: full-bleed $surface screen, centred column, brand halo +
// "Mortstack" wordmark, subtitle, then the screen's form. Lives under lib/ (not
// app/) so expo-router doesn't treat it as a route.
import type { ReactNode } from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, XStack, YStack, useTheme } from "tamagui";
import { HeadlineLg, BodySm } from "@repo/ui/glacier/typography";

// Brand mark — cyan ring disc + soft halo + teal chat glyph (login/DESIGN.md).
function LogoMark() {
  const theme = useTheme();
  return (
    <YStack
      w={84}
      h={84}
      br="$full"
      ai="center"
      jc="center"
      bg="$surface"
      borderWidth={4}
      borderColor="$primaryContainer"
      // "Frozen light" halo — the one ambient glow the brand mark earns.
      shadowColor="$primaryContainer"
      shadowOpacity={0.6}
      shadowRadius={24}
      shadowOffset={{ width: 0, height: 0 }}
    >
      <MaterialCommunityIcons
        name="forum"
        size={34}
        color={theme.primary.val}
      />
    </YStack>
  );
}

export function AuthShell({
  subtitle,
  children,
  footer,
}: {
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <YStack f={1} bg="$surface">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <YStack
          w="100%"
          maxWidth={420}
          alignSelf="center"
          px="$md"
          py="$xl"
          gap="$lg"
        >
          <YStack ai="center" gap="$sm">
            <LogoMark />
            <YStack ai="center" gap="$base">
              <HeadlineLg>Mortstack</HeadlineLg>
              <BodySm color="$onSurfaceVariant" textAlign="center">
                {subtitle}
              </BodySm>
            </YStack>
          </YStack>

          {children}

          {footer}
        </YStack>
      </ScrollView>
    </YStack>
  );
}

// Centred footer line: prompt in $onSurfaceVariant, action word as a $primary
// weight-600 Link (login/DESIGN.md).
export function AuthFooter({
  prompt,
  action,
  href,
}: {
  prompt: string;
  action: string;
  href: string;
}) {
  return (
    <XStack jc="center" ai="center" gap="$base">
      <BodySm color="$onSurfaceVariant">{prompt}</BodySm>
      <Link href={href as never} asChild>
        <Text
          fontFamily="$body"
          fontSize={14}
          lineHeight={20}
          fontWeight="600"
          color="$primary"
        >
          {action}
        </Text>
      </Link>
    </XStack>
  );
}
