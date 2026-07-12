// Per-instance MlsEngineModule for the bot, wrapping the napi MlsEngine.
// Mirrors packages/chat-mls-core/node/module.ts (the acceptance-harness wrapper)
// but is self-contained so the bot depends only on the published napi package
// (@repo/chat-mls-core-node), not on the harness's internal relative imports.
//
// The napi surface speaks Buffer; MlsClient's engine surface speaks Uint8Array.
// This wrapper is the sole Buffer↔Uint8Array boundary.

// The napi package is a CommonJS native addon (module.exports = require(.node)),
// so ESM can't statically see its named exports — import the default and pull
// the class off it.
import ChatMlsCoreNode from "@repo/chat-mls-core-node";

const NapiMlsEngine = ChatMlsCoreNode.MlsEngine;
type NapiMlsEngine = InstanceType<typeof NapiMlsEngine>;

function toBuffer(b: Uint8Array): Buffer {
  return Buffer.from(b.buffer, b.byteOffset, b.byteLength);
}

function fromBuffer(b: Buffer): Uint8Array {
  return new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
}

// Structural shape MlsClient consumes (ProcessedKind carries Uint8Array, not
// the napi Buffer). Discriminated union so it's assignable to chat-mls-core's
// MlsEngineModule.processMessage return; duck-typed at the construction site,
// same as the harness wrapper.
type ProcessedKind =
  | { kind: "application"; plaintext: Uint8Array }
  | { kind: "commitApplied" }
  | { kind: "proposalQueued" };

export function createNodeMlsEngineModule() {
  let engine: NapiMlsEngine | null = null;

  const require_ = (): NapiMlsEngine => {
    if (!engine) throw new Error("[demo-bot/engine] engine not initialised");
    return engine;
  };

  return {
    initEngine(accountId: string, identitySeed: Uint8Array): void {
      if (engine) {
        if (engine.accountId() !== accountId) {
          throw new Error(
            `[demo-bot/engine] engine already bound to ${engine.accountId()} — resetEngine() before switching to ${accountId}`,
          );
        }
        return;
      }
      engine = new NapiMlsEngine(accountId, toBuffer(identitySeed));
    },
    engineAccountId(): string {
      return require_().accountId();
    },
    resetEngine(): void {
      engine = null;
    },
    dumpState(): Uint8Array {
      return fromBuffer(require_().dumpState());
    },
    loadState(snapshot: Uint8Array): void {
      require_().loadState(toBuffer(snapshot));
    },
    createKeyPackage(): Uint8Array {
      return fromBuffer(require_().createKeyPackage());
    },
    createGroup(groupId: Uint8Array): void {
      require_().createGroup(toBuffer(groupId));
    },
    addMembers(groupId: Uint8Array, keyPackages: Uint8Array[]) {
      const r = require_().addMembers(
        toBuffer(groupId),
        keyPackages.map(toBuffer),
      );
      return { commit: fromBuffer(r.commit), welcome: fromBuffer(r.welcome) };
    },
    removeMembersByAccounts(
      groupId: Uint8Array,
      accountIds: string[],
    ): Uint8Array {
      return fromBuffer(
        require_().removeMembersByAccounts(toBuffer(groupId), accountIds),
      );
    },
    joinFromWelcome(welcomeBytes: Uint8Array): Uint8Array {
      return fromBuffer(require_().joinFromWelcome(toBuffer(welcomeBytes)));
    },
    encryptApp(groupId: Uint8Array, plaintext: Uint8Array): Uint8Array {
      return fromBuffer(
        require_().encryptApp(toBuffer(groupId), toBuffer(plaintext)),
      );
    },
    processMessage(groupId: Uint8Array, msgBytes: Uint8Array): ProcessedKind {
      const r = require_().processMessage(
        toBuffer(groupId),
        toBuffer(msgBytes),
      );
      if (r.kind === "application" && r.plaintext) {
        return { kind: "application", plaintext: fromBuffer(r.plaintext) };
      }
      if (r.kind === "commitApplied") return { kind: "commitApplied" };
      if (r.kind === "proposalQueued") return { kind: "proposalQueued" };
      throw new Error(`[demo-bot/engine] unknown ProcessedKind: ${r.kind}`);
    },
    currentEpoch(groupId: Uint8Array): number {
      return require_().currentEpoch(toBuffer(groupId));
    },
    memberCount(groupId: Uint8Array): number {
      return require_().memberCount(toBuffer(groupId));
    },
  };
}
