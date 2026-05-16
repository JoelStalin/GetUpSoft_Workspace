import BetterSqlite3 from "better-sqlite3";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "migrations");

export type Database = BetterSqlite3.Database;

export function openDatabase(dbPath: string): Database {
  const db = new BetterSqlite3(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  runMigrations(db);
  return db;
}

function runMigrations(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      appliedAt TEXT NOT NULL
    )
  `);

  const applied = new Set(
    (db.prepare("SELECT version FROM schema_migrations").all() as { version: string }[])
      .map((r) => r.version)
  );

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const insertMigration = db.prepare(
    "INSERT INTO schema_migrations (version, appliedAt) VALUES (?, ?)"
  );

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    db.exec(sql);
    insertMigration.run(file, new Date().toISOString());
  }
}
