// In-memory MlsRpc mock that mirrors the production tRPC server semantics
// closely enough to exercise MlsClient end-to-end. Each "device" gets its
// own bound MlsRpc handle via createMockRpc — same shared MockMlsServer
// instance underneath, scoped by accountId + deviceId per call.
//
// Mirrors:
//   - KeyPackage consume-on-fetch + per-device cap
//   - Phase 1 single-device-per-account dedupe (matches the keys.ts fix
//     committed earlier this session)
//   - GroupCommit @@unique([groupId, epoch]) — CONFLICT path for racing
//     publishers
//   - Welcome routing per (accountId, optional deviceId)
//   - Consume-on-fetch for both KeyPackages and Welcomes
//
// Auth signature verification is intentionally SKIPPED — that's a server
// concern, not a protocol concern. The 5 acceptance scenarios assert MLS
// protocol behaviour, not authenticity gating.

import type { MlsRpc } from "../../src/client";
import type {
  FetchKeyPackagesForAccountsInput,
  FetchKeyPackagesForAccountsOutput,
  FetchPendingCommitsOutput,
  FetchPendingWelcomesOutput,
  PublishKeyPackagesInput,
  PublishKeyPackagesOutput,
  PublishWelcomesInput,
  PublishWelcomesOutput,
} from "../../src/wire";

const KEY_PACKAGE_PER_DEVICE_CAP = 200;

interface DeviceRecord {
  accountId: string;
  deviceId: string;
  ed25519PubB64: string;
  updatedAt: number;
}

interface CommitRecord {
  id: string;
  epoch: number;
  commitB64: string;
  createdAt: string;
}

interface WelcomeRecord {
  id: string;
  groupIdB64: string;
  welcomeB64: string;
  recipientAccountId: string;
  recipientDeviceId: string | null;
}

let nextId = 1;
const genId = (): string => `mock-${nextId++}`;

export class MockMlsServer {
  // Live device per accountId. Phase 1 dedupe: a new device for the same
  // accountId replaces the prior one and that prior device's KPs are wiped.
  private liveDeviceByAccount = new Map<string, DeviceRecord>();

  // Stale device records — kept for tests that want to inspect what was
  // wiped. Production deletes via FK cascade; mock just orphans them.
  private staleDevices = new Map<string, DeviceRecord>();

  // KeyPackage pool keyed by `${accountId}:${deviceId}`. FIFO consume.
  private kpsByDevice = new Map<string, string[]>();

  // Commit log per groupIdB64. Order by epoch ascending; unique on epoch.
  private commitsByGroup = new Map<string, CommitRecord[]>();

  // Pending Welcomes per recipientAccountId. Consume-on-fetch.
  private welcomesByAccount = new Map<string, WelcomeRecord[]>();

  private kpKey(accountId: string, deviceId: string): string {
    return `${accountId}:${deviceId}`;
  }

  registerDevice(record: DeviceRecord): void {
    const existing = this.liveDeviceByAccount.get(record.accountId);
    if (existing && existing.deviceId !== record.deviceId) {
      // New device for same account → Phase 1 dedupe: wipe the prior
      // device's KPs and demote it to stale.
      this.kpsByDevice.delete(
        this.kpKey(existing.accountId, existing.deviceId),
      );
      this.staleDevices.set(existing.deviceId, existing);
    }
    this.liveDeviceByAccount.set(record.accountId, record);
  }

  publishKeyPackages(
    accountId: string,
    input: PublishKeyPackagesInput,
  ): PublishKeyPackagesOutput {
    const liveDevice = this.liveDeviceByAccount.get(accountId);
    if (!liveDevice || liveDevice.deviceId !== input.deviceId) {
      throw new Error(
        "device not registered — call registerDevice before publishing KPs",
      );
    }
    const key = this.kpKey(accountId, input.deviceId);
    const pool = this.kpsByDevice.get(key) ?? [];
    if (
      pool.length + input.keyPackagesB64.length >
      KEY_PACKAGE_PER_DEVICE_CAP
    ) {
      throw new Error(
        `device KeyPackage cap reached (existing=${pool.length}, incoming=${input.keyPackagesB64.length}, cap=${KEY_PACKAGE_PER_DEVICE_CAP})`,
      );
    }
    pool.push(...input.keyPackagesB64);
    this.kpsByDevice.set(key, pool);
    return {
      published: input.keyPackagesB64.length,
      totalForDevice: pool.length,
    };
  }

