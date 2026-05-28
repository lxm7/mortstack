// In-memory MlsStoreApi for the Node test harness. Backed by plain Maps;
// keyed by hex-encoded byte strings since Uint8Array compares by reference
// rather than value. Structurally matches @repo/chat-mls-core's MlsStoreApi.
//
// Reproduces semantics of the SQLite-backed @repo/chat-db mls-store:
//   - engine_state: one row per accountId; UPSERT on save
//   - mls_group: one row per groupId; preserve last_applied_epoch on
//     re-upsert; chat_id COALESCE on conflict
//   - chats: ensureChatForDebug seeds an empty row; setChatMlsGroupId
//     updates only the mls_group_id column

import type {
  MlsGroupListItem,
  MlsGroupLocal,
  MlsStoreApi,
} from "../../src/client";

function hex(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++)
    s += (bytes[i] ?? 0).toString(16).padStart(2, "0");
  return s;
}

interface GroupRow {
  groupId: Uint8Array;
  chatId: string | null;
  lastAppliedEpoch: number;
  joinedAt: number;
}

interface ChatRow {
  id: string;
  kind: "direct" | "group";
  mlsGroupId: Uint8Array | null;
}

export function createInMemoryMlsStore(): MlsStoreApi {
  const engineSnapshots = new Map<
    string,
    { snapshot: Uint8Array; updated_at: number }
  >();
  const groups = new Map<string, GroupRow>();
  const chats = new Map<string, ChatRow>();

  return {
    async loadEngineSnapshot(accountId) {
      return engineSnapshots.get(accountId) ?? null;
    },
    async saveEngineSnapshot(accountId, snapshot) {
      engineSnapshots.set(accountId, { snapshot, updated_at: Date.now() });
    },
    async clearEngineSnapshot(accountId) {
      engineSnapshots.delete(accountId);
    },
    async upsertGroup(input) {
      const key = hex(input.groupId);
      const existing = groups.get(key);
      if (existing) {
        // Preserve lastAppliedEpoch; COALESCE chatId.
        if (input.chatId !== undefined && input.chatId !== null) {
          existing.chatId = input.chatId;
        }
        return;
      }
      groups.set(key, {
        groupId: input.groupId,
        chatId: input.chatId ?? null,
        lastAppliedEpoch: input.initialEpoch ?? 0,
        joinedAt: Date.now(),
      });
    },
    async setLastAppliedEpoch(groupId, epoch) {
      const row = groups.get(hex(groupId));
      if (row) row.lastAppliedEpoch = epoch;
    },
    async getGroup(groupId): Promise<MlsGroupLocal | null> {
      const row = groups.get(hex(groupId));
      if (!row) return null;
      return {
        group_id: row.groupId,
        chat_id: row.chatId,
        last_applied_epoch: row.lastAppliedEpoch,
        joined_at: row.joinedAt,
      };
    },
    async listGroups(): Promise<MlsGroupListItem[]> {
      return Array.from(groups.values()).map((r) => ({
        groupId: r.groupId,
        chatId: r.chatId,
        lastAppliedEpoch: r.lastAppliedEpoch,
      }));
    },
    async clearAllGroups() {
      groups.clear();
    },
    async setChatMlsGroupId(chatId, groupId) {
      const row = chats.get(chatId);
      if (!row) return { updates: 0 };
      row.mlsGroupId = groupId;
      return { updates: 1 };
    },
    async ensureChatForDebug(chatId, kind = "group") {
      if (chats.has(chatId)) return { created: false };
      chats.set(chatId, { id: chatId, kind, mlsGroupId: null });
      return { created: true };
    },
  };
}
