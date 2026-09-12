// G01 — Inventario del workspace corporativo. Solo lectura: nunca mueve, borra ni
// modifica nada. Cataloga cada entrada de primer nivel de la raiz del workspace con su
// tamano, si es un checkout Git independiente (remoto propio), conteo de archivos, ultima
// modificacion y una clasificacion contra el catalogo de productos conocido del diseno
// GetUpSoft+ORCA. Las entradas que no calzan con ningun producto conocido quedan
// explicitamente "unclassified" — nunca se les asigna un destino a ciegas.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]):/, '$1:')), '..', '..');

const EXCLUDE_FROM_HEAVY_SCAN = new Set([
  'node_modules', '.venv', 'temp_venv', '.git', '.mypy_cache', '.pytest_cache', '.ruff_cache',
]);

// Catalogo de productos conocidos (seccion 1.2 del diseno) -> patrones de ruta de primer
// nivel que indican pertenencia. No es exhaustivo a proposito: lo que no matchea queda
// "unclassified" en vez de forzarse a una categoria.
const KNOWN_PRODUCTS = [
  { product: 'orca', patterns: [/^apps\/orca$/, /^apps\/orca-client-gateway$/, /^apps\/backend-nest$/, /^platform\/orca\/src$/] },
  { product: 'careerai', patterns: [/^data\/careerai/, /^scripts\/.*careerai/, /^platform\/orca\/src\/careerai$/] },
  { product: 'galantes-jewelry', patterns: [/^06_E_Commerce_Lux\/Galantesjewelry$/, /^historicos\/galantes-root-loose-copy-.*$/] },
  { product: 'chefalitas', patterns: [/^apps\/odoo\/.*Chefalitas/i, /^apps\/local_printer_agent\/Chefalitas/i] },
  { product: 'getupnet', patterns: [/^products\/getupnet$/] },
  { product: 'smartdoor', patterns: [/^products\/smartdoor$/, /^apps\/backend-nest$/] },
  { product: 'boat', patterns: [/^02_Products\/GetUpSoftBoat$/] },
  { product: 'easycount', patterns: [/^products\/easycount$/, /^historicos\/easycount-app-empty-copy-.*$/] },
  { product: 'printing-workers', patterns: [/^apps\/local_printer_agent$/, /^apps\/printer_proxy$/] },
  { product: 'odoo-erp', patterns: [/^integrations\/odoo\/shared-addons$/, /^odoo$/] },
  { product: 'n8n', patterns: [/^apps\/n8n$/] },
  { product: 'ai-automation', patterns: [/^03_AI_Automation$/] },
  { product: 'research-labs', patterns: [/^08_Research_Labs$/, /^apps\/research-ai$/, /^apps\/hyperframes$/] },
  { product: 'libraries-tools', patterns: [/^07_Libraries_Tools$/, /^libs$/, /^libraries$/] },
  { product: 'infrastructure', patterns: [/^01_Core_Platform$/, /^06_Infrastructure_Networking$/, /^infra$/] },
  { product: 'knowledge-center', patterns: [/^_Knowledge_Center$/, /^docs$/, /^context$/] },
  { product: 'backups-archives', patterns: [/^05_Backups$/, /^09_Archives$/] },
  { product: 'agents-shared', patterns: [/^\.agents$/, /^\.hermes$/, /^\.codex$/, /^\.claude$/] },
];

function classify(name) {
  for (const entry of KNOWN_PRODUCTS) {
    if (entry.patterns.some((p) => p.test(name))) return entry.product;
  }
  return 'unclassified';
}

function hasOwnGit(fullPath) {
  return fs.existsSync(path.join(fullPath, '.git'));
}

