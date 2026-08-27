// Ejecuta el nodo catalog-researcher contra los proveedores reales y fusiona el resultado
// en el catalogo. Uso: node scripts/careerai_research_catalog.mjs <family_id> [--dry-run]
import fs from 'node:fs';
import { loadLocalEnv, availableProviders } from '../apps/orca/src/careerai/llm-council.mjs';
import { researchFamily, mergeIntoCatalog } from '../apps/orca/src/careerai/catalog-researcher.mjs';

loadLocalEnv();

const familyId = process.argv[2];
const dryRun = process.argv.includes('--dry-run');
if (!familyId) {
  console.error('Uso: node scripts/careerai_research_catalog.mjs <family_id> [--dry-run]');
  process.exit(1);
}

const providers = availableProviders();
console.log(JSON.stringify({ step: 'council', available: providers }));
if (!providers.length) {
  console.error(JSON.stringify({ ok: false, status: 'needs_human', reason: 'ningun proveedor configurado' }));
  process.exit(1);
}

const catalogPath = 'data/careerai/profession-catalog.json';
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const research = await researchFamily(familyId, { catalog });

console.log(JSON.stringify({
  step: 'research',
  status: research.status,
  providers_answered: research.providers_answered || [],
  proposal_counts: research.proposal
    ? Object.fromEntries(Object.entries(research.proposal).map(([key, value]) => [key, value.length]))
    : null,
  needs_review_counts: research.needs_review
    ? Object.fromEntries(Object.entries(research.needs_review).map(([key, value]) => [key, value.length]))
    : null,
}));

if (!research.ok) {
  console.error(JSON.stringify({ ok: false, status: research.status, reason: research.reason, failed: research.failed }));
  process.exit(1);
}

if (dryRun) {
  console.log(JSON.stringify({ ok: true, dry_run: true, proposal: research.proposal, needs_review: research.needs_review }, null, 2));
  process.exit(0);
}

fs.writeFileSync(catalogPath, `${JSON.stringify(mergeIntoCatalog(catalog, research), null, 2)}\n`);
console.log(JSON.stringify({ ok: true, family_id: familyId, status: research.status, catalog_updated: catalogPath }));
