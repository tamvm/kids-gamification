import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";

import * as schema from "./schema";

function resolveDbPath() {
  return (
    process.env.DATABASE_PATH ??
    path.join(process.cwd(), "data", "app.db")
  );
}

let cached: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (cached) return cached;

  const dbPath = resolveDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  cached = drizzle(sqlite, { schema });
  return cached;
}

export type Db = ReturnType<typeof getDb>;
export { schema };
