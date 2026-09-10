#!/usr/bin/env node
// B01 — CLI minima del bootstrap corporativo. Solo comandos de solo-lectura por ahora
// (inventory, doctor, validate) — up/down/bootstrap/migrate son B02+ (planificador DAG),
// no se implementan aqui para no adelantar trabajo sin el planificador que los respalda.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProjectManifest, detectDependencyCycle } from './validate-manifest.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const [, , command, ...args] = process.argv;

function loadRegistry() {
  const dir = path.join(root, 'governance', 'registry', 'projects');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}

function cmdInventory() {
  const invPath = path.join(root, 'governance', 'migration', 'inventory', 'workspace-inventory.json');
  if (!fs.existsSync(invPath)) {
    console.log(JSON.stringify({ ok: false, reason: 'no hay inventario — correr tools/workspace-cli/inventory.mjs primero (G01)' }));
    process.exitCode = 1;
    return;
  }
  const inv = JSON.parse(fs.readFileSync(invPath, 'utf8'));
  console.log(JSON.stringify({ ok: true, generatedAt: inv.generatedAt, totalEntries: inv.totalEntries, unclassified: inv.unclassified }, null, 2));
}

function cmdDoctor() {
  // Solo lectura: nunca instala, nunca arranca nada. Distingue "declarado en el
  // registry", "manifest valido" y "encontrado en disco" — no asume que uno implica otro.
  const registry = loadRegistry();
  const report = registry.map((entry) => ({
    slug: entry.slug,
    configured: true,
    foundOnDisk: (entry.realPathsFound || []).length > 0,
    verificationStatus: entry.verificationStatus,
  }));
  console.log(JSON.stringify({ ok: true, projects: report.length, report }, null, 2));
}

function cmdValidate() {
  const manifestPath = args[0];
  if (!manifestPath) {
    console.log(JSON.stringify({ ok: false, reason: 'uso: validate <ruta-al-manifest.json>' }));
    process.exitCode = 1;
    return;
  }
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    console.log(JSON.stringify({ ok: false, reason: `no se pudo leer/parsear el manifest: ${error.message}` }));
    process.exitCode = 1;
    return;
  }
  const result = validateProjectManifest(manifest);
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

const COMMANDS = { inventory: cmdInventory, doctor: cmdDoctor, validate: cmdValidate };

if (!COMMANDS[command]) {
  console.log(JSON.stringify({ ok: false, reason: `comando desconocido: "${command || '(vacio)'}"`, availableCommands: Object.keys(COMMANDS) }));
  process.exitCode = 1;
} else {
  COMMANDS[command]();
}

export { validateProjectManifest, detectDependencyCycle };
