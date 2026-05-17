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
import { publishMyChatDevice } from "@/lib/chat/publish";
import { loadSessionToken } from "@/lib/auth/session";

SplashScreen.preventAutoHideAsync();

getOrCreateChatIdentity()
  .then(async (id) => {
    console.log("[chat-mvp/M3] chat-identity ready", {
      source: id.source,
      deviceId: id.deviceId,
      ed25519PubBytes: id.ed25519Pub.length,
      x25519PubBytes: id.x25519Pub.length,
      calls: ChatCalls.hello(),
    });

    // Only attempt publish if we already have a session — first-launch users
    // are pre-signup. Post-login screen should call publishMyChatDevice()
    // directly once a session token is written.
    const hasSession = (await loadSessionToken()) !== null;
    if (!hasSession) return;

    try {
      const result = await publishMyChatDevice();
      console.log("[chat-mvp/M3] device keys published", result);
    } catch (err) {
      console.error("[chat-mvp/M3] device keys publish failed", err);
    }
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
