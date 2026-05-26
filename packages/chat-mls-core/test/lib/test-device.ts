// Factory for an end-to-end "device" used by the acceptance suite.
//
// One call to createTestDevice produces:
//   - a fresh napi MlsEngine instance via NodeMlsEngineModule
//   - a Maps-backed MlsStoreApi (InMemoryMlsStore)
//   - an MlsRpc handle bound to the shared MockMlsServer
//   - an MlsClient wired up + bootstrapped (engine initialised, snapshot
//     loaded if any, KP pool topped up to default target)
//
// All devices in one test share the same MockMlsServer — that's how a
// publish on device A becomes visible to a fetch on device B.

import * as ed25519 from "@noble/ed25519";
import { MlsClient } from "../../src/client";
import { createNodeMlsEngineModule } from "../../node/module";
import { createInMemoryMlsStore } from "./in-memory-mls-store";
import { createMockRpc, MockMlsServer } from "./mock-rpc";
// Importing nodeMlsCrypto eagerly installs the sha512Sync provider via the
// module's top-level ed25519.etc.sha512Sync = ... — ed25519.getPublicKey
// below depends on that being in place.
import { nodeMlsCrypto } from "./node-crypto";

function toB64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

function randomCuid(label: string): string {
  // Production accountIds are cuid v1. Mock doesn't validate the format —
  // a stable, unique-per-call string is enough. Prefix with the human
  // label so test failures are diagnosable.
  const rand = Math.random().toString(36).slice(2, 12);
  return `${label}-${rand}`.toLowerCase();
}

function randomUuid(): string {
  return crypto.randomUUID();
}

export interface TestDevice {
  /** Human-readable label, e.g. "alice", "bob". */
  label: string;
  accountId: string;
  deviceId: string;
  identitySeed: Uint8Array;
  client: MlsClient;
  /** Direct engine handle — useful for assertions that bypass MlsClient
   *  (e.g. inspecting current_epoch without going through the SDK). */
  engine: ReturnType<typeof createNodeMlsEngineModule>;
  /** The Maps-backed store, exposed so tests can drop+restore via
   *  loadEngineSnapshot to simulate "kill app + relaunch". */
  mlsStore: ReturnType<typeof createInMemoryMlsStore>;
}

export interface CreateTestDeviceOptions {
  label: string;
  server: MockMlsServer;
  /** Reuse an existing accountId + identitySeed (simulates a relaunch as
   *  the same user). When omitted, generates fresh ones. */
  identity?: {
    accountId: string;
    identitySeed: Uint8Array;
    deviceId?: string;
  };
  /** Reuse an existing mlsStore (so a relaunch finds its prior snapshot).
   *  When omitted, allocates a fresh empty store. */
  mlsStore?: ReturnType<typeof createInMemoryMlsStore>;
  /** Reuse an existing engine module (so two sequentially-active accounts
   *  share one engine context — the multi-account-swap scenario). When
   *  omitted, allocates a fresh module. */
  engine?: ReturnType<typeof createNodeMlsEngineModule>;
  /** Publish initial KP pool after bootstrap. Default 10 — keeps tests
   *  fast (vs production 100); raise per-test if needed. */
  initialKpPool?: number;
}

export async function createTestDevice(
  opts: CreateTestDeviceOptions,
): Promise<TestDevice> {
  const accountId = opts.identity?.accountId ?? randomCuid(opts.label);
  const identitySeed =
    opts.identity?.identitySeed ?? nodeMlsCrypto.getRandomBytes(32);
  const deviceId = opts.identity?.deviceId ?? randomUuid();

  // Register the device server-side so publish/fetch know about it.
  const ed25519Pub = ed25519.getPublicKey(identitySeed);
  opts.server.registerDevice({
    accountId,
    deviceId,
    ed25519PubB64: toB64(ed25519Pub),
    updatedAt: Date.now(),
  });

  const engine = opts.engine ?? createNodeMlsEngineModule();
  const mlsStore = opts.mlsStore ?? createInMemoryMlsStore();
  const rpc = createMockRpc(opts.server, accountId, deviceId);

  const client = new MlsClient({
    accountId,
    deviceId,
    identitySeed,
    rpc,
    engine,
    crypto: nodeMlsCrypto,
    mlsStore,
  });

  await client.bootstrap();
  const target = opts.initialKpPool ?? 10;
  await client.topUpKeyPackagesIfBelow(target, Math.max(1, target - 2));

  return {
    label: opts.label,
    accountId,
    deviceId,
    identitySeed,
    client,
    engine,
    mlsStore,
  };
}
