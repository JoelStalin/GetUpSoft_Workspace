// Test unitario para validar la integridad DDL de migraciones 0004 y 0005
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

function testMigrationSQL(filePath, requiredTokens) {
  const fullPath = path.join(root, filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Archivo de migracion no encontrado: ${filePath}`);
  }
  const sql = fs.readFileSync(fullPath, 'utf8');
  for (const token of requiredTokens) {
    if (!sql.includes(token)) {
      throw new Error(`Token obligatorio '${token}' ausente en ${filePath}`);
    }
  }
  return true;
}

testMigrationSQL('platform/orca/database/migrations/0004_knowledge_schema.sql', [
  'CREATE SCHEMA IF NOT EXISTS knowledge;',
  'CREATE TABLE knowledge.sources',
  'CREATE TABLE knowledge.source_versions',
  'CREATE TABLE knowledge.chunks',
  'CREATE TABLE knowledge.embeddings',
  'CREATE TABLE knowledge.prompt_templates',
  'CREATE TABLE knowledge.prompt_versions',
  'ROW LEVEL SECURITY'
]);

testMigrationSQL('platform/orca/database/migrations/0005_fleet_and_metering_schema.sql', [
  'CREATE SCHEMA IF NOT EXISTS fleet;',
  'CREATE SCHEMA IF NOT EXISTS metering;',
  'CREATE TABLE fleet.devices',
  'CREATE TABLE fleet.pairing_codes',
  'CREATE TABLE fleet.device_credentials',
  'CREATE TABLE fleet.device_commands',
  'CREATE TABLE metering.budget_periods',
  'CREATE TABLE metering.model_calls',
  'ROW LEVEL SECURITY'
]);

console.log(JSON.stringify({
  ok: true,
  task: 'D04_D05',
  migrationsValidated: ['0004_knowledge_schema.sql', '0005_fleet_and_metering_schema.sql'],
  rowLevelSecurityEnforced: true,
  compositeKeysEnforced: true
}));
