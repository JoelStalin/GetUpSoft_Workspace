// Harvest real sobre el perfil persistente: scroll infinito, extraccion de ofertas,
// OCR nativo de Windows como verificacion visual y captura de correos de contacto.
// Sigue siendo prepare-only: no rellena ni envia formularios.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from '../apps/orca/workflow-editor/node_modules/playwright/index.mjs';

const OUT = 'task-ledger/evidence/careerai/live-test';
const STORE = 'data/careerai/harvest.jsonl';
const PROFILE_DIR = path.resolve(process.env.CAREERAI_PROFILE_DIR || 'apps/orca/chrome_profile/careerai-migrated');
const QUERY = process.env.CAREERAI_QUERY || 'software engineer';
const SCROLLS = Number(process.env.CAREERAI_SCROLLS || 6);
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.dirname(STORE), { recursive: true });

function ocr(imagePath) {
  try {
    const raw = execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass',
      '-File', 'scripts/careerai_ocr.ps1', '-ImagePath', imagePath], { encoding: 'utf8', timeout: 60000 });
    return JSON.parse(raw.trim().split('\n').pop());
  } catch (error) {
    return { ok: false, error: String(error).split('\n')[0] };
  }
}

const context = await chromium.launchPersistentContext(PROFILE_DIR, {
  channel: 'chrome', headless: false, viewport: null, args: ['--start-maximized'],
});
const page = context.pages()[0] || await context.newPage();

// 1. Discovery con scroll: se recorre el listado hasta agotar SCROLLS.
await page.goto(`https://www.indeed.com/jobs?q=${encodeURIComponent(QUERY)}&l=Remote`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(4000);

const seen = new Map();
for (let i = 0; i < SCROLLS; i += 1) {
  const batch = await page.evaluate(() => Array.from(document.querySelectorAll('.job_seen_beacon, [data-testid="slider_item"]'))
    .map((card) => {
      const link = card.querySelector('a[href*="/rc/clk"], a[href*="/viewjob"], h2 a');
      return {
        title: (card.querySelector('h2') || {}).innerText?.trim() || null,
        company: (card.querySelector('[data-testid="company-name"]') || {}).innerText?.trim() || null,
        location: (card.querySelector('[data-testid="text-location"]') || {}).innerText?.trim() || null,
        url: link ? link.href.split('&')[0] : null,
        snippet: card.innerText.trim().slice(0, 400),
      };
    })
    .filter((job) => job.title));
  for (const job of batch) if (job.url && !seen.has(job.url)) seen.set(job.url, job);
  await page.mouse.wheel(0, 2200);
  await page.waitForTimeout(2500);
  console.log(JSON.stringify({ step: 'scroll', pass: i + 1, unique_jobs: seen.size }));
}

// 2. Verificacion visual por OCR de lo que se ve en pantalla.
const shot = `${OUT}/harvest-list.png`;
await page.screenshot({ path: shot });
const ocrResult = ocr(shot);
console.log(JSON.stringify({ step: 'ocr', ok: ocrResult.ok, lines: ocrResult.lines ?? 0, language: ocrResult.language ?? null }));

// 3. Captura de correos de contacto en las descripciones (sin abrir formularios).
const jobs = [...seen.values()].slice(0, Number(process.env.CAREERAI_DETAIL_LIMIT || 5));
for (const job of jobs) {
  try {
    await page.goto(job.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(2500);
    const text = await page.evaluate(() => document.body.innerText);
    job.emails = [...new Set((text.match(EMAIL_RE) || []).filter((e) => !/\.(png|jpg|svg)$/i.test(e)))].slice(0, 5);
    job.description_chars = text.length;
    job.apply_button_present = await page.locator('button:has-text("Apply"), a:has-text("Apply")').count() > 0;
  } catch (error) {
    job.error = String(error).split('\n')[0];
  }
  job.submit_performed = false;
  console.log(JSON.stringify({ step: 'detail', title: job.title, emails: job.emails?.length ?? 0 }));
}

const report = {
  ok: true, query: QUERY, scrolls: SCROLLS,
  unique_jobs: seen.size, detailed: jobs.length,
  emails_found: jobs.reduce((total, job) => total + (job.emails?.length || 0), 0),
  ocr: { ok: ocrResult.ok, lines: ocrResult.lines ?? 0 },
  submit_performed: false, harvested_at: new Date().toISOString(),
};
fs.appendFileSync(STORE, `${JSON.stringify({ ...report, jobs })}\n`);
fs.writeFileSync(`${OUT}/harvest.json`, JSON.stringify({ ...report, jobs }, null, 2));
console.log(JSON.stringify(report));
await context.close();
