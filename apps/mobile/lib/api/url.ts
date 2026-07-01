import { Platform } from "react-native";

// Dev fallback per platform:
//   Android emulator → 10.0.2.2 is the host-loopback alias
//   iOS sim / web    → localhost maps to the host's net stack directly
// Set EXPO_PUBLIC_API_URL to override (e.g. staging, or host LAN IP for a
// physical device on the same WiFi).
function defaultApiUrl(): string {
  if (Platform.OS === "android") return "http://10.0.2.2:3001";
  return "http://localhost:3001";
}

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? defaultApiUrl();
