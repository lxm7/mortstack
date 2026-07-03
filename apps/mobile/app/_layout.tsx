// MUST be the first import — installs globalThis.crypto.getRandomValues
// before any other module reads it. nanoid (used by chat-transport) and
// any noble/* lib pulled in later all depend on it. RN/Hermes doesn't ship
// the Web Crypto API; this polyfill bridges to the system CSPRNG via a
// tiny native module (iOS SecRandomCopyBytes / Android SecureRandom).
import "react-native-get-random-values";

import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
// Glacier type system (THEME §3): Sora (heading), Plus Jakarta Sans (body +
// metadata), JetBrains Mono (crypto/technical). Face names MUST match the
// `face` entries in the Tamagui config.
import {
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
} from "@expo-google-fonts/sora";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_400Regular_Italic,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_500Medium_Italic,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from "@expo-google-fonts/jetbrains-mono";
import { Providers } from "@/providers";
import { logChatEndpoints } from "@/lib/api/url";
import { getChatDb } from "@repo/chat-db";
import { ChatCalls } from "@repo/chat-calls";
import { getOrCreateChatIdentity } from "@/lib/chat/identity";
// Side-effect import — wires publishMyChatDevice() to fire on every
// auth-state transition (boot + sign-in + user-switch), idempotent per user.
import "@/lib/chat/auto-publish";
// Side-effect import — MLS engine bootstrap + KeyPackage top-up + commit/welcome
// polling (Chunk 5). Replaced by DO-pushed signals in Chunk 6.
import "@/lib/chat/mls-auto-publish";
// Side-effect import — M6 APNs/FCM token register on auth ready. Idempotent
// per signed-in user; depends on auto-publish creating the UserDevice row.
import "@/lib/chat/push-auto-register";

SplashScreen.preventAutoHideAsync();

// Boot diagnostic — logs resolved API + WS URLs and warns on env-inline
// failures or a local/remote backend split (the usual "send goes nowhere").
logChatEndpoints();

getOrCreateChatIdentity()
  .then((id) => {
    console.log("[chat-mvp/M3] chat-identity ready", {
      source: id.source,
      deviceId: id.deviceId,
      ed25519PubBytes: id.ed25519Pub.length,
      x25519PubBytes: id.x25519Pub.length,
      calls: ChatCalls.hello(),
    });
  })
  .catch((err: unknown) => {
    console.error("[chat-mvp/M3] chat-identity init failed", err);
  });

getChatDb()
  .then((handle) => {
    console.log("[chat-mvp/M2] chat-db ready", {
      schemaVersion: handle.version,
      keySource: handle.keySource,
    });
  })
  .catch((err: unknown) => {
    console.error("[chat-mvp/M2] chat-db init failed", err);
  });

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_400Regular_Italic,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_500Medium_Italic,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <Providers>
      <Stack screenOptions={{ headerShown: false }} />
      {/* Light-only app → dark status-bar content on the hospital-white surface */}
      <StatusBar style="dark" />
    </Providers>
  );
}
