// README §M3.5 acceptance #6 — offline catch-up:
//   "kill app, send N msgs from peers, relaunch, decrypt all"
//
// "Kill + relaunch" in tests = recreate the MlsClient + engine module from
// the same identitySeed against the same mlsStore (which persists across
// the kill via Maps). The new client bootstraps via loadEngineSnapshot;
// pollPendingCommits applies any Commits landed while offline; the test
// then replays captured app-message ciphertexts to the new engine and
// asserts decryption.

import { describe, expect, it } from "vitest";
import { MockMlsServer } from "../lib/mock-rpc";
import { createTestDevice } from "../lib/test-device";

describe("acceptance #6 — offline catch-up", () => {
  it("relaunched device applies queued commit + decrypts queued app messages", async () => {
    const server = new MockMlsServer();
    const alice = await createTestDevice({ label: "alice", server });
    const bob = await createTestDevice({ label: "bob", server });
    const carol = await createTestDevice({ label: "carol", server });

    const { groupId } = await alice.client.createGroup();
    await alice.client.addMembersByAccounts({
      groupId,
      accountIds: [bob.accountId],
    });
    await bob.client.pollPendingWelcomes();

    // ── Phase 1: bob online — receives + decrypts a first message ──────────
    const m1Bytes = alice.engine.encryptApp(
      groupId,
      new TextEncoder().encode("phase 1 hi"),
    );
    const m1 = bob.engine.processMessage(groupId, m1Bytes);
    expect(m1.kind).toBe("application");
    if (m1.kind === "application") {
      expect(new TextDecoder().decode(m1.plaintext)).toBe("phase 1 hi");
    }

    // Capture bob's persistent state. In production this lives in chat-db
    // SQLCipher — here it's the Maps-backed mlsStore which survives the
    // MlsClient drop below.
    const bobAccountId = bob.accountId;
    const bobDeviceId = bob.deviceId;
    const bobSeed = bob.identitySeed;
    const bobMlsStore = bob.mlsStore;

    // Force bob's snapshot to be saved AFTER processing m1 so the
    // relaunched engine ratchet matches.
    bob.mlsStore.saveEngineSnapshot(bobAccountId, bob.engine.dumpState());

    // ── Phase 2: bob offline. Alice adds carol (commit) + sends 3 msgs. ────
    await alice.client.addMembersByAccounts({
      groupId,
      accountIds: [carol.accountId],
    });
    await carol.client.pollPendingWelcomes();

    const sentWhileOffline: Uint8Array[] = [];
    for (const text of ["phase 2 m1", "phase 2 m2", "phase 2 m3"]) {
      sentWhileOffline.push(
        alice.engine.encryptApp(groupId, new TextEncoder().encode(text)),
      );
    }

    // ── Phase 3: bob relaunches with same identity + persisted store. ──────
    const bobRelaunched = await createTestDevice({
      label: "bob",
      server,
      identity: {
        accountId: bobAccountId,
        identitySeed: bobSeed,
        deviceId: bobDeviceId,
      },
      mlsStore: bobMlsStore,
    });

    // bootstrap() inside createTestDevice already called loadEngineSnapshot.
    // Now fetch + apply the carol-add commit that landed while offline.
    const { applied, lastAppliedEpoch } =
      await bobRelaunched.client.pollPendingCommits(groupId);
    expect(applied).toBe(1);
    expect(lastAppliedEpoch).toBe(2);
    expect(bobRelaunched.engine.currentEpoch(groupId)).toBe(2);
    expect(bobRelaunched.engine.memberCount(groupId)).toBe(3);

    // Now decrypt each queued app message.
    const decoded = sentWhileOffline.map((bytes) => {
      const r = bobRelaunched.engine.processMessage(groupId, bytes);
      if (r.kind !== "application") {
        throw new Error(`expected application, got ${r.kind}`);
      }
      return new TextDecoder().decode(r.plaintext);
    });
    expect(decoded).toEqual(["phase 2 m1", "phase 2 m2", "phase 2 m3"]);
  });
});
