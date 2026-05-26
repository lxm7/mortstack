// Type declarations for the chat_mls_core_node napi binding. Hand-written
// mirror of the #[napi]-annotated surface in src/lib.rs — keep in sync.

export interface AddMembersResult {
  commit: Buffer;
  welcome: Buffer;
}

export type ProcessedKindTag =
  | "application"
  | "commitApplied"
  | "proposalQueued";

export interface ProcessedKind {
  kind: ProcessedKindTag;
  plaintext?: Buffer;
}

export class MlsEngine {
  constructor(accountId: string, identitySeed: Buffer);
  accountId(): string;
  createKeyPackage(): Buffer;
  createGroup(groupId: Buffer): void;
  addMembers(groupId: Buffer, keyPackages: Buffer[]): AddMembersResult;
  removeMembersByAccounts(groupId: Buffer, accountIds: string[]): Buffer;
  joinFromWelcome(welcomeBytes: Buffer): Buffer;
  encryptApp(groupId: Buffer, plaintext: Buffer): Buffer;
  processMessage(groupId: Buffer, msgBytes: Buffer): ProcessedKind;
  currentEpoch(groupId: Buffer): number;
  memberCount(groupId: Buffer): number;
  dumpState(): Buffer;
  loadState(bytes: Buffer): void;
}
