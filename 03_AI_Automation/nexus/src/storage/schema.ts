import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const initialCoreSchemaPath = join(
  __dirname,
  "migrations",
  "001_initial_core.sql",
);

export function loadInitialCoreSchema(): string {
  return readFileSync(initialCoreSchemaPath, "utf8");
}
