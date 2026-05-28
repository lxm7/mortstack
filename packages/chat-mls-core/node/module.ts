// Per-instance MlsEngineModule factory for Node tests. Wraps the napi
// MlsEngine class so each "device" in a multi-device acceptance test holds
// its own engine handle — unlike the iOS/Android bridges which are
// process-singletons. Surface matches @repo/chat-mls-core's MlsEngineModule
// interface (duck-typed; structural assignment at the MlsClient
// construction site keeps the type dependency one-way: tests → chat-mls-core).

import { MlsEngine as NapiMlsEngine } from "./index.js";
import type { AddMembersResult, ProcessedKind } from "../src/ChatMlsCore.types";

function toBuffer(b: Uint8Array): Buffer {
  return Buffer.from(b.buffer, b.byteOffset, b.byteLength);
}

function fromBuffer(b: Buffer): Uint8Array {
  return new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
}

export interface NodeMlsEngineModule {
  initEngine(accountId: string, identitySeed: Uint8Array): void;
  engineAccountId(): string;
  resetEngine(): void;
  dumpState(): Uint8Array;
  loadState(snapshot: Uint8Array): void;
  createKeyPackage(): Uint8Array;
  createGroup(groupId: Uint8Array): void;
  addMembers(groupId: Uint8Array, keyPackages: Uint8Array[]): AddMembersResult;
  removeMembersByAccounts(
    groupId: Uint8Array,
    accountIds: string[],
  ): Uint8Array;
  joinFromWelcome(welcomeBytes: Uint8Array): Uint8Array;
  encryptApp(groupId: Uint8Array, plaintext: Uint8Array): Uint8Array;
  processMessage(groupId: Uint8Array, msgBytes: Uint8Array): ProcessedKind;
  currentEpoch(groupId: Uint8Array): number;
  memberCount(groupId: Uint8Array): number;
}

/**
 * Create a fresh per-device engine module. One instance = one logical
 * "device" in the test harness. The internal NapiMlsEngine is allocated
 * lazily by initEngine (mirroring the mobile bridge's pattern), so reset
 * can null it out and the next initEngine starts cleanly.
 */
export function createNodeMlsEngineModule(): NodeMlsEngineModule {
  let engine: NapiMlsEngine | null = null;

  const require_ = (): NapiMlsEngine => {
    if (!engine) throw new Error("[node-mls] engine not initialised");
    return engine;
  };

  return {
    initEngine(accountId, identitySeed) {
      if (engine) {
        // Idempotent only when the same accountId is re-supplied — matches
        // the iOS/Android bridges' engineAccountMismatch guard.
        if (engine.accountId() !== accountId) {
          throw new Error(
            `[node-mls] engine already bound to ${engine.accountId()} — call resetEngine() before switching to ${accountId}`,
          );
        }
        return;
      }
      engine = new NapiMlsEngine(accountId, toBuffer(identitySeed));
    },
    engineAccountId() {
      return require_().accountId();
    },
    resetEngine() {
      engine = null;
    },
    dumpState() {
      return fromBuffer(require_().dumpState());
    },
    loadState(snapshot) {
      require_().loadState(toBuffer(snapshot));
    },
    createKeyPackage() {
      return fromBuffer(require_().createKeyPackage());
    },
    createGroup(groupId) {
      require_().createGroup(toBuffer(groupId));
    },
    addMembers(groupId, keyPackages) {
      const r = require_().addMembers(
        toBuffer(groupId),
        keyPackages.map(toBuffer),
      );
      return {
        commit: fromBuffer(r.commit),
        welcome: fromBuffer(r.welcome),
      };
    },
    removeMembersByAccounts(groupId, accountIds) {
      return fromBuffer(
        require_().removeMembersByAccounts(toBuffer(groupId), accountIds),
      );
    },
    joinFromWelcome(welcomeBytes) {
      return fromBuffer(require_().joinFromWelcome(toBuffer(welcomeBytes)));
    },
    encryptApp(groupId, plaintext) {
      return fromBuffer(
        require_().encryptApp(toBuffer(groupId), toBuffer(plaintext)),
      );
    },
    processMessage(groupId, msgBytes) {
      const r = require_().processMessage(
        toBuffer(groupId),
        toBuffer(msgBytes),
      );
      if (r.kind === "application" && r.plaintext) {
        return {
          kind: "application",
          plaintext: fromBuffer(r.plaintext),
        };
      }
      if (r.kind === "commitApplied") return { kind: "commitApplied" };
      if (r.kind === "proposalQueued") return { kind: "proposalQueued" };
      throw new Error(`[node-mls] unknown ProcessedKind: ${r.kind}`);
    },
    currentEpoch(groupId) {
      return require_().currentEpoch(toBuffer(groupId));
    },
    memberCount(groupId) {
      return require_().memberCount(toBuffer(groupId));
    },
  };
}
