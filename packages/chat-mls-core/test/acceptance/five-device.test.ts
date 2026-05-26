// README §M3.5 acceptance #9 — 5-device group:
//   one Commit + one Welcome covers all 4 joiners; one ciphertext decrypts
//   on all five peers; epoch + member count consistent across the group.

import { describe, expect, it } from "vitest";
import { MockMlsServer } from "../lib/mock-rpc";
import { createTestDevice } from "../lib/test-device";

describe("acceptance #9 — 5-device group", () => {
  it("alice adds 4 peers in one batch; one ciphertext fans to all", async () => {
    const server = new MockMlsServer();
    const alice = await createTestDevice({ label: "alice", server });
    const peers = await Promise.all(
      ["bob", "carol", "dave", "eve"].map((label) =>
        createTestDevice({ label, server }),
      ),
    );

    const { groupId } = await alice.client.createGroup();
    await alice.client.addMembersByAccounts({
      groupId,
      accountIds: peers.map((p) => p.accountId),
    });
    for (const p of peers) await p.client.pollPendingWelcomes();

    expect(alice.engine.memberCount(groupId)).toBe(5);
    expect(alice.engine.currentEpoch(groupId)).toBe(1);
    for (const p of peers) {
      expect(p.engine.memberCount(groupId)).toBe(5);
      expect(p.engine.currentEpoch(groupId)).toBe(1);
    }

    const cipher = alice.engine.encryptApp(
      groupId,
      new TextEncoder().encode("hello five"),
    );
    for (const p of peers) {
      const r = p.engine.processMessage(groupId, cipher);
      expect(r.kind).toBe("application");
      if (r.kind === "application") {
        expect(new TextDecoder().decode(r.plaintext)).toBe("hello five");
      }
    }
  });
});
