import { Replicache } from "replicache";
import { createSQLiteKVStore } from "./kv-store";
import { mutators, type Mutators } from "./mutators";
import { loadSessionToken } from "@/lib/auth/session";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";

let _rep: Replicache<Mutators> | null = null;

export function getReplicache(userId: string): Replicache<Mutators> {
  if (_rep) return _rep;

  _rep = new Replicache<Mutators>({
    name: `sessions-${userId}`,
    // Replicache license key — get one at https://replicache.dev
    // Free for open source / development
    licenseKey: process.env.EXPO_PUBLIC_REPLICACHE_LICENSE_KEY ?? "l123456789",
    mutators,

    // Use SQLite as the KV backing store instead of the default (IndexedDB)
    experimentalCreateKVStore: createSQLiteKVStore,

    // Pull: server sends canonical state patches
    puller: async (req) => {
      const token = await loadSessionToken();
      const res = await fetch(`${API_URL}/replicache/pull`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(req),
      });
      const data = await res.json();
      return {
        response: data,
        httpRequestInfo: { httpStatusCode: res.status, errorMessage: "" },
      };
    },

    // Push: sends local mutations to server for processing
    pusher: async (req) => {
      const token = await loadSessionToken();
      const res = await fetch(`${API_URL}/replicache/push`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(req),
      });
      return {
        httpRequestInfo: { httpStatusCode: res.status, errorMessage: "" },
      };
    },

    // Pull every 30s when app is foregrounded
    pullInterval: 30_000,

    // Push immediately on mutation (default)
    pushDelay: 0,
  });

  return _rep;
}

export async function closeReplicache(): Promise<void> {
  if (_rep) {
    await _rep.close();
    _rep = null;
  }
}
