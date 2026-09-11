// Punto de entrada ejecutable del nodo external-form-fill para LinkedIn Easy Apply.
// PREPARE-ONLY: rellena lo seguro, nunca hace click en enviar. El plan resultante (que se
// relleno, que quedo pendiente de revision humana) es lo que el aprobador ve antes de decidir.
//
// Uso: node scripts/run_careerai_linkedin_easy_apply_node.mjs <job_url> [run_id]
import path from 'node:path';
import { chromium } from '../apps/orca/workflow-editor/node_modules/playwright/index.mjs';
import { prepareLinkedInEasyApply } from '../platform/orca/src/careerai/linkedin-easy-apply-node.mjs';

const jobUrl = process.argv[2];
if (!jobUrl) throw new Error('Uso: node scripts/run_careerai_linkedin_easy_apply_node.mjs <job_url> [run_id]');
const runId = process.argv[3] || `linkedin-easy-apply-${Date.now()}`;
const profileDir = path.resolve(process.env.CAREERAI_PROFILE_DIR || 'apps/orca/chrome_profile/careerai-migrated');
const screenshotPath = `task-ledger/evidence/careerai/live-test/linkedin-easy-apply-${runId}.png`;

// Perfil MINIMO y explicito: solo lo que el usuario ya confirmo. Nada se inventa aqui — si
// falta un dato, el campo correspondiente queda para revision humana (ver ats-adapters.mjs).
const profile = {
  email: process.env.CAREERAI_PROFILE_EMAIL || '',
  phone: process.env.CAREERAI_PROFILE_PHONE || '',
  first_name: process.env.CAREERAI_PROFILE_FIRST_NAME || '',
  last_name: process.env.CAREERAI_PROFILE_LAST_NAME || '',
  linkedin: process.env.CAREERAI_PROFILE_LINKEDIN_URL || '',
};
const assets = {}; // Sin CV/carta cargados explicitamente en este pase: esos campos quedan pendientes de revision.

const context = await chromium.launchPersistentContext(profileDir, {
  channel: 'chrome',
  headless: false,
  viewport: { width: 1366, height: 900 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
});
await context.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
});
const page = context.pages().length ? context.pages()[0] : await context.newPage();

console.log(JSON.stringify({ step: 'node_start', node: 'external-form-fill', provider: 'linkedin_easy_apply', run_id: runId, job_url: jobUrl }));
const result = await prepareLinkedInEasyApply(runId, { page, jobUrl, profile, assets, screenshotPath });
console.log(JSON.stringify({ step: 'node_complete', run_id: runId, ...result }));

await context.close();
process.exit(result.ok ? 0 : 1);
