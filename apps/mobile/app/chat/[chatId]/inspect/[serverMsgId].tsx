// Crypto Inspector — "The server never sees plaintext" (crypto-inspector/
// DESIGN.md). App-Light modal. Three panes make E2EE physically visible: dim
// ciphertext on the wire (A), bright plaintext on this device (B), gibberish at
// rest on disk (C); a proof strip shows the wrong key can't open it.
//
// SCOPE (this pass = UI shell + choreography):
//   • Pane B plaintext is REAL (from the chat store).
//   • Pane A/C bytes are ILLUSTRATIVE (see lib/chat/inspector-demo.ts) — frame
//     retention (DESIGN §11) is the deferred follow-up that swaps in the actual
//     wire bytes. The byte-count footer is tagged "illustrative" so nothing
//     claims to be the literal frame.
//   • "Try the wrong key" simulates the AEAD failure result; the real
//     decryptInbound throw (DESIGN §11) is the deferred follow-up.

import { useEffect, useMemo, useState } from "react";
import { ScrollView } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Spinner, XStack, YStack, useTheme } from "tamagui";

import { useChat, useMessages, type Message } from "@repo/chat";
import { useAuthStore } from "@/store/auth";
import { Button } from "@repo/ui/glacier/button";
import {
  InspectorPane,
  PaneMonoContent,
  PanePlaintext,
} from "@repo/ui/glacier/inspector-pane";
import { BodyLg, BodySm, HeadlineMd, Meta } from "@repo/ui/glacier/typography";

import {
  deterministicBytes,
  groupHex,
  hexdumpLines,
  shortHex,
} from "@/lib/chat/inspector-demo";

const INSPECTOR_ENABLED =
  __DEV__ || process.env.EXPO_PUBLIC_DEMO_CRYPTO_INSPECTOR === "1";

