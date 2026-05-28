import { NativeModule, requireNativeModule } from "expo";

import type {
  AddMembersResult,
  ChatMlsCoreModuleEvents,
  ProcessedKind,
} from "./ChatMlsCore.types";

declare class ChatMlsCoreModule extends NativeModule<ChatMlsCoreModuleEvents> {
  // ── Chunk 0/1 smoke probe — kept until Chunk 6 ────────────────────────────
  // Calls into the UniFFI-generated `ping()` exposed by the chat_mls_core
  // crate. Returns "ok" iff the xcframework/jniLibs loaded and the Swift/
  // Kotlin → Rust FFI hop succeeds end-to-end.
  ping(): string;

  // ── Engine lifecycle ──────────────────────────────────────────────────────
  // Construct the singleton MlsEngine for the active account. `identitySeed`
  // is the 32-byte M3 master seed (read from the secure keychain group via
  // ChatCrypto.loadSeed()). The MLS signer is derived deterministically from
  // it; across launches the same seed → same signer → group state survives.
  //
  // Idempotent when called with the SAME accountId; re-construction with a
  // DIFFERENT accountId throws (caller must resetEngine() first to wipe the
  // prior engine's in-memory state). The constructor does NOT load any
  // snapshot — caller follows up with loadState(bytes) if a prior snapshot
  // exists for this account in chat-db.
  initEngine(accountId: string, identitySeed: Uint8Array): void;

  // Returns the accountId the engine was constructed for, or throws if no
  // engine is initialised. Useful for the auth-change hook to confirm the
  // engine is bound to the same account before continuing.
  engineAccountId(): string;

  // Drop the in-memory MlsEngine + all its group state. Used when switching
  // accounts on the same install, or as a debug reset. Idempotent (no-op
  // when no engine exists).
  resetEngine(): void;

  // ── State persistence (Chunk 2.5) ─────────────────────────────────────────
  // Serialize the entire engine state — groups, key packages, signature
  // keys, all OpenMLS-managed key material — into opaque bytes. Caller
  // persists to chat-db (already SQLCipher-encrypted via op-sqlite from M2)
  // after every mutating engine method. Format is internal to chat-mls-core;
  // bytes from one OpenMLS version are NOT guaranteed to load on another.
  dumpState(): Uint8Array;

  // Restore engine state from a prior dumpState() output. Replaces the
  // in-memory storage in-place and clears the group handle cache (next
  // group op re-loads from the restored storage). Validates a magic header
  // before mutating state — corrupt/wrong-version blobs are rejected.
  loadState(snapshot: Uint8Array): void;

  // ── KeyPackage publish ────────────────────────────────────────────────────
  // Generate one fresh KeyPackage for this device. The returned bytes are
  // the TLS-encoded public KeyPackage; ship to the server prekey directory
  // via the Chunk 4 mls-keys.publishKeyPackages route. The matching private
  // material stays inside the engine's storage and is consumed when this
  // device joins a group via joinFromWelcome.
  createKeyPackage(): Uint8Array;

  // ── Group lifecycle ───────────────────────────────────────────────────────
  // Create a brand-new group with this engine as the sole founder. groupId
  // is opaque to MLS (any 32 bytes); MLS_GROUP_ID_BYTES constant defines the
  // convention. Caller persists the groupId to Chat.mlsGroupId server-side.
  createGroup(groupId: Uint8Array): void;

  // Add one or more peers to an existing group. keyPackages are the wire
  // bytes fetched from the server (mls-keys.fetchKeyPackagesForAccounts in
  // Chunk 4). The returned `commit` fans to all CURRENT members; `welcome`
  // ships to the new joiners. The pending commit is merged into local state
  // before this call returns — no second call needed.
  addMembers(groupId: Uint8Array, keyPackages: Uint8Array[]): AddMembersResult;

  // Remove peers from an existing group by accountId. Engine resolves each
  // accountId to a LeafNodeIndex by matching BasicCredential bytes, emits a
  // single Commit (no Welcome — Remove is unidirectional), and merges the
  // pending commit into local state before returning the Commit bytes.
  // Caller fans the Commit via publishCommit; remaining members apply it.
  removeMembersByAccounts(
    groupId: Uint8Array,
    accountIds: string[],
  ): Uint8Array;

  // Process a Welcome received from another member's add_members call. The
  // engine extracts the GroupId from the Welcome and stores the new group
  // locally; the returned bytes are that same GroupId so the caller can route
  // subsequent messages to it without re-parsing.
  joinFromWelcome(welcomeBytes: Uint8Array): Uint8Array;

  // ── Application messages ──────────────────────────────────────────────────
  // Encrypt plaintext for the named group. The returned bytes are an
  // MlsMessageOut — server stores ONE blob and fans to all members (the v=2
  // wire frame from §M3.5). Forward secrecy: the key material is discarded
  // immediately; the sender cannot decrypt its own output.
  encryptApp(groupId: Uint8Array, plaintext: Uint8Array): Uint8Array;

  // Process any incoming MLS message for a group. Switches on the inner
  // content type (Application | Commit | Proposal) and returns the typed
  // ProcessedKind. Commits are auto-merged into local state; Proposals are
  // stored as pending (caller can promote them in a future chunk).
  processMessage(groupId: Uint8Array, msgBytes: Uint8Array): ProcessedKind;

  // ── Group state introspection ─────────────────────────────────────────────
  // Current MLS epoch counter for the named group — increments by one each
  // time a Commit is merged. Used by the Chunk 4 server-side ordering gate
  // (server refuses out-of-order commits) and the Chunk 7 acceptance harness.
  // Returned as JS number; safe up to 2^53 epochs (practically unreachable).
  currentEpoch(groupId: Uint8Array): number;

  // Member count for the named group, including self. Used by the debug
  // harness + the Chunk 6 group-lifecycle pre-flight checks.
  memberCount(groupId: Uint8Array): number;
}

export default requireNativeModule<ChatMlsCoreModule>("ChatMlsCore");
