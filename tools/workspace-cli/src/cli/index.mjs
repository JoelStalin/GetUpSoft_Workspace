#!/usr/bin/env node
// B01-B04 CLI corporativa integral del bootstrap.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProjectManifest, detectDependencyCycle } from './validate-manifest.mjs';
import { planExecutionOrder, detectPortConflicts } from '../planner/dag.mjs';
import { ProcessSupervisor } from '../process-supervision/index.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const [, , command, ...args] = process.argv;

function parseFlag(flagName, defaultValue = null) {
  const index = args.indexOf(flagName);
  if (index !== -1 && args[index + 1]) {
    return args[index + 1];
  }
  return defaultValue;
}

function loadRegistry() {
  const dir = path.join(root, 'governance', 'registry', 'projects');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}

function loadProfile(profileName) {
  const profilePath = path.join(root, 'tools', 'workspace-cli', 'profiles', `${profileName}.json`);
  if (!fs.existsSync(profilePath)) {
    throw new Error(`Perfil '${profileName}' no encontrado en tools/workspace-cli/profiles/`);
  }
  return JSON.parse(fs.readFileSync(profilePath, 'utf8'));
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

function cmdPlan() {
  const profileName = parseFlag('--profile', 'orca-local');
  try {
    const profile = loadProfile(profileName);
    const manifests = profile.services.map((svcSlug) => ({
      slug: svcSlug,
      dependencies: []
    }));
    const plan = planExecutionOrder(manifests, { targetProfile: profileName });
    console.log(JSON.stringify({ ok: true, profile: profileName, plan }, null, 2));
  } catch (err) {
    console.log(JSON.stringify({ ok: false, error: err.message, code: err.code }));
    process.exitCode = 1;
  }
}

function cmdStatus() {
  const profileName = parseFlag('--profile', 'orca-local');
  const supervisor = new ProcessSupervisor();
  const status = supervisor.getStatus();
  console.log(JSON.stringify({ ok: true, profile: profileName, activeProcesses: status }, null, 2));
}

function cmdUp() {
  const profileName = parseFlag('--profile', 'orca-local');
  try {
    const profile = loadProfile(profileName);
    console.log(JSON.stringify({
      ok: true,
      action: 'up',
      profile: profileName,
      message: `Perfil '${profileName}' verificado y listo para arranque supervisado.`
    }, null, 2));
  } catch (err) {
    console.log(JSON.stringify({ ok: false, error: err.message }));
    process.exitCode = 1;
  }
}

function cmdDown() {
  const profileName = parseFlag('--profile', 'orca-local');
  const supervisor = new ProcessSupervisor();
  const res = supervisor.rollbackAll(`Detencion solicitada para perfil ${profileName}`);
  console.log(JSON.stringify({ ok: true, action: 'down', profile: profileName, details: res }, null, 2));
}

const COMMANDS = {
  inventory: cmdInventory,
  doctor: cmdDoctor,
  validate: cmdValidate,
  plan: cmdPlan,
  status: cmdStatus,
  up: cmdUp,
  down: cmdDown
};

if (!COMMANDS[command]) {
  console.log(JSON.stringify({
    ok: false,
    reason: `comando desconocido: "${command || '(vacio)'}"`,
    availableCommands: Object.keys(COMMANDS)
  }));
  process.exitCode = 1;
} else {
  COMMANDS[command]();
}

export { validateProjectManifest, detectDependencyCycle };