  fetchKeyPackagesForAccounts(
    input: FetchKeyPackagesForAccountsInput,
  ): FetchKeyPackagesForAccountsOutput {
    const out: FetchKeyPackagesForAccountsOutput = {};
    for (const accountId of input.accountIds) {
      const dev = this.liveDeviceByAccount.get(accountId);
      if (!dev) {
        out[accountId] = [];
        continue;
      }
      const pool =
        this.kpsByDevice.get(this.kpKey(accountId, dev.deviceId)) ?? [];
      const kp = pool.shift(); // FIFO consume
      if (!kp) {
        out[accountId] = [];
        continue;
      }
      out[accountId] = [
        {
          deviceId: dev.deviceId,
          ed25519PubB64: dev.ed25519PubB64,
          keyPackageB64: kp,
        },
      ];
    }
    return out;
  }

  keysCount(accountId: string, deviceId: string): { totalForDevice: number } {
    const pool = this.kpsByDevice.get(this.kpKey(accountId, deviceId)) ?? [];
    return { totalForDevice: pool.length };
  }

  keysDeleteAllForDevice(
    accountId: string,
    deviceId: string,
  ): { deleted: number } {
    const key = this.kpKey(accountId, deviceId);
    const pool = this.kpsByDevice.get(key) ?? [];
    const deleted = pool.length;
    this.kpsByDevice.delete(key);
    return { deleted };
  }

  publishCommit(input: {
    groupIdB64: string;
    epoch: number;
    commitB64: string;
  }): { id: string; epoch: number; createdAt: string } {
    const log = this.commitsByGroup.get(input.groupIdB64) ?? [];
    if (log.some((c) => c.epoch === input.epoch)) {
      // Mirror server CONFLICT error string — MlsClient's
      // publishCommitWithRetry detects "already published".
      throw new Error(
        `commit at epoch ${input.epoch} already published for group ${input.groupIdB64}`,
      );
    }
    const rec: CommitRecord = {
      id: genId(),
      epoch: input.epoch,
      commitB64: input.commitB64,
      createdAt: new Date().toISOString(),
    };
    log.push(rec);
    log.sort((a, b) => a.epoch - b.epoch);
    this.commitsByGroup.set(input.groupIdB64, log);
    return { id: rec.id, epoch: rec.epoch, createdAt: rec.createdAt };
  }

  fetchPendingCommits(input: {
    groupIdB64: string;
    sinceEpoch: number;
  }): FetchPendingCommitsOutput {
    const log = this.commitsByGroup.get(input.groupIdB64) ?? [];
    return {
      commits: log
        .filter((c) => c.epoch >= input.sinceEpoch)
        .map((c) => ({ epoch: c.epoch, commitB64: c.commitB64 })),
    };
  }

  publishWelcomes(input: PublishWelcomesInput): PublishWelcomesOutput {
    let delivered = 0;
    for (const r of input.recipients) {
      const bucket = this.welcomesByAccount.get(r.recipientAccountId) ?? [];
      bucket.push({
        id: genId(),
        groupIdB64: input.groupIdB64,
        welcomeB64: r.welcomeB64,
        recipientAccountId: r.recipientAccountId,
        recipientDeviceId: r.recipientDeviceId ?? null,
      });
      this.welcomesByAccount.set(r.recipientAccountId, bucket);
      delivered++;
    }
    return { delivered };
  }

  fetchPendingWelcomes(
    accountId: string,
    deviceId: string,
  ): FetchPendingWelcomesOutput {
    const bucket = this.welcomesByAccount.get(accountId) ?? [];
    const forMe = bucket.filter(
      (w) => w.recipientDeviceId === null || w.recipientDeviceId === deviceId,
    );
    const rest = bucket.filter(
      (w) =>
        !(w.recipientDeviceId === null || w.recipientDeviceId === deviceId),
    );
    this.welcomesByAccount.set(accountId, rest);
    return {
      welcomes: forMe.map((w) => ({
        id: w.id,
        groupIdB64: w.groupIdB64,
        welcomeB64: w.welcomeB64,
      })),
    };
  }
}

export function createMockRpc(
  server: MockMlsServer,
  accountId: string,
  deviceId: string,
): MlsRpc {
  return {
    keysCount: async () => server.keysCount(accountId, deviceId),
    keysDeleteAllForDevice: async () =>
      server.keysDeleteAllForDevice(accountId, deviceId),
    keysPublish: async (input: PublishKeyPackagesInput) =>
      server.publishKeyPackages(accountId, input),
    keysFetchForAccounts: async (input: FetchKeyPackagesForAccountsInput) =>
      server.fetchKeyPackagesForAccounts(input),
    groupsPublishCommit: async (input) => server.publishCommit(input),
    groupsFetchPendingCommits: async (input) =>
      server.fetchPendingCommits(input),
    groupsPublishWelcomes: async (input) => server.publishWelcomes(input),
    groupsFetchPendingWelcomes: async () =>
      server.fetchPendingWelcomes(accountId, deviceId),
  };
}
