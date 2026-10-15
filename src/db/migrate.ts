import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";

import { getDb } from "./index";
import { seedIfEmpty } from "./seed";

const db = getDb();
migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
seedIfEmpty();
console.log("Migrations + seed finished");
