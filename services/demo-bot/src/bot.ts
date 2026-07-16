import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";

// @repo/chat-mls-core ships raw .ts (no "type":"module"), so tsx loads it as
// CommonJS at runtime while tsc sees the ESM source — a mismatch no single
// import form satisfies (default import runs but won't typecheck; namespace
// typechecks but hides the class under .default at runtime). Resolve it the
// canonical way: require() the value (tsx transpiles the .ts on demand) and
// take the class *type* from a type-only import (erased, so no runtime effect).
import type { MlsClient as MlsClientCtor } from "@repo/chat-mls-core/client";

const { MlsClient } = createRequire(import.meta.url)(
  "@repo/chat-mls-core/client",
) as {
  MlsClient: typeof MlsClientCtor;
};
type MlsClient = MlsClientCtor;

import type { BotConfig } from "./config.js";
import { authenticate } from "./auth.js";
import { createTrpc, makeMlsRpc, type TrpcClient } from "./rpc.js";
import { createFileStore, type BotStore } from "./store.js";
import { createNodeMlsEngineModule } from "./engine.js";
import { nodeMlsCrypto, ed25519PubFromSeed } from "./crypto.js";

function b64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

// Canonical device-bundle bytes the server re-verifies. Byte-for-byte identical
// to apps/mobile/lib/chat/publish.ts + services/api/src/routers/user.ts:
//   0x01 ‖ deviceId-utf8 ‖ ed25519Pub ‖ x25519Pub
const BUNDLE_VERSION = 0x01;
function canonicalBundleBytes(
  deviceId: string,
  ed25519Pub: Uint8Array,
  x25519Pub: Uint8Array,
): Uint8Array {
  const deviceIdBytes = new TextEncoder().encode(deviceId);
  const out = new Uint8Array(
    1 + deviceIdBytes.length + ed25519Pub.length + x25519Pub.length,
  );
  out[0] = BUNDLE_VERSION;
  out.set(deviceIdBytes, 1);
  out.set(ed25519Pub, 1 + deviceIdBytes.length);
  out.set(x25519Pub, 1 + deviceIdBytes.length + ed25519Pub.length);
  return out;
}

// Register the bot's device server-side (user.keys.publish). The mls.keys.*
// routes gate on a registered device, so this must run before bootstrap's
// orphan-KP cleanup and any add. Idempotent — server upserts on (account, device).
async function registerDevice(
  trpc: TrpcClient,
  id: { deviceId: string; seed: Uint8Array; x25519Pub: Uint8Array },
): Promise<void> {
  const ed25519Pub = ed25519PubFromSeed(id.seed);
  const bundle = canonicalBundleBytes(id.deviceId, ed25519Pub, id.x25519Pub);
  const sig = nodeMlsCrypto.signEd25519Detached(bundle, id.seed);
  await trpc.user.keys.publish.mutate({
    deviceId: id.deviceId,
    ed25519PubB64: b64(ed25519Pub),
    x25519PubB64: b64(id.x25519Pub),
    bundleSigB64: b64(sig),
  });
}

export interface Bot {
  cfg: BotConfig;
  trpc: TrpcClient;
  store: BotStore;
  client: MlsClient;
  accountId: string;
  deviceId: string;
}

interface BuildClientOpts {
  apiUrl: string;
  email: string;
  password: string;
  name: string;
  stateDir: string;
}

type Client = Omit<Bot, "cfg"> & { source: "fresh" | "snapshot" };

// Authenticate → resolve domain accountId → construct an MlsClient with the Node
// engine + file store + real RPC → register device → bootstrap. This is the
// mobile bootstrap (mls-auto-publish.ts) minus the RN-specific poll loop, and is
// shared by both the concierge (createBot) and the verify harness's synthetic user.
async function buildClient(opts: BuildClientOpts): Promise<Client> {
  const token = await authenticate(opts);
  const trpc = createTrpc(opts.apiUrl, token);

  // Domain Account.id ≠ Better Auth user id — the engine + snapshot key off it.
  const me = await trpc.account.me.query();
  const accountId = me.accountId;

  const store = createFileStore(opts.stateDir);
  const { seed, deviceId, x25519Pub } = store.getOrCreateIdentity();

  // Register the device before any mls.keys.* call (bootstrap's fresh path
  // clears orphan KPs; add fetches peer KPs) — both gate on a registered device.
  await registerDevice(trpc, { deviceId, seed, x25519Pub });

  const client = new MlsClient({
    accountId,
    deviceId,
    identitySeed: seed,
    rpc: makeMlsRpc(trpc),
    engine: createNodeMlsEngineModule(),
    crypto: nodeMlsCrypto,
    mlsStore: store,
  });

  const { source } = await client.bootstrap();
  return { trpc, store, client, accountId, deviceId, source };
}

// Boot the concierge from config.
export async function createBot(cfg: BotConfig): Promise<Bot> {
  const { source, ...rest } = await buildClient({
    apiUrl: cfg.apiUrl,
    email: cfg.email,
    password: cfg.password,
    name: cfg.name,
    stateDir: cfg.stateDir,
  });
  console.log(
    `[demo-bot] engine ready (source=${source}, account=${rest.accountId}, device=${rest.deviceId})`,
  );
  return { cfg, ...rest };
}

