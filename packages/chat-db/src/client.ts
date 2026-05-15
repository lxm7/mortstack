import { open, type DB } from "@op-engineering/op-sqlite";
import { getOrCreatePassphrase, type PassphraseSource } from "./key";
import { runMigrations, LATEST_VERSION } from "./migrations";

const DB_NAME = "chat.sqlite";

export interface ChatDbHandle {
  db: DB;
  version: number;
  keySource: PassphraseSource;
}

let cached: ChatDbHandle | null = null;

export async function getChatDb(): Promise<ChatDbHandle> {
  if (cached) return cached;

  const { passphrase, source } = await getOrCreatePassphrase();
  const db = open({ name: DB_NAME, encryptionKey: passphrase });

  await db.execute("PRAGMA foreign_keys = ON");
  await db.execute("PRAGMA journal_mode = WAL");

  await runMigrations(db);

  cached = { db, version: LATEST_VERSION, keySource: source };
  return cached;
}

export async function closeChatDb(): Promise<void> {
  if (!cached) return;
  await cached.db.close();
  cached = null;
}
