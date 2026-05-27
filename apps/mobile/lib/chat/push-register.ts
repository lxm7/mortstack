import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { trpc } from "@/lib/trpc/client";
import { getOrCreateChatIdentity } from "./identity";

// M6 — APNs / FCM token registration.
//
// Returns the native device push token (NOT the Expo Push token) — Sessions
// dispatches directly via APNs HTTP/2 + FCM HTTP v1 from the chat-push
// Lambda; the Expo Push relay would break E2E payload shape (decision D8).
//
// `getDevicePushTokenAsync()` returns { type: 'ios' | 'android', data: token }.
// On iOS the token is the APNs device token (hex, 64 chars after registration);
// on Android it's the FCM registration token.
async function fetchNativeToken(): Promise<{
  platform: "APNS" | "FCM";
  token: string;
}> {
  const settings = await Notifications.getPermissionsAsync();
  let granted = settings.granted;
  if (!granted && settings.canAskAgain) {
    const ask = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    granted = ask.granted;
  }
  if (!granted) throw new Error("push permission denied");

  const tok = await Notifications.getDevicePushTokenAsync();
  if (Platform.OS === "ios") return { platform: "APNS", token: tok.data };
  if (Platform.OS === "android") return { platform: "FCM", token: tok.data };
  throw new Error(`unsupported platform: ${Platform.OS}`);
}

export async function registerPushTokenForThisDevice(): Promise<
  | { ok: true; platform: "APNS" | "FCM"; tokenPreview: string }
  | { ok: false; reason: string }
> {
  if (!Device.isDevice) {
    // Simulator / emulator: APNs/FCM tokens are not available (iOS sim) or
    // require a Google services config (Android emu). Skip silently — boot
    // logs would otherwise spam during local dev on a sim.
    return { ok: false, reason: "non-physical device" };
  }

  const id = await getOrCreateChatIdentity();
  const bundleId =
    Constants.expoConfig?.ios?.bundleIdentifier ??
    Constants.expoConfig?.android?.package ??
    "io.sessions.app";

  const { platform, token } = await fetchNativeToken();
  await trpc.user.push.register.mutate({
    deviceId: id.deviceId,
    platform,
    token,
    appBundleId: bundleId,
  });
  return {
    ok: true,
    platform,
    tokenPreview: `${token.slice(0, 8)}…${token.slice(-4)}`,
  };
}
