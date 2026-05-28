export type ChatMlsCoreModuleEvents = Record<string, never>;

// All byte arrays cross the JSI bridge as Uint8Array. The native side
// (Swift/Kotlin via UniFFI) uses Data/ByteArray; Expo translates both ways.

// Result of MlsEngine.add_members. `commit` fans to all *current* group
// members via the Delivery Service (server-side broadcast). `welcome` goes
// to the new joiner(s) only — addressed individually by the server.
export interface AddMembersResult {
  commit: Uint8Array;
  welcome: Uint8Array;
}

// Discriminated result of MlsEngine.process_message:
//   - application: a decrypted plaintext for the chat UI
//   - commitApplied: group state advanced one epoch; no payload
//   - proposalQueued: a proposal was stored locally; no payload
// Caller switches on `kind` to dispatch.
export type ProcessedKind =
  | { kind: "application"; plaintext: Uint8Array }
  | { kind: "commitApplied" }
  | { kind: "proposalQueued" };

// Pinned by chat_mls_core/src/engine.rs CIPHERSUITE constant. Surfaced here
// so the chat package can stamp a header byte / cross-check at decrypt time.
// Value mirrors the openmls Ciphersuite enum discriminant for
// MLS_128_DHKEMX25519_AES128GCM_SHA256_Ed25519 (RFC 9420 cipher suite id 1).
export const MLS_CIPHERSUITE_ID = 0x0001;

// MLS GroupId fixed width — what we'll write to Chat.mlsGroupId in Chunk 4.
// Engine accepts any byte length, but standard is 32B (SHA-256 of an opaque
// label or random 32B). Centralised constant keeps callers consistent.
export const MLS_GROUP_ID_BYTES = 32;
