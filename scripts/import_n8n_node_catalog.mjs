import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const explicitSource = process.argv.find((value) => value.startsWith('--source='))?.slice('--source='.length);

function findPackage() {
  if (explicitSource && fs.existsSync(path.join(explicitSource, 'dist', 'types', 'nodes.json'))) return explicitSource;
  const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
  const dlxRoot = path.join(localAppData, 'pnpm-cache', 'dlx');
  if (!fs.existsSync(dlxRoot)) throw new Error(`No se encontró el cache pnpm de n8n en ${dlxRoot}`);
  const stack = [dlxRoot];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const candidate = path.join(current, entry.name);
      if (entry.name.startsWith('n8n-nodes-base@')) {
        const packageRoot = path.join(candidate, 'node_modules', 'n8n-nodes-base');
        if (fs.existsSync(path.join(packageRoot, 'dist', 'types', 'nodes.json'))) return packageRoot;
      }
      if (current.split(path.sep).length - dlxRoot.split(path.sep).length < 5) stack.push(candidate);
    }
  }
  throw new Error('No se encontró n8n-nodes-base dentro de la instancia local');
}

function nodeKind(node) {
  if (node.group?.includes('trigger') || node.name.toLowerCase().includes('trigger')) return 'trigger';
  if (node.group?.includes('input')) return 'input';
  if (node.group?.includes('output')) return 'action';
  return 'utility';
}

function category(node, kind) {
  const primary = node.codex?.categories?.[0];
  if (primary) return kind === 'trigger' ? `Triggers · ${primary}` : primary;
  if (kind === 'trigger') return 'Triggers';
  if (node.group?.includes('transform')) return 'Data transformation';
  return 'Core Nodes';
}

const packageRoot = findPackage();
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
const rawNodes = JSON.parse(fs.readFileSync(path.join(packageRoot, 'dist', 'types', 'nodes.json'), 'utf8'));
const publicRoot = path.join(workspace, 'apps', 'orca', 'workflow-editor', 'public', 'n8n-icons');
const catalogPath = path.join(workspace, 'data', 'orca', 'n8n-node-catalog.json');
fs.mkdirSync(publicRoot, { recursive: true });
fs.mkdirSync(path.dirname(catalogPath), { recursive: true });

const copiedIconNames = new Set();
const nodes = rawNodes.map((node) => {
  const kind = nodeKind(node);
  let iconUrl = null;
  if (typeof node.iconUrl === 'string') {
    const marker = 'n8n-nodes-base/';
    const relative = node.iconUrl.includes(marker) ? node.iconUrl.slice(node.iconUrl.indexOf(marker) + marker.length) : null;
    const source = relative ? path.join(packageRoot, ...relative.split('/')) : null;
    if (source && fs.existsSync(source)) {
      const extension = path.extname(source) || '.svg';
      const filename = `${node.name.replace(/[^A-Za-z0-9._-]/g, '-')}${extension.toLowerCase()}`;
      fs.copyFileSync(source, path.join(publicRoot, filename));
      iconUrl = `/n8n-icons/${filename}`;
      copiedIconNames.add(filename);
    }
  }
  return {
    type: `n8n-nodes-base.${node.name}`,
    name: node.name,
    label: node.displayName || node.defaults?.name || node.name,
    description: node.description || '',
    category: category(node, kind),
    kind,
    group: node.group || [],
    version: node.version,
    defaultVersion: node.defaultVersion ?? (Array.isArray(node.version) ? node.version.at(-1) : node.version),
    iconUrl,
    inputs: node.inputs || [],
    outputs: node.outputs || [],
    credentials: node.credentials || [],
    webhooks: node.webhooks || [],
    properties: node.properties || [],
    usableAsTool: Boolean(node.usableAsTool),
    aliases: node.codex?.alias || [],
    documentation: node.codex?.resources || {},
  };
});

const catalog = {
  generatedAt: new Date().toISOString(), source: 'local-n8n-runtime', package: packageJson.name,
  version: packageJson.version, total: nodes.length,
  triggers: nodes.filter((node) => node.kind === 'trigger').length,
  actions: nodes.filter((node) => node.kind === 'action').length,
  uniqueTypes: new Set(nodes.map((node) => node.type)).size,
  icons: copiedIconNames.size, nodes,
};
fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
for (const licenseName of ['LICENSE.md', 'LICENSE_EE.md']) {
  const source = path.join(packageRoot, licenseName);
  if (fs.existsSync(source)) fs.copyFileSync(source, path.join(publicRoot, `n8n-nodes-base-${licenseName}`));
}
console.log(JSON.stringify({ ok: true, catalogPath, publicRoot, version: catalog.version, total: catalog.total, triggers: catalog.triggers, actions: catalog.actions, icons: catalog.icons }));
