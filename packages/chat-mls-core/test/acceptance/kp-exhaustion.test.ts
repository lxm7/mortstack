// README §M3.5 acceptance #10 — KeyPackage exhaustion:
//   Drained pool → adder gets a clean "no KeyPackages available" throw.
//   After top-up the same add succeeds. Phase 1 skips the last-resort KP
//   (replayable); first-class top-up is the only refill path.

import { describe, expect, it } from "vitest";
import { MockMlsServer } from "../lib/mock-rpc";
import { createTestDevice } from "../lib/test-device";

describe("acceptance #10 — KeyPackage exhaustion", () => {
  it("addMembers throws when peer has 0 KPs; succeeds after top-up", async () => {
    const server = new MockMlsServer();
    const alice = await createTestDevice({ label: "alice", server });
    const bob = await createTestDevice({
      label: "bob",
      server,
      // Single-shot pool — easier to drain deterministically.
      initialKpPool: 1,
    });

    const { groupId } = await alice.client.createGroup();

    // Drain bob's server-side pool. Engine state untouched.
    await bob.client.drainServerKeyPackages();

    await expect(
      alice.client.addMembersByAccounts({
        groupId,
        accountIds: [bob.accountId],
      }),
    ).rejects.toThrow(/no KeyPackages available/);

    // Refill, retry — succeeds.
    await bob.client.topUpKeyPackagesIfBelow(5, 1);
    const result = await alice.client.addMembersByAccounts({
      groupId,
      accountIds: [bob.accountId],
    });
    expect(result.epoch).toBe(1);
    expect(result.devicesAdded).toHaveLength(1);
    await bob.client.pollPendingWelcomes();
    expect(bob.engine.memberCount(groupId)).toBe(2);
  });
});
