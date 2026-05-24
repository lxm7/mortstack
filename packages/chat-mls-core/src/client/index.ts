// RN-only MLS client SDK. Wraps the ChatMlsCore native module + chat-db +
// an injected mls.* RPC surface. Lives under `@repo/chat-mls-core/client` so
// callers (apps/mobile) get a typed boundary without the server pulling RN
// native deps.
//
// The RPC interface is injected (not imported) so this package never depends
// on the tRPC client/AppRouter — keeps the monorepo edges clean.

import * as Crypto from "expo-crypto";
import { ChatCrypto } from "@repo/chat-crypto";
import { mls as mlsStore, type ChatDbHandle } from "@repo/chat-db";
import ChatMlsCore from "../ChatMlsCoreModule";
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

// ── Injected RPC ────────────────────────────────────────────────────────────
// The caller supplies a thin object that maps each MlsClient method to a
// concrete tRPC call. apps/mobile binds this to `trpc.mls.*`; tests can
// supply an in-memory mock without dragging the network in.

export interface MlsRpc {
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

async function sha256(bytes: Uint8Array): Promise<Uint8Array> {
  // expo-crypto.digest types its arg as BufferSource (= ArrayBuffer | view),
  // but Uint8Array<ArrayBufferLike> from RN's lib narrows to view+SAB which
  // BufferSource rejects in TS 5.x. The runtime accepts either; cast.
  const buf = await Crypto.digest(
    Crypto.CryptoDigestAlgorithm.SHA256,
    bytes as unknown as ArrayBuffer,
  );
  return new Uint8Array(buf);
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
  db: ChatDbHandle;
}

export class MlsClient {
  private readonly accountId: string;
  private readonly deviceId: string;
  private readonly identitySeed: Uint8Array;
  private readonly rpc: MlsRpc;
  private readonly db: ChatDbHandle;
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
    this.db = opts.db;
  }

  // Construct the native engine + restore the previous snapshot if one
  // exists. Idempotent across calls within a process — re-running with the
  // same accountId is a no-op on the native side; the snapshot reload is
  // guarded by ChatMlsCore.engineAccountId().
  async bootstrap(): Promise<{ source: "fresh" | "snapshot" }> {
    ChatMlsCore.initEngine(this.accountId, this.identitySeed);
    const row = await mlsStore.loadEngineSnapshot(this.db.db, this.accountId);
    if (row) {
      ChatMlsCore.loadState(row.snapshot);
      return { source: "snapshot" };
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

    // First boot of the process: we don't know the pool size yet. Read it
    // by publishing zero KPs — except the wire schema requires ≥1 per call.
    // Instead, optimistically aim for `threshold + 1` KPs so the publish
    // both surfaces the totalForDevice in its response AND tops up by a
    // small amount in the worst case. The cap rejects gracefully if we
    // were already at the ceiling.
    if (this.lastKnownPoolSize === null) {
      const published = await this.publishKeyPackagesBatch(threshold + 1);
      this.lastKnownPoolSize = published.totalForDevice;
      if (published.totalForDevice >= target) {
        return {
          published: published.published,
          totalForDevice: published.totalForDevice,
        };
      }
      // Fall through to top up the rest.
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
        groupId = ChatMlsCore.joinFromWelcome(welcomeBytes);
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
      await mlsStore.upsertGroup(this.db.db, {
        groupId,
        initialEpoch: ChatMlsCore.currentEpoch(groupId),
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
    const local = await mlsStore.getGroup(this.db.db, groupId);
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
      const result = ChatMlsCore.processMessage(groupId, fromB64(c.commitB64));
      if (result.kind !== "commitApplied") {
        throw new Error(
          `[mls] expected commitApplied at epoch ${c.epoch}, got ${result.kind}`,
        );
      }
      lastApplied = c.epoch;
      applied++;
    }
    if (applied > 0) {
      await mlsStore.setLastAppliedEpoch(this.db.db, groupId, lastApplied);
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
    await mlsStore.setLastAppliedEpoch(this.db.db, input.groupId, input.epoch);
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
    const groupId = Crypto.getRandomBytes(32);
    ChatMlsCore.createGroup(groupId);
    await mlsStore.upsertGroup(this.db.db, {
      groupId,
      chatId: input?.chatId ?? null,
      initialEpoch: ChatMlsCore.currentEpoch(groupId),
    });
    if (input?.chatId) {
      await mlsStore.setChatMlsGroupId(this.db.db, input.chatId, groupId);
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
    const result = ChatMlsCore.addMembers(input.groupId, kpBytes);
    const epoch = ChatMlsCore.currentEpoch(input.groupId);

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
    ChatMlsCore.resetEngine();
    await mlsStore.clearEngineSnapshot(this.db.db, this.accountId);
    await mlsStore.clearAllGroups(this.db.db);
    this.lastKnownPoolSize = null;
  }

  // Snapshot the entire engine to chat-db. Called after every mutating
  // engine op. Fast at Phase 1 scale (single SQLCipher UPSERT of a
  // <500KB blob); the M8 StorageProvider replaces this with per-entry
  // writes when typical-user storage profiles outgrow it.
  async persistSnapshot(): Promise<void> {
    const snapshot = ChatMlsCore.dumpState();
    await mlsStore.saveEngineSnapshot(this.db.db, this.accountId, snapshot);
  }

  // Local view of the KeyPackage pool — the value the server returned on
  // the last publish. Null until topUpKeyPackagesIfBelow has run at least
  // once this process. Used by the debug screen + the auto-publish timer.
  get knownPoolSize(): number | null {
    return this.lastKnownPoolSize;
  }

  // ── Internal helpers ──────────────────────────────────────────────────────

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
      kpBytesList.push(ChatMlsCore.createKeyPackage());
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
    const digest = await sha256(concat);
    const canonical = canonicalPublishProofBytes(this.deviceId, digest);
    const sig = ChatCrypto.signDetached(canonical, this.identitySeed);

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
