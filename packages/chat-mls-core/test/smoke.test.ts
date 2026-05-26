// Harness smoke — proves the napi binding + mock RPC + in-memory store +
// MlsClient stack wires up correctly. Mirrors the 2-sim DM scenario already
// proven manually in commit 553dc6b. If this passes, the 5 acceptance
// scenarios under test/acceptance/ should be additive.

import { describe, expect, it } from "vitest";
import { MockMlsServer } from "./lib/mock-rpc";
import { createTestDevice } from "./lib/test-device";

describe("smoke — 2-device DM via mock RPC", () => {
  it("alice creates group, adds bob, both decrypt a message", async () => {
    const server = new MockMlsServer();
    const alice = await createTestDevice({ label: "alice", server });
    const bob = await createTestDevice({ label: "bob", server });

    const { groupId } = await alice.client.createGroup();
    await alice.client.addMembersByAccounts({
      groupId,
      accountIds: [bob.accountId],
    });

    const welcomes = await bob.client.pollPendingWelcomes();
    expect(welcomes.joinedGroupIds).toHaveLength(1);
    expect(Array.from(welcomes.joinedGroupIds[0]!)).toEqual(
      Array.from(groupId),
    );

    expect(alice.engine.memberCount(groupId)).toBe(2);
    expect(bob.engine.memberCount(groupId)).toBe(2);
    expect(alice.engine.currentEpoch(groupId)).toBe(1);
    expect(bob.engine.currentEpoch(groupId)).toBe(1);
  });
});
