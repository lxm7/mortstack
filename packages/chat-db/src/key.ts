import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

const KEY_ALIAS = "chat-db-key-v1";
const KEY_BYTES = 32;

// Intentionally NOT in the `io.sessions.chat` shared keychain access group.
// The M7 iOS Notification Service Extension only needs the identity seed
// (decrypts push payloads for display); it never reads the local SQLCipher
// DB. Keeping this passphrase in the app's default access group preserves
// least privilege — if the NSE binary is ever compromised the attacker does
// not also gain offline access to local contacts/drafts/history. See
// packages/chat-crypto/ios/ChatCryptoModule.swift `saveSeed()` for the
// shared-group counterpart that the NSE WILL read.

export type PassphraseSource = "loaded" | "generated";

export interface KeyResult {
  passphrase: string;
  source: PassphraseSource;
}

function toHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i] ?? 0;
    out += b.toString(16).padStart(2, "0");
  }
  return out;
}

export async function getOrCreatePassphrase(): Promise<KeyResult> {
  const existing = await SecureStore.getItemAsync(KEY_ALIAS, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
  if (existing) return { passphrase: existing, source: "loaded" };

  const bytes = Crypto.getRandomBytes(KEY_BYTES);
  const passphrase = toHex(bytes);
  await SecureStore.setItemAsync(KEY_ALIAS, passphrase, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
  return { passphrase, source: "generated" };
}