// End-to-end proof of slice 1 against the REAL server, no sim required: stand up
// a throwaway KeyPackage-publishing "user", have the bot add it to a lobby, and
// assert the user joins from the bot's Welcome. A join means the user is now
// cryptographically in the group — the exact thing "group not found" denied.
export async function verifySlice1(cfg: BotConfig): Promise<boolean> {
  const bot = await createBot(cfg);

  const email = `verify-user-${Date.now()}@mortstack.demo`;
  const user = await buildClient({
    apiUrl: cfg.apiUrl,
    email,
    password: "verify-user-pw-123",
    name: "Verify User",
    stateDir: join(tmpdir(), `demo-bot-verify-${Date.now()}`),
  });
  console.log(`[verify] synthetic user ready — account=${user.accountId}`);

  // The user must publish KeyPackages before the bot can add it (the KP-timing
  // dependency the real signup flow also has).
  const top = await user.client.topUpKeyPackagesIfBelow(10, 8);
  console.log(`[verify] user published ${top.published} KeyPackage(s)`);

  await addUserToDemo(bot, user.accountId, "Verify Lobby");

  const joined = await user.client.pollPendingWelcomes();
  const ok = joined.joinedGroupIds.length >= 1;
  console.log(
    ok
      ? `[verify] ✅ SLICE 1 PASS — user joined ${joined.joinedGroupIds.length} group(s) from the bot's Welcome. The "group not found" root is fixed off-device.`
      : `[verify] ❌ SLICE 1 FAIL — user received no Welcome (joinedGroupIds=0). Inspect publishWelcomes / fetchPendingWelcomes.`,
  );
  return ok;
}

// Ensure a signed-up user is a full member of a demo lobby — the whole point of
// the bot. `chat.create` requires ≥1 non-caller member, so a lobby can't exist
// before its first user; this founds one WITH the first user, and adds later
// users to the existing lobby. Either way it does the two-fact membership
// correctly: (1) the server ChatMember row (so the user's chat.list surfaces the
// lobby) and (2) the real MLS Add — fetch the user's KeyPackage → engine.addMembers
// → publish Commit + Welcome — so the user's device can actually join and decrypt.
// This is the fix for the "group not found" root: no DB membership without a Welcome.
export async function addUserToDemo(
  bot: Bot,
  userAccountId: string,
  lobbyName: string,
): Promise<void> {
  if (userAccountId === bot.accountId) {
    throw new Error("[demo-bot] can't add the bot to its own lobby");
  }

  // Reuse the first lobby the bot already founded (tracer keeps one); else found.
  const existing = bot.store.listChats().find((c) => c.mlsGroupIdB64);

  let chatId: string;
  let groupId: Uint8Array;

  if (existing) {
    chatId = existing.id;
    groupId = bot.store.getChatGroupId(chatId)!;
    // Server membership for a NEW member of an existing lobby. Note: addMembers'
    // input is `accountIds` (chat.create's is `memberAccountIds` — asymmetric).
    await bot.trpc.chat.addMembers.mutate({
      chatId,
      accountIds: [userAccountId],
    });
  } else {
    // Found the lobby WITH this user as the initial member (server rows for
    // bot+user), then have the bot mint + link the MLS group. Mirrors the
    // founder half of apps/mobile/lib/chat/create-chat.ts.
    const created = await bot.trpc.chat.create.mutate({
      kind: "group",
      name: lobbyName,
      memberAccountIds: [userAccountId],
    });
    chatId = created.chatId;
    await bot.store.upsertChat({ id: chatId, kind: "group", name: lobbyName });
    const g = await bot.client.createGroup({ chatId });
    groupId = g.groupId;
    await bot.trpc.chat.linkMlsGroup.mutate({
      chatId,
      mlsGroupIdB64: b64(groupId),
    });
    console.log(`[demo-bot] founded lobby "${lobbyName}" chatId=${chatId}`);
  }

  // The real MLS Add + Welcome — same call for both paths. Fails when the user
  // has no published KeyPackage (they've never opened the app) — surface that as
  // actionable guidance rather than a stack trace; the server rows already exist,
  // so a retry after they sign in completes the join.
  let res: { devicesAdded: unknown[]; epoch: number };
  try {
    res = await bot.client.addMembersByAccounts({
      groupId,
      accountIds: [userAccountId],
    });
  } catch (err) {
    console.warn(
      `[demo-bot] ⚠ MLS add failed for ${userAccountId} — most likely no published KeyPackage yet. ` +
        `Have them sign into the app once (it publishes KPs on bootstrap), then re-run 'bot add ${userAccountId}'. ` +
        `Lobby ${chatId} + server membership already exist, so the retry only does the MLS Welcome.\n  cause: ${String(err)}`,
    );
    return;
  }
  console.log(
    `[demo-bot] added ${userAccountId} → lobby ${chatId}: devices=${res.devicesAdded.length} epoch=${res.epoch}`,
  );
  if (res.devicesAdded.length === 0) {
    console.warn(
      "[demo-bot] ⚠ 0 devices added — the user has no published KeyPackage yet. " +
        "Have them open the app (sign in) once so it publishes KPs, then retry.",
    );
  }
}
