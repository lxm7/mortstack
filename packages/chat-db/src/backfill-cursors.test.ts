import { createRequire } from "node:module";
import { beforeEach, describe, expect, it } from "vitest";
import type { DB } from "@op-engineering/op-sqlite";

import { getAllCursors, getCursor, setCursor } from "./backfill-cursors";
import { runMigrations } from "./migrations";

// node:sqlite is a Node 22 builtin that Vite's bundled builtins list doesn't
// know — a static import makes Vite strip `node:` and try to bundle `sqlite`.
// Load it through a runtime createRequire (seeded from the CJS __filename, not
// import.meta which the CommonJS tsconfig forbids) so Vite never sees it.
interface Stmt {
  all(...params: unknown[]): unknown[];
  run(...params: unknown[]): unknown;
}
const nodeRequire = createRequire(__filename);
const { DatabaseSync } = nodeRequire("node:sqlite") as {
  DatabaseSync: new (path: string) => { prepare(sql: string): Stmt };
};

// Thin adapter: wraps node:sqlite to the op-sqlite `DB.execute(sql, params?)`
// → { rows } shape the store helpers + migration runner expect. Lets us exercise
// the REAL SQL — schema migration and the monotonic CAST guard — against a real
// SQLite engine, no logic duplication. Test-only.
function isQuery(sql: string): boolean {
  const s = sql.trim().toUpperCase();
  return s.startsWith("SELECT") || (s.startsWith("PRAGMA") && !s.includes("="));
}

function makeDb(): DB {
  const sqlite = new DatabaseSync(":memory:");
  const execute = (sql: string, params: unknown[] = []) => {
    const stmt = sqlite.prepare(sql);
    if (isQuery(sql)) {
      return Promise.resolve({ rows: stmt.all(...(params as never[])) });
    }
    stmt.run(...(params as never[]));
    return Promise.resolve({ rows: [] });
  };
  return { execute } as unknown as DB;
}

describe("backfill_cursors", () => {
  let db: DB;

  beforeEach(async () => {
    db = makeDb();
    await runMigrations(db);
  });

  it("migration 5 creates the table (schema at LATEST)", async () => {
    const res = await db.execute(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='backfill_cursors'`,
    );
    expect((res.rows ?? []).length).toBe(1);
  });

  it("getCursor returns null for an un-backfilled chat", async () => {
    expect(await getCursor(db, "chat-1")).toBeNull();
  });

  it("setCursor inserts then getCursor reads it back", async () => {
    await setCursor(db, "chat-1", "42");
    expect(await getCursor(db, "chat-1")).toBe("42");
  });

  it("advances monotonically and never regresses", async () => {
    await setCursor(db, "chat-1", "42");
    await setCursor(db, "chat-1", "100"); // forward
    expect(await getCursor(db, "chat-1")).toBe("100");

    await setCursor(db, "chat-1", "99"); // stale/out-of-order — must be ignored
    expect(await getCursor(db, "chat-1")).toBe("100");
  });

  it("compares numerically, not lexically (9 < 10)", async () => {
    await setCursor(db, "chat-1", "9");
    await setCursor(db, "chat-1", "10"); // lexically "10" < "9"; numerically >
    expect(await getCursor(db, "chat-1")).toBe("10");
  });

  it("handles serials beyond 2^53 as strings", async () => {
    const big = "9007199254740993"; // 2^53 + 1
    await setCursor(db, "chat-1", big);
    expect(await getCursor(db, "chat-1")).toBe(big);
  });

  it("getAllCursors returns every chat's cursor as a map", async () => {
    await setCursor(db, "chat-1", "5");
    await setCursor(db, "chat-2", "12");
    expect(await getAllCursors(db)).toEqual({ "chat-1": "5", "chat-2": "12" });
  });
});
