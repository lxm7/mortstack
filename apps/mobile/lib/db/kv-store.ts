import * as SQLite from "expo-sqlite";

// Implements Replicache's KVStore interface backed by expo-sqlite.
// Replicache uses this for all local persistence — no separate Drizzle layer
// on synced data (avoids dual-write complexity).
//
// Interface contract (replicache/src/kv/store.ts):
//   KVStore { read(): Read, write(): Write, close(): void, closed: boolean }
//   Read    { get(key), has(key), release() }
//   Write   { get(key), has(key), put(key, value), del(key), commit(), release() }

export type ReadonlyJSONValue =
  | null
  | boolean
  | number
  | string
  | readonly ReadonlyJSONValue[]
  | { readonly [key: string]: ReadonlyJSONValue };

let _db: SQLite.SQLiteDatabase | null = null;

function getDb(): SQLite.SQLiteDatabase {
  if (!_db) {
    _db = SQLite.openDatabaseSync("replicache.db");
    _db.execSync(
      "CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL)",
    );
  }
  return _db;
}

class SQLiteRead {
  closed = false;
  protected _db: SQLite.SQLiteDatabase;

  constructor(db: SQLite.SQLiteDatabase) {
    this._db = db;
  }

  async get(key: string): Promise<ReadonlyJSONValue | undefined> {
    const row = this._db.getFirstSync<{ value: string }>(
      "SELECT value FROM kv WHERE key = ?",
      key,
    );
    return row ? (JSON.parse(row.value) as ReadonlyJSONValue) : undefined;
  }

  async has(key: string): Promise<boolean> {
    const row = this._db.getFirstSync<{ count: number }>(
      "SELECT COUNT(*) as count FROM kv WHERE key = ?",
      key,
    );
    return (row?.count ?? 0) > 0;
  }

  release(): void {}
}

class SQLiteWrite extends SQLiteRead {
  private _ops: (() => void)[] = [];

  async put(key: string, value: ReadonlyJSONValue): Promise<void> {
    const serialized = JSON.stringify(value);
    this._ops.push(() => {
      this._db.runSync(
        "INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        key,
        serialized,
      );
    });
  }

  async del(key: string): Promise<void> {
    this._ops.push(() => {
      this._db.runSync("DELETE FROM kv WHERE key = ?", key);
    });
  }

  async commit(): Promise<void> {
    this._db.withTransactionSync(() => {
      for (const op of this._ops) op();
    });
    this._ops = [];
  }

  override release(): void {
    this._ops = [];
  }
}

export class SQLiteKVStore {
  readonly name: string;
  closed = false;
  private _db: SQLite.SQLiteDatabase;

  constructor(name: string) {
    this.name = name;
    this._db = getDb();
  }

  async read(): Promise<SQLiteRead> {
    return new SQLiteRead(this._db);
  }

  async write(): Promise<SQLiteWrite> {
    return new SQLiteWrite(this._db);
  }

  async close(): Promise<void> {
    this.closed = true;
    // Don't close the shared DB connection — other stores may share it
  }
}

// Factory passed to Replicache's `experimentalCreateKVStore` option
export function createSQLiteKVStore(name: string): SQLiteKVStore {
  return new SQLiteKVStore(name);
}