function gitRemote(fullPath) {
  if (!hasOwnGit(fullPath)) return null;
  try {
    return execSync('git remote get-url origin', { cwd: fullPath, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'no-remote';
  }
}

function scanDirStats(fullPath, { maxDepth = 6 } = {}) {
  let files = 0;
  let bytes = 0;
  let lastModified = 0;
  let truncated = false;
  const stack = [{ p: fullPath, depth: 0 }];
  let visited = 0;
  const VISIT_CAP = 40000; // evita colgar el inventario en arboles gigantescos (node_modules, etc.)

  while (stack.length) {
    const { p: current, depth } = stack.pop();
    visited += 1;
    if (visited > VISIT_CAP) { truncated = true; break; }
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (EXCLUDE_FROM_HEAVY_SCAN.has(entry.name)) continue;
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (depth < maxDepth) stack.push({ p: entryPath, depth: depth + 1 });
      } else if (entry.isFile()) {
        files += 1;
        try {
          const stat = fs.statSync(entryPath);
          bytes += stat.size;
          if (stat.mtimeMs > lastModified) lastModified = stat.mtimeMs;
        } catch { /* archivo inaccesible: se cuenta pero no se puede leer su tamano */ }
      }
    }
  }
  return { files, bytes, lastModified: lastModified ? new Date(lastModified).toISOString() : null, truncated };
}

const entries = fs.readdirSync(root, { withFileTypes: true })
  .filter((e) => e.name !== '.git')
  .map((e) => e.name)
  .sort();

const inventory = [];
for (const name of entries) {
  const fullPath = path.join(root, name);
  const stat = fs.statSync(fullPath);
  const isDir = stat.isDirectory();
  const stats = isDir ? scanDirStats(fullPath) : { files: 1, bytes: stat.size, lastModified: new Date(stat.mtimeMs).toISOString(), truncated: false };
  const ownGit = isDir && hasOwnGit(fullPath);
  const remote = ownGit ? gitRemote(fullPath) : null;
  const nameHash = crypto.createHash('sha256').update(name).digest('hex').slice(0, 16);

  inventory.push({
    path: name,
    type: isDir ? 'directory' : 'file',
    classification: classify(name),
    independentGitCheckout: ownGit,
    gitRemote: remote,
    fileCount: stats.files,
    approxBytes: stats.bytes,
    lastModified: stats.lastModified,
    scanTruncated: stats.truncated,
    identityHash: nameHash,
  });
}

const summary = {
  schemaVersion: 'getupsoft.workspace-inventory.v1',
  generatedAt: new Date().toISOString(),
  root,
  totalEntries: inventory.length,
  classified: inventory.filter((i) => i.classification !== 'unclassified').length,
  unclassified: inventory.filter((i) => i.classification === 'unclassified').length,
  independentGitCheckouts: inventory.filter((i) => i.independentGitCheckout).length,
  truncatedScans: inventory.filter((i) => i.scanTruncated).length,
  totalApproxBytes: inventory.reduce((sum, i) => sum + i.approxBytes, 0),
  exclusions: [...EXCLUDE_FROM_HEAVY_SCAN],
  note: 'Escaneo de primer nivel con estadisticas agregadas por entrada (archivos, bytes, ultima modificacion). No calcula hash de contenido por archivo individual (arbol demasiado grande para una sola pasada) — identityHash es solo un identificador estable del NOMBRE de la entrada para el manifiesto de migracion, no un hash de contenido. Un hash de contenido por-archivo es una tarea propia (herramienta dedicada) si se necesita para verificacion de integridad exacta en G02+.',
  entries: inventory,
};

const outPath = path.join(root, 'governance', 'migration', 'inventory', 'workspace-inventory.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`);

console.log(JSON.stringify({
  ok: true,
  task: 'G01',
  totalEntries: summary.totalEntries,
  classified: summary.classified,
  unclassified: summary.unclassified,
  independentGitCheckouts: summary.independentGitCheckouts,
  truncatedScans: summary.truncatedScans,
  totalApproxGB: (summary.totalApproxBytes / 1024 / 1024 / 1024).toFixed(2),
  output: path.relative(root, outPath),
}, null, 2));
