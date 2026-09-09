// G03 — Catalogo corporativo. Genera governance/registry/projects/<slug>.json a partir del
// inventario real de G01 (nunca de supuestos): cada producto declarado en el diseno
// GetUpSoft+ORCA queda con su lista real de rutas de primer nivel encontradas, su patron
// arquitectonico asignado (seccion 1.2 del diseno) y su estado de verificacion honesto —
// "not-yet-independent-checkout" para todo lo que G01 no encontro con .git propio.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]):/, '$1:')), '..', '..');
const inventory = JSON.parse(fs.readFileSync(path.join(root, 'governance/migration/inventory/workspace-inventory.json'), 'utf8'));

// Patron arquitectonico + deploymentAuthority segun la tabla 1.2 del diseno GetUpSoft+ORCA.
const PROJECTS = {
  orca: { pattern: 'monolito-modular-hexagonal', deploymentAuthority: 'orca-project-ci', owner: 'joel' },
  'careerai-agent': { pattern: 'worker-pipeline-adapter', deploymentAuthority: 'orca-project-ci', owner: 'claude+joel', note: 'submodulo funcional dentro de orca, no producto independiente' },
  'galantes-jewelry': { pattern: 'nextjs-por-funcionalidades', deploymentAuthority: 'client-solutions-ci', owner: 'joel' },
  chefalitas: { pattern: 'mvc-nativo-odoo', deploymentAuthority: 'product-ci', owner: 'joel' },
  getupnet: { pattern: 'mvc-nativo-odoo', deploymentAuthority: 'product-ci', owner: 'joel' },
  smartdoor: { pattern: 'hexagonal-maquina-estados', deploymentAuthority: 'product-ci', owner: 'joel' },
  boat: { pattern: 'pipeline-de-ingenieria', deploymentAuthority: 'product-ci', owner: 'joel' },
  easycount: { pattern: 'capas-hexagonal-existente', deploymentAuthority: 'product-ci', owner: 'joel', note: 'conservar FastAPI/modelos propios; solo adaptar integracion con ORCA' },
  'printing-workers': { pattern: 'worker-pipeline', deploymentAuthority: 'workers-ci', owner: 'joel' },
  'odoo-erp': { pattern: 'mvc-nativo-odoo-multi-version', deploymentAuthority: 'integrations-ci', owner: 'joel' },
  n8n: { pattern: 'adapter-instalacion-licenciada', deploymentAuthority: 'integrations-ci', owner: 'joel', note: 'verificar licencia n8n antes de redistribuir/alojar para clientes' },
  'ai-automation': { pattern: 'worker-ai', deploymentAuthority: 'workers-ci', owner: 'joel' },
  'research-labs': { pattern: 'biblioteca-o-prototipo-aislado', deploymentAuthority: 'labs-none', owner: 'joel' },
  'libraries-tools': { pattern: 'biblioteca-interna', deploymentAuthority: 'libraries-none', owner: 'joel' },
  infrastructure: { pattern: 'infra-compose-hosts', deploymentAuthority: 'infrastructure-ci', owner: 'joel' },
  'knowledge-center': { pattern: 'documentos-versionados', deploymentAuthority: 'governance-none', owner: 'joel' },
  'backups-archives': { pattern: 'archivo-fuera-de-git', deploymentAuthority: 'none', owner: 'joel' },
  'agents-shared': { pattern: 'memoria-compartida-multiagente', deploymentAuthority: 'none', owner: 'joel+claude' },
};

const now = new Date().toISOString();
let created = 0;
for (const [slug, config] of Object.entries(PROJECTS)) {
  const classification = slug === 'careerai-agent' ? 'careerai' : slug;
  const matchingPaths = inventory.entries.filter((e) => e.classification === classification).map((e) => e.path);
  const independentCheckouts = inventory.entries.filter((e) => e.classification === classification && e.independentGitCheckout);

  const entry = {
    schemaVersion: 1,
    slug,
    architecturePattern: config.pattern,
    deploymentAuthority: config.deploymentAuthority,
    owner: config.owner,
    note: config.note || null,
    realPathsFound: matchingPaths,
    independentGitCheckout: independentCheckouts.length > 0,
    gitRemotes: independentCheckouts.map((e) => e.gitRemote),
    verificationStatus: matchingPaths.length === 0
      ? 'not-found-in-inventory'
      : independentCheckouts.length > 0
        ? 'independent-checkout-verified'
        : 'found-not-yet-independent-checkout',
    sourceInventory: 'governance/migration/inventory/workspace-inventory.json',
    generatedAt: now,
  };

  fs.writeFileSync(path.join(root, 'governance/registry/projects', `${slug}.json`), `${JSON.stringify(entry, null, 2)}\n`);
  created += 1;
}

console.log(JSON.stringify({
  ok: true, task: 'G03', projectsCataloged: created,
  verified: Object.keys(PROJECTS).length,
}, null, 2));
