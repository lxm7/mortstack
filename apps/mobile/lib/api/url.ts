import { Platform } from "react-native";

// EXPO_PUBLIC_* are inlined at BUNDLE time, not read at runtime — Expo reads
// apps/mobile/.env and statically replaces these members. If a var didn't
// inline (wrong .env location, or Metro not restarted with --clear), the
// `??` fallback silently hands back a localhost URL. logChatEndpoints() below
// surfaces exactly which case you're in.

// Dev fallback per platform:
//   Android emulator → 10.0.2.2 is the host-loopback alias
//   iOS sim / web    → localhost maps to the host's net stack directly
// Set EXPO_PUBLIC_API_URL to override (e.g. staging, or host LAN IP for a
// physical device on the same WiFi).
function defaultApiUrl(): string {
  if (Platform.OS === "android") return "http://10.0.2.2:3001";
  return "http://localhost:3001";
}

// Same host-loopback rule as the API. The WS Worker (wrangler dev) listens on
// 8787; staging is the deployed *.workers.dev origin.
function defaultWsUrl(): string {
  if (Platform.OS === "android") return "ws://10.0.2.2:8787";
  return "ws://localhost:8787";
}

// Raw env members captured once so we can tell "explicitly set" from
// "fell back to localhost" — a bundled `undefined` means the var never
// inlined.
const RAW_API_URL = process.env.EXPO_PUBLIC_API_URL;
const RAW_WS_URL = process.env.EXPO_PUBLIC_CHAT_WS_URL;

export const API_URL = RAW_API_URL ?? defaultApiUrl();
export const CHAT_WS_URL = RAW_WS_URL ?? defaultWsUrl();

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "10.0.2.2", "0.0.0.0"]);

// Pull the hostname without leaning on a WHATWG URL global (Hermes doesn't
// ship one reliably). Strip scheme → take up to the first :, /, or ?.
function hostOf(url: string): string {
  const afterScheme = url.replace(/^[a-z]+:\/\//i, "");
  return afterScheme.split(/[:/?]/)[0] ?? afterScheme;
}

function isLocal(url: string): boolean {
  return LOCAL_HOSTS.has(hostOf(url));
}

// One-shot boot diagnostic. Logs the resolved API + WS URLs and asserts they
// point at the SAME environment locality: MLS keys/groups/welcomes flow over
// the API while message ciphertext flows over the WS DO — split them across a
// local + remote backend and sends land in a DO that never saw the group.
export function logChatEndpoints(): void {
  const apiLocal = isLocal(API_URL);
  const wsLocal = isLocal(CHAT_WS_URL);

  console.log("[endpoints] resolved", {
    API_URL,
    CHAT_WS_URL,
    apiFromEnv: !!RAW_API_URL,
    wsFromEnv: !!RAW_WS_URL,
    apiLocal,
    wsLocal,
  });

  if (!RAW_API_URL) {
    console.warn(
      "[endpoints] EXPO_PUBLIC_API_URL did not inline — using localhost default. " +
        "Check apps/mobile/.env and restart Metro with `expo start --clear`.",
    );
  }
  if (!RAW_WS_URL) {
    console.warn(
      "[endpoints] EXPO_PUBLIC_CHAT_WS_URL did not inline — using localhost default. " +
        "Check apps/mobile/.env and restart Metro with `expo start --clear`.",
    );
  }
  if (apiLocal !== wsLocal) {
    console.warn(
      `[endpoints] MISMATCH — API is ${apiLocal ? "LOCAL" : "REMOTE"} but WS is ${
        wsLocal ? "LOCAL" : "REMOTE"
      }. MLS setup and message delivery must share one backend; set both ` +
        "EXPO_PUBLIC_API_URL and EXPO_PUBLIC_CHAT_WS_URL to the same environment.",
    );
  }
}
