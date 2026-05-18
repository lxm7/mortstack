import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_400Regular_Italic,
  IBMPlexSans_500Medium,
  IBMPlexSans_500Medium_Italic,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_600SemiBold_Italic,
  IBMPlexSans_700Bold,
  IBMPlexSans_700Bold_Italic,
} from "@expo-google-fonts/ibm-plex-sans";
import { Providers } from "@/providers";
import { getChatDb } from "@repo/chat-db";
import { ChatCalls } from "@repo/chat-calls";
import { getOrCreateChatIdentity } from "@/lib/chat/identity";
// Side-effect import — wires publishMyChatDevice() to fire on every
// auth-state transition (boot + sign-in + user-switch), idempotent per user.
import "@/lib/chat/auto-publish";

SplashScreen.preventAutoHideAsync();

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
    IBMPlexSans_400Regular,
    IBMPlexSans_400Regular_Italic,
    IBMPlexSans_500Medium,
    IBMPlexSans_500Medium_Italic,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_600SemiBold_Italic,
    IBMPlexSans_700Bold,
    IBMPlexSans_700Bold_Italic,
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
      <StatusBar style="auto" />
    </Providers>
  );
}
