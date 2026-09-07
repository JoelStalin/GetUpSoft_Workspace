// Punto de entrada ejecutable del nodo real linkedin-jobs-search (apps/orca/src/careerai/
// linkedin-jobs-node.mjs). Abre el navegador con la sesion ya persistida y llama al nodo tal
// como lo haria el orquestador del workflow — este script ES lo que un paso automatico del
// pipeline dispararia, no un atajo aparte.
//
// Uso: node scripts/run_careerai_linkedin_jobs_node.mjs [run_id]
// Sin run_id, genera uno nuevo (util para pruebas puntuales de este nodo en aislamiento).
import path from 'node:path';
import { chromium } from '../apps/orca/workflow-editor/node_modules/playwright/index.mjs';
import { discoverLinkedInJobs } from '../apps/orca/src/careerai/linkedin-jobs-node.mjs';

const runId = process.argv[2] || `linkedin-jobs-${Date.now()}`;
const profileDir = path.resolve(process.env.CAREERAI_PROFILE_DIR || 'apps/orca/chrome_profile/careerai-migrated');
const maxResults = Number(process.env.LINKEDIN_SEARCH_MAX || 5);
const screenshotPath = `task-ledger/evidence/careerai/live-test/linkedin-jobs-node-${runId}.png`;

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

console.log(JSON.stringify({ step: 'node_start', node: 'linkedin-jobs-search', run_id: runId }));
const result = await discoverLinkedInJobs(runId, { page, maxResults, screenshotPath });
console.log(JSON.stringify({ step: 'node_complete', run_id: runId, ...result }));

await context.close();
process.exit(result.ok ? 0 : 1);
