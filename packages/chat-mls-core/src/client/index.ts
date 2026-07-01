// Platform-agnostic MLS client SDK. All platform-specific dependencies
// (native engine, crypto primitives, chat-db, mls.* RPC) are injected via
// options — no module-level imports of RN/Expo or Node-only code. Mobile
// constructs an MlsClient by wiring ChatMlsCoreModule + expo-crypto +
// ChatCrypto + chat-db's bound mlsStore; Node test harness wires the napi
// binding + Web Crypto + @noble/ed25519 + an InMemory this.mlsStore.

import type { AddMembersResult, ProcessedKind } from "../ChatMlsCore.types";
import {
  KEY_PACKAGE_PER_DEVICE_CAP,
  KEY_PACKAGE_PUBLISH_BATCH_MAX,
  canonicalPublishProofBytes,
  type FetchKeyPackagesForAccountsOutput,
  type FetchPendingCommitsOutput,
  type FetchPendingWelcomesOutput,
  type PublishKeyPackagesInput,
  type PublishKeyPackagesOutput,
  type PublishWelcomesInput,
  type PublishWelcomesOutput,
} from "../wire";

// ── Injected engine ─────────────────────────────────────────────────────────
// Mirrors the ChatMlsCoreModule TS surface. Mobile passes the singleton from
// requireNativeModule("ChatMlsCore"); Node tests pass a per-device factory
// instance wrapping the napi MlsEngine class.

export interface MlsEngineModule {
  initEngine(accountId: string, identitySeed: Uint8Array): void;
  engineAccountId(): string;
  resetEngine(): void;
  dumpState(): Uint8Array;
  loadState(snapshot: Uint8Array): void;
  createKeyPackage(): Uint8Array;
  createGroup(groupId: Uint8Array): void;
  addMembers(groupId: Uint8Array, keyPackages: Uint8Array[]): AddMembersResult;
  removeMembersByAccounts(
    groupId: Uint8Array,
    accountIds: string[],
  ): Uint8Array;
  joinFromWelcome(welcomeBytes: Uint8Array): Uint8Array;
  encryptApp(groupId: Uint8Array, plaintext: Uint8Array): Uint8Array;
  processMessage(groupId: Uint8Array, msgBytes: Uint8Array): ProcessedKind;
  currentEpoch(groupId: Uint8Array): number;
  memberCount(groupId: Uint8Array): number;
}

// ── Injected crypto ─────────────────────────────────────────────────────────
// Three primitives consumed by MlsClient outside of MLS itself — keep small
// so adapters stay one-liners.

export interface MlsCryptoApi {
  /** sha256 of arbitrary bytes — async to allow Web Crypto / expo-crypto. */
  digestSha256(bytes: Uint8Array): Promise<Uint8Array>;
  /** N cryptographically-strong random bytes. */
  getRandomBytes(n: number): Uint8Array;
  /** Ed25519 detached signature over `message` keyed by `seed` (32B). */
  signEd25519Detached(message: Uint8Array, seed: Uint8Array): Uint8Array;
}

// ── Injected mlsStore ───────────────────────────────────────────────────────
// Pre-bound to a database handle. Mobile builds this via
// @repo/chat-db createBoundMlsStore(handle); Node tests pass an in-memory
// implementation. MlsClient never sees the underlying storage type.

export interface MlsGroupLocal {
  group_id: Uint8Array;
  chat_id: string | null;
  last_applied_epoch: number;
  joined_at: number;
}

export interface MlsGroupListItem {
  groupId: Uint8Array;
  chatId: string | null;
  lastAppliedEpoch: number;
}

