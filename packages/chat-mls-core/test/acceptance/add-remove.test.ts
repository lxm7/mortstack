// README §M3.5 acceptance #7 — member add/remove mid-conversation:
//   3 devices in a group; remove one mid-stream and assert remaining
//   members keep decrypting while the removed member's epoch is frozen.

import { describe, expect, it } from "vitest";
import { MockMlsServer } from "../lib/mock-rpc";
import { createTestDevice } from "../lib/test-device";

describe("acceptance #7 — add/remove mid-conversation", () => {
  it("removes carol, alice + bob continue, carol's view freezes", async () => {
    const server = new MockMlsServer();
    const alice = await createTestDevice({ label: "alice", server });
    const bob = await createTestDevice({ label: "bob", server });
    const carol = await createTestDevice({ label: "carol", server });

    const { groupId } = await alice.client.createGroup();
    await alice.client.addMembersByAccounts({
      groupId,
      accountIds: [bob.accountId, carol.accountId],
    });
    await bob.client.pollPendingWelcomes();
    await carol.client.pollPendingWelcomes();
    expect(alice.engine.memberCount(groupId)).toBe(3);

    // Pre-remove broadcast — all three decrypt.
    const hello = alice.engine.encryptApp(
      groupId,
      new TextEncoder().encode("hello group"),
    );
    for (const peer of [bob, carol]) {
      const r = peer.engine.processMessage(groupId, hello);
      expect(r.kind).toBe("application");
      if (r.kind === "application") {
        expect(new TextDecoder().decode(r.plaintext)).toBe("hello group");
      }
    }

    // Remove carol. Commit lands at epoch 2.
    await alice.client.removeMembersByAccounts({
      groupId,
      accountIds: [carol.accountId],
    });
    await bob.client.pollPendingCommits(groupId);
    expect(alice.engine.currentEpoch(groupId)).toBe(2);
    expect(bob.engine.currentEpoch(groupId)).toBe(2);
    expect(alice.engine.memberCount(groupId)).toBe(2);
    expect(bob.engine.memberCount(groupId)).toBe(2);

    // Carol's local view is frozen at epoch 1 until she polls the commit.
    // The acceptance is that AFTER she applies the remove-self commit, her
    // attempts to process subsequent ciphertexts fail closed — she has been
    // ejected from the group ratchet.
    await carol.client.pollPendingCommits(groupId);

    const privateBytes = alice.engine.encryptApp(
      groupId,
      new TextEncoder().encode("private now"),
    );
    const bobResult = bob.engine.processMessage(groupId, privateBytes);
    expect(bobResult.kind).toBe("application");
    if (bobResult.kind === "application") {
      expect(new TextDecoder().decode(bobResult.plaintext)).toBe("private now");
    }
    expect(() => carol.engine.processMessage(groupId, privateBytes)).toThrow();
  });
});
