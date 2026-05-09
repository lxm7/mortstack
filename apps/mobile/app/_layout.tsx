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
import { ChatCrypto } from "@repo/chat-crypto";
import { ChatDb } from "@repo/chat-db";
import { ChatCalls } from "@repo/chat-calls";

SplashScreen.preventAutoHideAsync();

console.log("[chat-mvp/M0]", {
  crypto: ChatCrypto.hello(),
  db: ChatDb.hello(),
  calls: ChatCalls.hello(),
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
