import fs from 'node:fs';

const file = new URL('../docs/orca/project-registry.json', import.meta.url);
const registry = JSON.parse(fs.readFileSync(file, 'utf8'));
const ids = new Set(registry.projects.map((project) => project.id));
for (const required of ['orca', 'careerai', 'tinderbotj', 'galantesjewelry', 'shared-continuity']) {
  if (!ids.has(required)) throw new Error(`Missing project registry entry: ${required}`);
}
const tinder = registry.projects.find((project) => project.id === 'tinderbotj');
if (!tinder.reusable_patterns?.includes('persistent-browser-profile') || tinder.forbidden_cross_domain_data?.includes('tokens') !== true) {
  throw new Error('Tinder reference isolation contract failed');
}
const careerai = registry.projects.find((project) => project.id === 'careerai');
if (careerai.external_actions !== 'approval-required' || careerai.providers.includes('linkedin-auto-submit')) {
  throw new Error('CareerAI external action gate contract failed');
}
console.log(JSON.stringify({ ok: true, schema_version: registry.schema_version, projects: registry.projects.length }));
