import * as FileSystem from "expo-file-system/legacy";
import { ChatCrypto } from "@repo/chat-crypto";
import { ChatMlsCore } from "@repo/chat-mls-core";

// M6 (ADR-013) — sealed MLS snapshot for the iOS NSE / Android FMS.
//
// Why exists: when a push arrives, the extension runs out-of-process from
// the main app and needs to decrypt the MLS application message *before*
// the OS hands a notification to the user. To do that it loads an
// OpenMLS engine instance from a snapshot the main app produced last time
// it persisted state.
//
// Threat model (D8/D9 — locked):
//   - The plaintext stays on-device; only the device-bound key seals it.
//   - The sealing key = the existing M3 identity seed (already in the
//     shared `io.sessions.chat` Keychain group; readable by the NSE).
//     Reusing it avoids a new key alias + lifecycle.
//   - The wrap algorithm = libsodium crypto_box, encrypting to self
//     (peerX25519Pub == ownX25519Pub). XSalsa20-Poly1305 — same primitive
//     the rest of the v=1 fallback uses.
//
// File layout: [version(1)] [nonce(24)] [ciphertext(N)]
//   v=1 = current. NSE rejects unknown versions and falls through to a
//   generic "New message" alert (no plaintext leak).
//
// File location: iOS App Group / Android shared dir migration is wired
// by the platform-specific NSE/FMS task (#6/#8 in next-features.md).
// Until that lands, we write to documentDirectory so the JS path is
// stable. The native config plugin will relocate the directory at
// prebuild; this module reads `Resource…` of the shared dir at runtime
// rather than hardcoding the path.

const VERSION = 0x01;
const VERSION_BYTES = 1;
const NONCE_BYTES = 24;
const SNAPSHOT_FILENAME = "mls-snapshot-v1.bin";

let cachedTargetUri: string | null = null;

function targetUri(): string {
  if (cachedTargetUri) return cachedTargetUri;
  // expo-file-system's documentDirectory is per-app, not shared with the
  // NSE. Task #6 swaps this for the App Group container URL via a native
  // module; until then, calling the NSE from the same app sandbox works
  // for two-sim acceptance on a single device.
  const base = FileSystem.documentDirectory ?? "";
  cachedTargetUri = `${base}${SNAPSHOT_FILENAME}`;
  return cachedTargetUri;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i] ?? 0);
  }
  return btoa(bin);
}

export interface WriteNseSnapshotInput {
  accountId: string;
  identitySeed: Uint8Array;
  snapshot: Uint8Array;
}

export async function writeNseSnapshot(
  input: WriteNseSnapshotInput,
): Promise<void> {
  const ownPub = ChatCrypto.derivePublicKeys(input.identitySeed).x25519Pub;
  const sealed = ChatCrypto.box(input.snapshot, ownPub, input.identitySeed);
  // Assemble [version][nonce][ciphertext]; we deliberately do NOT put the
  // raw bytes in a JSON envelope — the NSE Swift code can parse fixed-
  // offset fields without a JSON parser.
  const out = new Uint8Array(
    VERSION_BYTES + NONCE_BYTES + sealed.ciphertext.length,
  );
  out[0] = VERSION;
  out.set(sealed.nonce, VERSION_BYTES);
  out.set(sealed.ciphertext, VERSION_BYTES + NONCE_BYTES);

  // expo-file-system supports base64 writes. Write to a temp file then
  // rename — atomic-ish swap so a partial write doesn't leave the NSE
  // staring at a half-blob during a read.
  const finalUri = targetUri();
  const tmpUri = `${finalUri}.tmp`;
  await FileSystem.writeAsStringAsync(tmpUri, bytesToBase64(out), {
    encoding: FileSystem.EncodingType.Base64,
  });
  // expo-file-system has no rename; use moveAsync (atomic-on-same-volume).
  await FileSystem.deleteAsync(finalUri, { idempotent: true });
  await FileSystem.moveAsync({ from: tmpUri, to: finalUri });
}

// Convenience for the debug screen / two-sim acceptance: returns the
// current engine snapshot size so a developer can confirm the writer
// is firing. NOT a recovery API — the snapshot is opaque MLS state.
export function inspectLastSnapshot(): {
  fileUri: string;
  approxEngineBytes: number;
} {
  return {
    fileUri: targetUri(),
    approxEngineBytes: ChatMlsCore.dumpState().length,
  };
}
