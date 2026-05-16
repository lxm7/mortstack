import { Platform } from "react-native";
import { createAuthClient } from "better-auth/client";
import { loadSessionToken, saveSessionToken } from "./session";

// Dev fallback per platform:
//   Android emulator → 10.0.2.2 is the host-loopback alias
//   iOS sim / web    → localhost maps to the host's net stack directly
// Set EXPO_PUBLIC_API_URL to override (e.g. staging URL, or host LAN IP for a
// physical device on the same WiFi).
function defaultApiUrl(): string {
  if (Platform.OS === "android")
    return process.env.EXPO_PUBLIC_API_URL_ANDROID_EMU!;
  return process.env.EXPO_PUBLIC_API_URL_IOS_EMU!;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? defaultApiUrl();
// Better Auth client configured for React Native:
// - No cookies (RN has no cookie jar)
// - Session token stored in expo-secure-store
// - Bearer token sent via Authorization header
//
// SUI wallet plugin deferred — see docs/proposals/sui-auth-plugin.md
export const authClient = createAuthClient({
  baseURL: `${API_URL}/auth`,
  fetchOptions: {
    // Attach stored session token to every request
    onRequest: async (ctx) => {
      // RN doesn't send Origin header — set it so better-auth CSRF check passes
      ctx.headers.set("Origin", API_URL);

      const token = await loadSessionToken();
      if (token) {
        ctx.headers.set("Authorization", `Bearer ${token}`);
      }
    },
    // Persist new session token from response
    onResponse: async (ctx) => {
      const token = ctx.response.headers.get("set-auth-token");
      if (token) {
        await saveSessionToken(token);
      }
    },
  },
});
