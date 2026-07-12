import { randomUUID, webcrypto } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import type { MlsStoreApi } from "@repo/chat-mls-core/client";

import { newX25519PubRaw } from "./crypto.js";

// File-backed persistence for the tracer bot. One JSON file holds the whole
// bot state: engine snapshots (per account), the local MLS group registry, the
// chat mirror, and the bot's stable identity (seed + deviceId). Bytes are
// base64. Single-writer by construction (one CLI invocation at a time) — the
// Lambda version swaps this for a Neon table + a per-account advisory lock.
//
// Implements MlsStoreApi (what MlsClient injects) plus a few bot-only helpers
// (identity, chatId→groupId forward lookup) the orchestration needs.

interface GroupRec {
  groupIdB64: string;
  chat_id: string | null;
  last_applied_epoch: number;
  joined_at: number;
}
interface ChatRec {
  id: string;
  kind: "direct" | "group";
  name: string | null;
  mlsGroupIdB64: string | null;
}
interface Persisted {
  identity?: { seedB64: string; deviceId: string; x25519PubB64: string };
  snapshots: Record<string, { snapshotB64: string; updated_at: number }>;
  groups: Record<string, GroupRec>; // keyed by groupId hex
  chats: Record<string, ChatRec>; // keyed by chatId
}

function b64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}
function unb64(s: string): Uint8Array {
  return new Uint8Array(Buffer.from(s, "base64"));
}
function hex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("hex");
}

export interface BotStore extends MlsStoreApi {
  getOrCreateIdentity(): {
    seed: Uint8Array;
    deviceId: string;
    x25519Pub: Uint8Array;
  };
  /** Forward lookup the MlsStoreApi doesn't expose: chatId → GroupId bytes. */
  getChatGroupId(chatId: string): Uint8Array | null;
  listChats(): ChatRec[];
}

export function createFileStore(stateDir: string): BotStore {
  const file = join(stateDir, "state.json");

  function load(): Persisted {
    if (!existsSync(file)) {
      return { snapshots: {}, groups: {}, chats: {} };
    }
    return JSON.parse(readFileSync(file, "utf8")) as Persisted;
  }
  function save(state: Persisted): void {
    mkdirSync(stateDir, { recursive: true });
    writeFileSync(file, JSON.stringify(state, null, 2), "utf8");
  }

  return {
    getOrCreateIdentity() {
      const state = load();
      if (state.identity) {
        return {
          seed: unb64(state.identity.seedB64),
          deviceId: state.identity.deviceId,
          x25519Pub: unb64(state.identity.x25519PubB64),
        };
      }
      const seed = new Uint8Array(32);
      webcrypto.getRandomValues(seed);
      const deviceId = randomUUID();
      const x25519Pub = newX25519PubRaw();
      state.identity = {
        seedB64: b64(seed),
        deviceId,
        x25519PubB64: b64(x25519Pub),
      };
      save(state);
      return { seed, deviceId, x25519Pub };
    },

    getChatGroupId(chatId) {
      const rec = load().chats[chatId];
      return rec?.mlsGroupIdB64 ? unb64(rec.mlsGroupIdB64) : null;
    },

    listChats() {
      return Object.values(load().chats);
    },

    // ── MlsStoreApi ──────────────────────────────────────────────────────────
    async loadEngineSnapshot(accountId) {
      const row = load().snapshots[accountId];
      return row
        ? { snapshot: unb64(row.snapshotB64), updated_at: row.updated_at }
        : null;
    },
    async saveEngineSnapshot(accountId, snapshot) {
      const state = load();
      state.snapshots[accountId] = {
        snapshotB64: b64(snapshot),
        updated_at: Date.now(),
      };
      save(state);
    },
    async clearEngineSnapshot(accountId) {
      const state = load();
      delete state.snapshots[accountId];
      save(state);
    },

    async upsertGroup(input) {
      const state = load();
      const key = hex(input.groupId);
      const existing = state.groups[key];
      // Mirror mls-store.ts ON CONFLICT: keep last_applied_epoch, COALESCE chat_id.
      state.groups[key] = {
        groupIdB64: b64(input.groupId),
        chat_id: input.chatId ?? existing?.chat_id ?? null,
        last_applied_epoch:
          existing?.last_applied_epoch ?? input.initialEpoch ?? 0,
        joined_at: existing?.joined_at ?? Date.now(),
      };
      save(state);
    },
    async setLastAppliedEpoch(groupId, epoch) {
      const state = load();
      const rec = state.groups[hex(groupId)];
      if (rec) {
        rec.last_applied_epoch = epoch;
        save(state);
      }
    },
    async getGroup(groupId) {
      const rec = load().groups[hex(groupId)];
      if (!rec) return null;
      return {
        group_id: unb64(rec.groupIdB64),
        chat_id: rec.chat_id,
        last_applied_epoch: rec.last_applied_epoch,
        joined_at: rec.joined_at,
      };
    },
    async listGroups() {
      return Object.values(load().groups).map((r) => ({
        groupId: unb64(r.groupIdB64),
        chatId: r.chat_id,
        lastAppliedEpoch: r.last_applied_epoch,
      }));
    },
    async clearAllGroups() {
      const state = load();
      state.groups = {};
      save(state);
    },

    async setChatMlsGroupId(chatId, groupId) {
      const state = load();
      const rec = state.chats[chatId];
      if (!rec) return { updates: 0 };
      rec.mlsGroupIdB64 = b64(groupId);
      save(state);
      return { updates: 1 };
    },
    async ensureChatForDebug(chatId, kind = "group") {
      const state = load();
      if (state.chats[chatId]) return { created: false };
      state.chats[chatId] = {
        id: chatId,
        kind,
        name: null,
        mlsGroupIdB64: null,
      };
      save(state);
      return { created: true };
    },
    async upsertChat(input) {
      const state = load();
      const existing = state.chats[input.id];
      state.chats[input.id] = {
        id: input.id,
        kind: input.kind,
        name: input.name ?? existing?.name ?? null,
        // COALESCE: don't drop an existing link if this upsert omits it.
        mlsGroupIdB64: input.mlsGroupId
          ? b64(input.mlsGroupId)
          : (existing?.mlsGroupIdB64 ?? null),
      };
      save(state);
    },
    async chatIdByGroupId(groupId) {
      const target = b64(groupId);
      const hit = Object.values(load().chats).find(
        (c) => c.mlsGroupIdB64 === target,
      );
      return hit?.id ?? null;
    },
  };
}