export interface MlsStoreApi {
  loadEngineSnapshot(
    accountId: string,
  ): Promise<{ snapshot: Uint8Array; updated_at: number } | null>;
  saveEngineSnapshot(accountId: string, snapshot: Uint8Array): Promise<void>;
  clearEngineSnapshot(accountId: string): Promise<void>;
  upsertGroup(input: {
    groupId: Uint8Array;
    chatId?: string | null;
    initialEpoch?: number;
  }): Promise<void>;
  setLastAppliedEpoch(groupId: Uint8Array, epoch: number): Promise<void>;
  getGroup(groupId: Uint8Array): Promise<MlsGroupLocal | null>;
  listGroups(): Promise<MlsGroupListItem[]>;
  clearAllGroups(): Promise<void>;
  setChatMlsGroupId(
    chatId: string,
    groupId: Uint8Array,
  ): Promise<{ updates: number }>;
  ensureChatForDebug(
    chatId: string,
    kind?: "direct" | "group",
  ): Promise<{ created: boolean }>;
  // ADR-016: production chat-row upsert + reverse lookup. upsertChat mirrors a
  // server chat (with its mls_group_id link); chatIdByGroupId maps a joined
  // group back to its real chat row so the join path stops deriving a
  // harness chatId.
  upsertChat(input: {
    id: string;
    kind: "direct" | "group";
    name?: string | null;
    mlsGroupId?: Uint8Array | null;
  }): Promise<void>;
  chatIdByGroupId(groupId: Uint8Array): Promise<string | null>;
}

// ── Injected RPC ────────────────────────────────────────────────────────────
// The caller supplies a thin object that maps each MlsClient method to a
// concrete tRPC call. apps/mobile binds this to `trpc.mls.*`; tests can
// supply an in-memory mock without dragging the network in.

export interface MlsRpc {
  keysCount(input: { deviceId: string }): Promise<{ totalForDevice: number }>;
  keysDeleteAllForDevice(input: {
    deviceId: string;
  }): Promise<{ deleted: number }>;
  keysPublish(
    input: PublishKeyPackagesInput,
  ): Promise<PublishKeyPackagesOutput>;
  keysFetchForAccounts(input: {
    accountIds: string[];
  }): Promise<FetchKeyPackagesForAccountsOutput>;
  groupsPublishCommit(input: {
    groupIdB64: string;
    epoch: number;
    commitB64: string;
  }): Promise<{ id: string; epoch: number; createdAt: string }>;
  groupsFetchPendingCommits(input: {
    groupIdB64: string;
    sinceEpoch: number;
  }): Promise<FetchPendingCommitsOutput>;
  groupsPublishWelcomes(
    input: PublishWelcomesInput,
  ): Promise<PublishWelcomesOutput>;
  groupsFetchPendingWelcomes(): Promise<FetchPendingWelcomesOutput>;
}

// ── Defaults ────────────────────────────────────────────────────────────────

/** Aim for this many KeyPackages in the server pool. Phase 1: 100 — see
 *  README §M3.5 "Forward secrecy + recovery". */
export const DEFAULT_KP_POOL_TARGET = 100;
/** Top up when server-reported total drops below this. */
export const DEFAULT_KP_POOL_THRESHOLD = 20;
/** Hard ceiling on conflict-retries inside publishCommit. After this many
 *  retries the caller surfaces the error — something more than racing is
 *  wrong (clock skew, byzantine peer, etc.). */
const PUBLISH_COMMIT_MAX_RETRIES = 5;

// ── Helpers ─────────────────────────────────────────────────────────────────

function toB64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++)
    bin += String.fromCharCode(bytes[i] ?? 0);
  // RN provides global btoa via Hermes.
  return btoa(bin);
}

