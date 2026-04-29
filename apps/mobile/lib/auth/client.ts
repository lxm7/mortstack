import { createAuthClient } from "better-auth/client";
import { loadSessionToken, saveSessionToken } from "./session";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";
console.log({ API_URL });
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
