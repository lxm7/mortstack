import { AppState, type AppStateStatus } from "react-native";
import { getChatDb, mls as mlsStore } from "@repo/chat-db";
import { MlsClient, type MlsRpc } from "@repo/chat-mls-core/client";
import { trpc } from "@/lib/trpc/client";
import { loadSessionToken } from "@/lib/auth/session";
import { useAuthStore } from "@/store/auth";
import { getOrCreateChatIdentity } from "./identity";

// MLS auto-publish + poll loop. Mirrors `auto-publish.ts` for M3 but owns the
// MLS-side responsibilities:
//   1. Bootstrap the engine for the signed-in account (load snapshot or fresh).
//   2. Top up the KeyPackage pool to 100 if server-reported total < 20.
//   3. Poll pending Welcomes on every tick (cheap; consume-on-fetch).
//   4. Poll pending Commits per joined group on every tick.
//
// Chunk 6 will swap the timer/foreground polling for DO-pushed signals over
// the existing chat-ws channel. The shim here is intentionally throwaway —
// keep it simple and visible.

const POLL_INTERVAL_MS = 30_000;

// Track which AuthUser.id we last bootstrapped for. Re-bootstrap on actual
// user change (sign-out + sign-in as someone else on the same install);
// no-op on transient profile-switch updates within the same user.
let bootstrappedForUserId: string | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let appStateSub: { remove: () => void } | null = null;
let lastAppState: AppStateStatus = AppState.currentState;
// Singleton MlsClient for the current signed-in account. Re-created when the
// user changes; null between sign-out and the next sign-in.
let client: MlsClient | null = null;

// Wire the injected RPC adapter — pulls each method off the typed tRPC
// client. Kept inline (not in a separate file) because it's the only
// adapter we need and lives near its single caller.
function makeRpc(): MlsRpc {
  return {
    keysPublish: (input) => trpc.mls.keys.publish.mutate(input),
    keysFetchForAccounts: (input) =>
      trpc.mls.keys.fetchForAccounts.query(input),
    groupsPublishCommit: (input) => trpc.mls.groups.publishCommit.mutate(input),
    groupsFetchPendingCommits: (input) =>
      trpc.mls.groups.fetchPendingCommits.query(input),
    groupsPublishWelcomes: (input) =>
      trpc.mls.groups.publishWelcomes.mutate(input),
    groupsFetchPendingWelcomes: () =>
      trpc.mls.groups.fetchPendingWelcomes.query(),
  };
}

async function bootstrap(authUserId: string): Promise<MlsClient | null> {
  // Token + identity must both be ready. SecureStore is the bearer carrier;
  // the chat identity owns the M3 seed + deviceId (both reused for MLS).
  const token = await loadSessionToken();
  if (!token) return null;
  const identity = await getOrCreateChatIdentity();

  // Resolve canonical Account.id — Better Auth user id is NOT the same as
  // the domain Account.id; the engine and snapshot key off Account.id.
  const me = await trpc.account.me.query();

  const dbHandle = await getChatDb();
  const c = new MlsClient({
    accountId: me.accountId,
    deviceId: identity.deviceId,
    identitySeed: identity.seed,
    rpc: makeRpc(),
    db: dbHandle,
  });

  const { source } = await c.bootstrap();
  console.log(
    `[chat-mvp/M3.5] mls engine ready (source=${source}, account=${me.accountId})`,
  );
  bootstrappedForUserId = authUserId;
  return c;
}

async function tick(reason: string): Promise<void> {
  if (!client) return;
  try {
    const top = await client.topUpKeyPackagesIfBelow();
    if (top.published > 0) {
      console.log(
        `[chat-mvp/M3.5] kp top-up (${reason}) published=${top.published} total=${top.totalForDevice}`,
      );
    }

    const welcomes = await client.pollPendingWelcomes();
    if (welcomes.joinedGroupIds.length > 0) {
      console.log(
        `[chat-mvp/M3.5] joined groups (${reason}): ${welcomes.joinedGroupIds.length}`,
      );
    }

    // Poll commits for every locally-known group. At Phase 1 scale the
    // foreground user typically has ≤10 active groups → ≤10 round-trips
    // per tick. Switches to push in Chunk 6.
    const dbHandle = await getChatDb();
    const groups = await mlsStore.listGroups(dbHandle.db);
    for (const g of groups) {
      const out = await client.pollPendingCommits(g.groupId);
      if (out.applied > 0) {
        console.log(
          `[chat-mvp/M3.5] applied ${out.applied} commit(s) for group, epoch=${out.lastAppliedEpoch}`,
        );
      }
    }
  } catch (err) {
    console.error(`[chat-mvp/M3.5] tick failed (${reason})`, err);
  }
}

function startTimer(): void {
  if (pollTimer) return;
  pollTimer = setInterval(() => void tick("interval"), POLL_INTERVAL_MS);
}

function stopTimer(): void {
  if (!pollTimer) return;
  clearInterval(pollTimer);
  pollTimer = null;
}

async function onAuthChange(reason: string): Promise<void> {
  const session = useAuthStore.getState().session;
  if (!session?.user.id) {
    // Signed out — tear the loop down so we don't keep polling.
    stopTimer();
    client = null;
    bootstrappedForUserId = null;
    return;
  }
  if (bootstrappedForUserId === session.user.id && client) {
    return; // Already bootstrapped for this user.
  }

  // Different (or first) user — rebuild the client.
  client = null;
  try {
    client = await bootstrap(session.user.id);
    if (!client) return;
  } catch (err) {
    bootstrappedForUserId = null;
    console.error(`[chat-mvp/M3.5] bootstrap failed (${reason})`, err);
    return;
  }

  await tick(reason);
  startTimer();
}

// Foreground transitions trigger an immediate catch-up tick. Saves the user
// from staring at a 30s gap when they reopen the app.
function attachAppStateListener(): void {
  if (appStateSub) return;
  appStateSub = AppState.addEventListener("change", (next) => {
    const prev = lastAppState;
    lastAppState = next;
    if (prev !== "active" && next === "active") {
      void tick("foreground");
    }
  });
}

// Fire once at module init — the auth store may already be populated by
// rehydration before this module loaded.
void onAuthChange("boot");
attachAppStateListener();

// Re-fire on every auth-store update. The internal guard skips no-ops.
useAuthStore.subscribe(() => {
  void onAuthChange("auth-change");
});

// Exposed for the debug screen so it can read the live client without
// pulling its own copy. Returns null between sign-out and bootstrap.
export function getMlsClient(): MlsClient | null {
  return client;
}