// Random-glyph settle for Pane A ("this is the raw machine view", DESIGN §7.2).
function useScramble(final: string, disabled: boolean): string {
  const [out, setOut] = useState(disabled ? final : "");
  useEffect(() => {
    if (disabled) {
      setOut(final);
      return;
    }
    const glyphs = "0123456789abcdef";
    const dur = 520;
    let raf = 0;
    let start: number | undefined;
    const tick = (t: number) => {
      if (start === undefined) start = t;
      const p = Math.min(1, (t - start) / dur);
      const reveal = Math.floor(p * final.length);
      let s = final.slice(0, reveal);
      for (let i = reveal; i < final.length; i++) {
        const c = final[i];
        s += c === " " ? " " : glyphs[Math.floor(Math.random() * 16)];
      }
      setOut(s);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setOut(final);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [final, disabled]);
  return out;
}

function timeOf(ms: number): string {
  const d = new Date(ms);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}

export default function InspectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const reduced = useReducedMotion();
  const params = useLocalSearchParams<{
    chatId: string;
    serverMsgId: string;
  }>();
  const chatId = params.chatId ?? "";
  const serverMsgId = params.serverMsgId ?? "";

  const { chat } = useChat(chatId);
  const { messages } = useMessages(chatId);
  const myId = useAuthStore((s) => s.session?.user.id ?? null);
  const [showHow, setShowHow] = useState(false);
  const [wrongKey, setWrongKey] = useState(false);

  const message: Message | undefined = useMemo(
    () =>
      messages.find(
        (m) =>
          m.serverSerial === serverMsgId ||
          m.clientMsgId === serverMsgId ||
          m.id === serverMsgId,
      ),
    [messages, serverMsgId],
  );

  const senderLabel = useMemo(() => {
    if (!message) return "";
    if (message.senderAuthUserId === myId) return "you";
    const m = chat?.members.find(
      (x) => x.authUserId === message.senderAuthUserId,
    );
    const n = m?.handle ?? m?.displayName ?? "peer";
    return n.split(/\s+/)[0] ?? n;
  }, [message, myId, chat]);

  // Illustrative wire/at-rest bytes (see file header + inspector-demo.ts).
  const cipher = useMemo(() => {
    const len = 200 + ((message?.text.length ?? 20) % 60);
    return deterministicBytes(serverMsgId + ":wire", len);
  }, [serverMsgId, message?.text.length]);
  const cipherHex = useMemo(() => groupHex(cipher), [cipher]);
  const diskHex = useMemo(
    () => hexdumpLines(deterministicBytes(serverMsgId + ":disk", 24)),
    [serverMsgId],
  );
  const scrambled = useScramble(cipherHex, reduced || !message);

  // Wrong-key proof: shake the result line (DESIGN §7.4).
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));
  const onWrongKey = () => {
    setWrongKey(true);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    if (!reduced) {
      shake.value = withSequence(
        withTiming(-4, { duration: 40 }),
        withTiming(4, { duration: 40 }),
        withTiming(-4, { duration: 40 }),
        withTiming(0, { duration: 40 }),
      );
    }
  };

  const ink = theme.onSurfaceVariant?.val;
  const primary = theme.primary?.val;

  const copyHex = async () => {
    await Clipboard.setStringAsync(cipherHex);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (!INSPECTOR_ENABLED) {
    return (
      <YStack
        flex={1}
        backgroundColor="$background"
        alignItems="center"
        justifyContent="center"
      >
        <BodyLg color="$onSurfaceVariant">Not available in this build.</BodyLg>
      </YStack>
    );
  }

  const frameLabel = chat?.kind === "group" ? "v2 (MLS group)" : "v1 (box)";

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <YStack
        paddingTop={insets.top}
        paddingHorizontal="$md"
        paddingBottom="$xs"
      >
        <XStack alignItems="center" gap="$xs">
          <YStack
            width={40}
            height={40}
            alignItems="center"
            justifyContent="center"
            borderRadius="$full"
            accessibilityLabel="Close inspector"
            pressStyle={{ backgroundColor: "$surfaceContainerLow" }}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={22} color={ink} />
          </YStack>
          <HeadlineMd flex={1}>Inspect encryption</HeadlineMd>
          <YStack
            width={40}
            height={40}
            alignItems="center"
            justifyContent="center"
            borderRadius="$full"
            accessibilityLabel="How this works"
            pressStyle={{ backgroundColor: "$surfaceContainerLow" }}
            onPress={() => setShowHow((v) => !v)}
          >
            <Feather name="info" size={20} color={ink} />
          </YStack>
        </XStack>
        <Meta color="$onSurfaceVariant" mt="$base">
          {`Message · srv ${shortHex(serverMsgId, 2)} · ${frameLabel}`}
        </Meta>
      </YStack>

      {showHow ? (
        <YStack
          marginHorizontal="$md"
          marginBottom="$xs"
          padding="$sm"
          borderRadius="$md"
          backgroundColor="$surfaceContainerLow"
          borderWidth={0.5}
          borderColor="$outlineVariant"
        >
          <BodySm color="$onSurfaceVariant">
            The box/MLS ciphertext leaves the device; the server stores and
            routes bytes it can’t read. Only devices in the group hold the keys.
          </BodySm>
        </YStack>
      ) : null}

      {!message ? (
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$sm">
          {messages.length === 0 ? (
            <Spinner color="$primary" />
          ) : (
            <BodyLg color="$onSurfaceVariant">Message not found.</BodyLg>
          )}
        </YStack>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingTop: 8, gap: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Pane A — On the wire (illustrative bytes) */}
          <InspectorPane
            tone="recessed"
            label="ON THE WIRE"
            sub="what the server received"
            icon={<Feather name="rss" size={16} color={ink} />}
            action={
              <Button
                variant="ghost"
                size="sm"
                onPress={copyHex}
                icon={<Feather name="copy" size={14} color={ink} />}
              >
                Copy
              </Button>
            }
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <PaneMonoContent color="$cipher">{scrambled}</PaneMonoContent>
            </ScrollView>
            <Meta
              color="$onSurfaceVariant"
              mt="$xs"
              textTransform="none"
              letterSpacing={0.2}
            >
              {`nonce ${shortHex(serverMsgId + ":n")} · ${cipher.length} B · illustrative`}
            </Meta>
          </InspectorPane>

          {/* Pane B — On this device (REAL plaintext) */}
          <Animated.View
            entering={reduced ? FadeIn : FadeInUp.duration(320).delay(180)}
          >
            <InspectorPane
              tone="emphasized"
              label="ON THIS DEVICE"
              sub="decrypted — exists only here"
              icon={<Feather name="smartphone" size={16} color={primary} />}
            >
              <PanePlaintext>{message.text}</PanePlaintext>
              <Meta
                color="$primary"
                mt="$xs"
                textTransform="none"
                letterSpacing={0.2}
              >
                {`from ${senderLabel} · ${timeOf(message.createdAt)}`}
              </Meta>
            </InspectorPane>
          </Animated.View>

          {/* Pane C — At rest on disk (SQLCipher, illustrative dump) */}
          <InspectorPane
            tone="recessed"
            label="AT REST ON DISK"
            sub="SQLCipher · AES-256"
            icon={<Feather name="database" size={16} color={ink} />}
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <YStack>
                {diskHex.map((line) => (
                  <PaneMonoContent key={line} color="$cipher">
                    {line}
                  </PaneMonoContent>
                ))}
              </YStack>
            </ScrollView>
            <Meta
              color="$onSurfaceVariant"
              mt="$xs"
              textTransform="none"
              letterSpacing={0.2}
            >
              key: Secure Enclave · never leaves device
            </Meta>
          </InspectorPane>

          {/* Proof strip — wrong key can't open it */}
          <YStack alignItems="center" gap="$xs" pt="$xs">
            <Button
              variant="ghostDanger"
              onPress={onWrongKey}
              br="$full"
              icon={<Feather name="key" size={16} color={theme.error?.val} />}
            >
              Try the wrong key
            </Button>
            {wrongKey ? (
              <Animated.View style={shakeStyle}>
                <BodySm color="$error" textAlign="center">
                  ✗ Can’t open it — wrong key, AEAD auth failed. As it must.
                </BodySm>
              </Animated.View>
            ) : null}
          </YStack>

          {/* Closing line */}
          <BodyLg color="$onSurfaceVariant" textAlign="center" mt="$xs">
            The server only ever holds the dim column. The bright one exists
            nowhere but this phone.
          </BodyLg>
        </ScrollView>
      )}
    </YStack>
  );
}
