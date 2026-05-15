import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

const KEY_ALIAS = "chat-db-key-v1";
const KEY_BYTES = 32;

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