function fromB64(s: string): Uint8Array {
  // RN provides global atob via Hermes.
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// Stable short hex of the first 8 bytes — used to derive a deterministic
// harness chatId from a GroupId so founder + joiner converge on the same
// chats row without out-of-band coordination. Production chat-create
// (M4) replaces this with a server-issued chatId.
function hexShort(bytes: Uint8Array): string {
  const n = Math.min(bytes.length, 8);
  let s = "";
  for (let i = 0; i < n; i++)
    s += (bytes[i] ?? 0).toString(16).padStart(2, "0");
  return s;
}

// ── MlsClient ───────────────────────────────────────────────────────────────

export interface MlsClientOptions {
  accountId: string;
  deviceId: string;
  /** M3 identity seed — used to derive the Ed25519 signer that signs the
   *  publish-proof and the same seed that backs the MLS BasicCredential
   *  (ADR-015 §5). */
  identitySeed: Uint8Array;
  rpc: MlsRpc;
  engine: MlsEngineModule;
  crypto: MlsCryptoApi;
  mlsStore: MlsStoreApi;
  /** M6 (ADR-013): invoked with the raw engine snapshot after every
   *  successful persistSnapshot(). Mobile wires this to write a sealed copy
   *  to the iOS NSE / Android FMS shared container so the extension can
   *  decrypt incoming push payloads. Errors here MUST NOT throw — push is
   *  best-effort and a write failure should not break the in-app send path. */
  onAfterPersistSnapshot?: (snapshot: Uint8Array) => Promise<void> | void;
}

export class MlsClient {
  private readonly accountId: string;
  private readonly deviceId: string;
  private readonly identitySeed: Uint8Array;
  private readonly rpc: MlsRpc;
  private readonly engine: MlsEngineModule;
  private readonly crypto: MlsCryptoApi;
  private readonly mlsStore: MlsStoreApi;
  private readonly onAfterPersistSnapshot?: (
    snapshot: Uint8Array,
  ) => Promise<void> | void;
  /** Last server-reported pool size for this device. Set by topUp; consulted
   *  by maybeTopUp before issuing a publish. Sticky across MlsClient
   *  instances within a process — fresh boots refetch via a single
   *  zero-publish call when this is null. */
  private lastKnownPoolSize: number | null = null;

  constructor(opts: MlsClientOptions) {
    this.accountId = opts.accountId;
    this.deviceId = opts.deviceId;
    this.identitySeed = opts.identitySeed;
    this.rpc = opts.rpc;
    this.engine = opts.engine;
    this.crypto = opts.crypto;
    this.mlsStore = opts.mlsStore;
    this.onAfterPersistSnapshot = opts.onAfterPersistSnapshot;
  }

  // Construct the native engine + restore the previous snapshot if one
  // exists. Idempotent across calls within a process — re-running with the
  // same accountId is a no-op on the native side; the snapshot reload is
  // guarded by this.engine.engineAccountId().
  async bootstrap(): Promise<{ source: "fresh" | "snapshot" }> {
    this.engine.initEngine(this.accountId, this.identitySeed);
    const row = await this.mlsStore.loadEngineSnapshot(this.accountId);
    if (row) {
      this.engine.loadState(row.snapshot);
      // Repair pass — backfills chats.mls_group_id for any mls_group row
      // joined before the pollWelcomes-linking patch existed. Idempotent;
      // skips rows already correctly linked. Drops out as a no-op once M4
      // chat-create RPC replaces the harness convention.
      await this.repairChatLinks();
      return { source: "snapshot" };
    }
    // No local snapshot — engine starts empty. If the server still holds
    // KPs for this device from a prior install / wipe / app reinstall,
    // those KPs are orphaned (the privkey material lived in the lost
    // snapshot). Anyone consuming an orphan KP gets an unjoinable Welcome.
    // Wipe them so the upcoming topUp publishes a fresh batch the engine
    // can actually back. Best-effort.
    try {
      const out = await this.rpc.keysDeleteAllForDevice({
        deviceId: this.deviceId,
      });
      if (out.deleted > 0) {
        console.log(
          `[mls] bootstrap (fresh) cleared ${out.deleted} orphan server KP(s)`,
        );
      }
    } catch (err) {
      console.warn(
        "[mls] bootstrap (fresh): keysDeleteAllForDevice failed",
        err,
      );
    }
    return { source: "fresh" };
  }

  // Top up the server-side KeyPackage pool toward `target`. Returns
  // `{ published }` so callers (debug screens, tests) can assert. Idempotent
  // — if the pool is already at target, returns `{ published: 0 }` without
  // hitting the network.
  async topUpKeyPackagesIfBelow(
    target: number = DEFAULT_KP_POOL_TARGET,
    threshold: number = DEFAULT_KP_POOL_THRESHOLD,
  ): Promise<{ published: number; totalForDevice: number }> {
    if (target > KEY_PACKAGE_PER_DEVICE_CAP)
      target = KEY_PACKAGE_PER_DEVICE_CAP;

    // First boot of the process: ask the server how many KPs we currently
    // have. This avoids hitting the cap on devices with stale KPs left
    // over from a reset (engine lost the privkeys but server still holds
    // the pubs). One read query > an optimistic publish that could fail.
    if (this.lastKnownPoolSize === null) {
      const { totalForDevice } = await this.rpc.keysCount({
        deviceId: this.deviceId,
      });
      this.lastKnownPoolSize = totalForDevice;
    }

    const deficit = Math.max(0, target - this.lastKnownPoolSize);
    if (deficit <= threshold && this.lastKnownPoolSize >= threshold) {
      return { published: 0, totalForDevice: this.lastKnownPoolSize };
    }

    let totalPublished = 0;
    while (this.lastKnownPoolSize < target) {
      const remaining = target - this.lastKnownPoolSize;
      const batch = Math.min(remaining, KEY_PACKAGE_PUBLISH_BATCH_MAX);
      const out = await this.publishKeyPackagesBatch(batch);
      totalPublished += out.published;
      this.lastKnownPoolSize = out.totalForDevice;
      if (out.published === 0) break; // cap reached server-side
    }

    return {
      published: totalPublished,
      totalForDevice: this.lastKnownPoolSize,
    };
  }

  // Apply pending Welcomes addressed to this account. Consume-on-fetch on
  // the server, so re-running this immediately after a successful call
  // returns 0 fresh ones. Returns the GroupIds joined this round so the
  // caller (UI) can refresh their chat list.
  async pollPendingWelcomes(): Promise<{ joinedGroupIds: Uint8Array[] }> {
    const { welcomes } = await this.rpc.groupsFetchPendingWelcomes();
    const joined: Uint8Array[] = [];
    for (const w of welcomes) {
      const welcomeBytes = fromB64(w.welcomeB64);
      let groupId: Uint8Array;
      try {
        groupId = this.engine.joinFromWelcome(welcomeBytes);
      } catch (err) {
        // Welcome may be addressed to a different device under the same
        // account (recipientDeviceId narrowing not applied), or the engine
        // already processed an equivalent Welcome — skip silently.
        console.warn(
          "[mls] joinFromWelcome rejected a welcome — skipping",
          err,
        );
        continue;
      }
      // Joiner-side chat-row link (Chunk 7 harness interim — M4 chat-create
      // RPC will replace this with a server-synced row). The Welcome itself
      // doesn't carry an application chatId; we derive a deterministic one
      // from the GroupId so both sides converge on the same row without
      // out-of-band coordination. M4 hashes/IDs flow through Chat.create
      // proper.
      // Prefer the real server chatId (ADR-016): the chat.list sync populates
      // chats.mls_group_id, so we can reverse-map the joined group to its chat
      // row. Fall back to the interim harness id only when that mapping hasn't
      // synced yet — a later chat.list sync heals it via relinkGroupChatId, and
      // resolveChatGroupId keys off the real row regardless.
      const realChatId = await this.mlsStore.chatIdByGroupId(groupId);
      const chatId = realChatId ?? `mls-${hexShort(groupId)}`;
      await this.mlsStore.upsertChat({
        id: chatId,
        kind: "group",
        mlsGroupId: groupId,
      });
      await this.mlsStore.upsertGroup({
        groupId,
        chatId,
        initialEpoch: this.engine.currentEpoch(groupId),
      });
      joined.push(groupId);
    }
    if (welcomes.length > 0) await this.persistSnapshot();
    return { joinedGroupIds: joined };
  }

  // Fetch + apply all pending commits for `groupId` past the local epoch
  // cursor. Stops on the first malformed/rejected commit (the server log is
  // gap-free for non-byzantine peers; a gap means an attack — surface, don't
  // skip). Returns the new last_applied_epoch.
  async pollPendingCommits(
    groupId: Uint8Array,
  ): Promise<{ applied: number; lastAppliedEpoch: number }> {
    const local = await this.mlsStore.getGroup(groupId);
    if (!local) {
      throw new Error("[mls] pollPendingCommits called for unknown group");
    }
    const since = local.last_applied_epoch + 1;
    const { commits } = await this.rpc.groupsFetchPendingCommits({
      groupIdB64: toB64(groupId),
      sinceEpoch: since,
    });

    let applied = 0;
    let lastApplied = local.last_applied_epoch;
    for (const c of commits) {
      const result = this.engine.processMessage(groupId, fromB64(c.commitB64));
      if (result.kind !== "commitApplied") {
        throw new Error(
          `[mls] expected commitApplied at epoch ${c.epoch}, got ${result.kind}`,
        );
      }
      lastApplied = c.epoch;
      applied++;
    }
    if (applied > 0) {
      await this.mlsStore.setLastAppliedEpoch(groupId, lastApplied);
      await this.persistSnapshot();
    }
    return { applied, lastAppliedEpoch: lastApplied };
  }

  // Publish a Commit produced by a local mutating engine op (createGroup
  // returns no commit; addMembers + future remove/update do). The engine's
  // own currentEpoch is the epoch we publish at — server gate rejects with
  // CONFLICT if another commit beat us. On conflict: pull pending, apply,
  // ask the caller to re-derive the commit at the new epoch.
  //
  // This intentionally does NOT auto-rebuild the commit. The caller (e.g.
  // an addMembers flow) needs to decide whether their op still makes sense
  // after applying the racing commits — for member-add it may, but the
  // cleaner UX is to surface the conflict and let the caller decide.
  async publishCommit(input: {
    groupId: Uint8Array;
    epoch: number;
    commitBytes: Uint8Array;
  }): Promise<{ id: string; epoch: number; createdAt: string }> {
    // Conflict surfaces straight back to the caller — publishCommitWithRetry
    // catches it; non-retrying callers (e.g. UI add-members) decide what to
    // do after pollPendingCommits.
    const res = await this.rpc.groupsPublishCommit({
      groupIdB64: toB64(input.groupId),
      epoch: input.epoch,
      commitB64: toB64(input.commitBytes),
    });
    // Caller's engine merged the pending commit locally before calling
    // publishCommit, so the local epoch already matches input.epoch.
    // Just bump the cursor so a subsequent poll asks for sinceEpoch+1.
    await this.mlsStore.setLastAppliedEpoch(input.groupId, input.epoch);
    await this.persistSnapshot();
    return res;
  }

  // Convenience wrapper for the conflict-retry loop. Useful from non-UI
  // call sites that just want "land my commit eventually" semantics. The
  // `rebuildCommit` callback is invoked with the new epoch after each
  // applied racing commit; the caller re-runs their MLS op and returns
  // the freshly-produced commit bytes.
  async publishCommitWithRetry(input: {
    groupId: Uint8Array;
    initialEpoch: number;
    initialCommit: Uint8Array;
    rebuildCommit: (newEpoch: number) => Uint8Array;
  }): Promise<{ id: string; epoch: number }> {
    let epoch = input.initialEpoch;
    let commit = input.initialCommit;
    for (let attempt = 0; attempt < PUBLISH_COMMIT_MAX_RETRIES; attempt++) {
      try {
        const res = await this.publishCommit({
          groupId: input.groupId,
          epoch,
          commitBytes: commit,
        });
        return { id: res.id, epoch: res.epoch };
      } catch (err) {
        // Conflict surfaces from the server router as a tRPC CONFLICT —
        // detect via the message text since the RPC layer is injected and
        // we can't depend on a specific tRPC error shape here.
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes("already published")) throw err;
        const { lastAppliedEpoch } = await this.pollPendingCommits(
          input.groupId,
        );
        epoch = lastAppliedEpoch + 1;
        commit = input.rebuildCommit(epoch);
      }
    }
    throw new Error(
      `[mls] publishCommit exceeded ${PUBLISH_COMMIT_MAX_RETRIES} retries — group ratchet likely diverged`,
    );
  }

  // Publish Welcomes produced by an addMembers op. One row per recipient
  // device — the caller passes the device list from fetchForAccounts so
  // routing is deterministic.
  async publishWelcomes(input: {
    groupId: Uint8Array;
    welcomeBytes: Uint8Array;
    recipients: Array<{
      recipientAccountId: string;
      recipientDeviceId?: string | null;
    }>;
  }): Promise<{ delivered: number }> {
    const welcomeB64 = toB64(input.welcomeBytes);
    const res = await this.rpc.groupsPublishWelcomes({
      groupIdB64: toB64(input.groupId),
      recipients: input.recipients.map((r) => ({
        recipientAccountId: r.recipientAccountId,
        recipientDeviceId: r.recipientDeviceId ?? null,
        welcomeB64,
      })),
    });
    return res;
  }

  // ── Lifecycle helpers (Chunk 7 acceptance harness) ───────────────────────
  // Compose the per-step engine + RPC + chat-db plumbing that the README
  // §M3.5 acceptance scenarios drive. Each returns enough info for a debug
  // screen to render the result inline.

  // Create a brand-new MLS group with this engine as the sole founder.
  // Allocates a random 32B GroupId (server doesn't care about content; MLS
  // GroupId is opaque per ADR-015 §3). Optionally links the new group to an
  // existing chat row via setChatMlsGroupId — when provided, subsequent
  // sends to that chatId automatically take the v=2 path.
  async createGroup(input?: {
    chatId?: string | null;
  }): Promise<{ groupId: Uint8Array }> {
    const groupId = this.crypto.getRandomBytes(32);
    this.engine.createGroup(groupId);
    await this.mlsStore.upsertGroup({
      groupId,
      chatId: input?.chatId ?? null,
      initialEpoch: this.engine.currentEpoch(groupId),
    });
    if (input?.chatId) {
      await this.mlsStore.setChatMlsGroupId(input.chatId, groupId);
    }
    await this.persistSnapshot();
    return { groupId };
  }

  // Add one or more peer accounts to an existing group. Resolves a fresh
  // KeyPackage per device for each account via mls.keys.fetchForAccounts
  // (consume-on-fetch — the KPs are gone server-side after this returns),
  // then runs engine.addMembers → publishCommit → publishWelcomes.
  //
  // Returns the per-account device list that was added so the caller can
  // surface which devices joined the round.
  async addMembersByAccounts(input: {
    groupId: Uint8Array;
    accountIds: string[];
  }): Promise<{
    devicesAdded: Array<{ accountId: string; deviceId: string }>;
    epoch: number;
  }> {
    if (input.accountIds.length === 0) {
      throw new Error("[mls] addMembersByAccounts requires ≥1 accountId");
    }
    const byAccount = await this.rpc.keysFetchForAccounts({
      accountIds: input.accountIds,
    });

    const kpBytes: Uint8Array[] = [];
    const recipients: Array<{
      recipientAccountId: string;
      recipientDeviceId: string;
    }> = [];
    for (const accountId of input.accountIds) {
      const bundles = byAccount[accountId] ?? [];
      for (const b of bundles) {
        kpBytes.push(fromB64(b.keyPackageB64));
        recipients.push({
          recipientAccountId: accountId,
          recipientDeviceId: b.deviceId,
        });
      }
    }
    if (kpBytes.length === 0) {
      throw new Error(
        "[mls] addMembersByAccounts: no KeyPackages available for the requested accounts — top-up needed",
      );
    }

    // engine.addMembers merges the pending commit locally before returning
    // — local epoch is now `previous + 1`. The server hasn't seen it yet;
    // publishCommit posts the commit at that new epoch.
    const result = this.engine.addMembers(input.groupId, kpBytes);
    const epoch = this.engine.currentEpoch(input.groupId);

    // Persist BEFORE shipping the commit. If the network step fails the
    // engine's local epoch is already incremented; on retry the
    // publishCommit will hit a CONFLICT and the caller would have to
    // pollPendingCommits + re-derive. That's the right failure mode (no
    // private-key loss).
    await this.persistSnapshot();

    await this.publishCommit({
      groupId: input.groupId,
      epoch,
      commitBytes: result.commit,
    });

    await this.publishWelcomes({
      groupId: input.groupId,
      welcomeBytes: result.welcome,
      recipients: recipients.map((r) => ({
        recipientAccountId: r.recipientAccountId,
        recipientDeviceId: r.recipientDeviceId,
      })),
    });

    return {
      devicesAdded: recipients.map((r) => ({
        accountId: r.recipientAccountId,
        deviceId: r.recipientDeviceId,
      })),
      epoch,
    };
  }

  // Remove one or more accounts from an existing group. Engine matches each
  // accountId against current BasicCredential identity bytes, emits a single
  // Commit, advances the local epoch. Remove is unidirectional — no Welcome.
  // Server router treats this Commit identically to any other (groups router
  // is proposal-agnostic per ADR-015).
  //
  // Removed members continue to hold any pre-remove ciphertexts they had,
  // but their group state is frozen at epoch N when the Commit lands at
  // epoch N+1 — subsequent app messages won't decrypt for them.
  async removeMembersByAccounts(input: {
    groupId: Uint8Array;
    accountIds: string[];
  }): Promise<{ epoch: number }> {
    if (input.accountIds.length === 0) {
      throw new Error("[mls] removeMembersByAccounts requires ≥1 accountId");
    }

    const commit = this.engine.removeMembersByAccounts(
      input.groupId,
      input.accountIds,
    );
    const epoch = this.engine.currentEpoch(input.groupId);

    // Persist BEFORE shipping — same failure-mode rationale as addMembers:
    // engine's local epoch is already incremented, retry would CONFLICT and
    // caller pollPendingCommits + re-derives.
    await this.persistSnapshot();

    await this.publishCommit({
      groupId: input.groupId,
      epoch,
      commitBytes: commit,
    });

    return { epoch };
  }

  // Drop the in-memory MLS engine + the chat-db snapshot + the local group
  // registry. Used by the README acceptance scenario "multi-account swap on
  // same install" and by the debug "reset engine" button. Does NOT touch
  // server-side KeyPackages — those expire by consume, or by re-publish
  // under a fresh device.
  //
  // chats.mls_group_id columns are LEFT in place; the chat rows outlive
  // groups per ADR-015 §7. Any future create-group on those chat rows
  // overwrites the column.
  async reset(): Promise<void> {
    this.engine.resetEngine();
    await this.mlsStore.clearEngineSnapshot(this.accountId);
    await this.mlsStore.clearAllGroups();
    this.lastKnownPoolSize = null;
    // Wipe server-side KPs too — the engine just lost the privkeys that
    // matched them, so any future join attempt using a stale KP would
    // dead-end on the joiner side. Best-effort: log + continue if the
    // server can't be reached.
    try {
      const out = await this.rpc.keysDeleteAllForDevice({
        deviceId: this.deviceId,
      });
      console.log(`[mls] reset wiped ${out.deleted} server-side KP(s)`);
    } catch (err) {
      console.warn("[mls] reset: keysDeleteAllForDevice failed", err);
    }
    // Re-init the engine so background tasks (auto-publish timer, send path)
    // don't trip "engine not initialised" until the next bootstrap. The
    // caller is still signed in as the same account — reset is "wipe state",
    // not "log out".
    this.engine.initEngine(this.accountId, this.identitySeed);
  }

  // Wipe ONLY the server-side KeyPackage pool for this device. Engine state
  // is untouched. Used by the acceptance harness to simulate exhaustion:
  // after drain, the next fetchForAccounts(this account) returns []; a peer
  // attempting addMembersByAccounts on us hits the "no KeyPackages available"
  // throw. The auto-publish tick will refill on its next firing (30s loop),
  // so test windows are short.
  async drainServerKeyPackages(): Promise<{ deleted: number }> {
    const out = await this.rpc.keysDeleteAllForDevice({
      deviceId: this.deviceId,
    });
    this.lastKnownPoolSize = 0;
    return out;
  }

  // Snapshot the entire engine to chat-db. Called after every mutating
  // engine op. Fast at Phase 1 scale (single SQLCipher UPSERT of a
  // <500KB blob); the M8 StorageProvider replaces this with per-entry
  // writes when typical-user storage profiles outgrow it.
  async persistSnapshot(): Promise<void> {
    const snapshot = this.engine.dumpState();
    await this.mlsStore.saveEngineSnapshot(this.accountId, snapshot);
    if (this.onAfterPersistSnapshot) {
      try {
        await this.onAfterPersistSnapshot(snapshot);
      } catch (err) {
        // Best-effort. Push notification decrypt is allowed to degrade to
        // a generic "New message" fallback in the NSE/FMS if the snapshot
        // is stale or missing — surfacing this error would break the send
        // path, which is unrelated. Log + continue.
        console.error("[mls/persistSnapshot] onAfter callback failed", err);
      }
    }
  }

  // Local view of the KeyPackage pool — the value the server returned on
  // the last publish. Null until topUpKeyPackagesIfBelow has run at least
  // once this process. Used by the debug screen + the auto-publish timer.
  get knownPoolSize(): number | null {
    return this.lastKnownPoolSize;
  }

  // ── Internal helpers ──────────────────────────────────────────────────────

  // Backfill chats.mls_group_id for mls_group rows joined before
  // pollPendingWelcomes started linking automatically. The harness chatId
  // is the same `mls-<hex>` convention both sides use, so the founder and
  // joiner converge on the same row. Idempotent: a row already linked
  // takes the UPDATE path but sets the same bytes.
  private async repairChatLinks(): Promise<void> {
    const groups = await this.mlsStore.listGroups();
    for (const g of groups) {
      const harnessChatId = `mls-${hexShort(g.groupId)}`;
      await this.mlsStore.ensureChatForDebug(harnessChatId, "group");
      await this.mlsStore.setChatMlsGroupId(harnessChatId, g.groupId);
      // Update the mls_group row's chat_id field too if it's null, so
      // listGroups results stay consistent with the chats join.
      if (g.chatId == null) {
        await this.mlsStore.upsertGroup({
          groupId: g.groupId,
          chatId: harnessChatId,
        });
      }
    }
  }

  // Single-batch publish: generate `count` KPs from the engine, build the
  // proof, ship. Used by the top-up loop above; kept private because the
  // top-up loop owns the pool-size accounting.
  private async publishKeyPackagesBatch(count: number): Promise<{
    published: number;
    totalForDevice: number;
  }> {
    if (count < 1) return { published: 0, totalForDevice: 0 };
    const cap = Math.min(count, KEY_PACKAGE_PUBLISH_BATCH_MAX);

    const kpBytesList: Uint8Array[] = [];
    for (let i = 0; i < cap; i++) {
      kpBytesList.push(this.engine.createKeyPackage());
    }

    // Sha256 over concatenated KP bytes — must match the server-side digest
    // order exactly. canonicalPublishProofBytes() then prefixes the version
    // byte + deviceId so the same canonical bytes verify on both sides.
    const total = kpBytesList.reduce((a, b) => a + b.length, 0);
    const concat = new Uint8Array(total);
    let off = 0;
    for (const kp of kpBytesList) {
      concat.set(kp, off);
      off += kp.length;
    }
    const digest = await this.crypto.digestSha256(concat);
    const canonical = canonicalPublishProofBytes(this.deviceId, digest);
    const sig = this.crypto.signEd25519Detached(canonical, this.identitySeed);

    const out = await this.rpc.keysPublish({
      deviceId: this.deviceId,
      keyPackagesB64: kpBytesList.map(toB64),
      proofSigB64: toB64(sig),
    });

    // KP private key material now lives inside the engine storage — persist
    // before the proof leaves a window where a crash loses the priv state
    // but the server already accepted the pub.
    await this.persistSnapshot();
    return out;
  }
}
