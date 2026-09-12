import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const outputDir = path.join(root, 'docs', 'orca');
const excluded = new Set(['.git', '.canonical-getupsoft', '.codex', '.claude', 'node_modules', '.next', '.venv', 'temp_venv', '__pycache__', '.mypy_cache', '.pytest_cache', '.ruff_cache', 'build', 'tmp', 'logs', 'backups', 'artifacts', 'test-results', 'graphify-out', 'temp-deploy-clone']);
const sensitiveNames = /(^|\.)(env|env\.|key|pem|p12|pfx|cookie|cookies|token|secret)/i;
function runGit(args) {
  try { return execFileSync('git', args, { cwd: root, encoding: 'utf8' }); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return null;
  }
}
const trackedOutput = runGit(['ls-files']);
const statusOutput = runGit(['status', '--short']);
const tracked = new Set((trackedOutput || '').split(/\r?\n/).filter(Boolean));
const status = (statusOutput || '')
  .split(/\r?\n/).filter(Boolean).map((line) => ({ code: line.slice(0, 2), path: line.slice(3) }));

const maxDepth = 4;
const indexedRoots = new Set(['apps', 'context', 'data', 'docs', 'scripts', 'task-ledger', 'memory', '.hermes', 'tests']);
function walk(current, relative = '') {
  const entries = [];
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const rel = path.join(relative, entry.name).replaceAll('\\', '/');
    if (!relative && entry.isDirectory() && !indexedRoots.has(entry.name)) continue;
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory() && rel.split('/').length < maxDepth) entries.push(...walk(absolute, rel));
    else {
      const stat = fs.statSync(absolute);
      entries.push({ path: rel, bytes: stat.size, tracked: tracked.has(rel), sensitive_name: sensitiveNames.test(entry.name) });
    }
  }
  return entries;
}

const files = walk(root);
const topLevel = [...new Set(files.map(({ path: file }) => file.split('/')[0]))].sort();
const inventory = {
  schema_version: 'orca.workspace.inventory.v1',
  generated_at: new Date().toISOString(),
  root: root.replaceAll('\\', '/'),
  policy: { read_only_inventory: true, secrets_included: false, git_metadata_available: Boolean(trackedOutput && statusOutput !== null), excluded_directories: [...excluded].sort() },
  top_level_domains: topLevel,
  files: files.length,
  tracked_files: files.filter((file) => file.tracked).length,
  untracked_or_modified_entries: status,
  sensitive_named_files: files.filter((file) => file.sensitive_name).map(({ path: file }) => file),
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'workspace-inventory.json'), `${JSON.stringify(inventory, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(outputDir, 'preservation-manifest.json'), `${JSON.stringify({
  schema_version: 'orca.preservation-manifest.v1',
  generated_at: inventory.generated_at,
  source_inventory: 'workspace-inventory.json',
  preservation_rules: [
    'No files are deleted, moved, or overwritten by this inventory.',
    'Sensitive-named files are listed by path only; contents and values are never copied.',
    'Existing modifications remain owned by their originating agent or user until explicitly handed off.',
    'Generated artifacts are evidence-only and must not become production deployment inputs.',
  ],
  domains: topLevel.map((domain) => ({ domain, classification: domain === 'apps' || domain === 'data' || domain === 'docs' ? 'implemented_or_operational' : 'inventory_only' })),
  handoff: { next_action: 'review ownership and classify pending entries before destructive or external changes', agent_id: 'codex-careerai-01' },
}, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ ok: true, files: inventory.files, tracked_files: inventory.tracked_files, status_entries: status.length, output: 'docs/orca' }));
