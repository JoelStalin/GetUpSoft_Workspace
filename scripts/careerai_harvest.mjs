// Harvest real sobre el perfil persistente: scroll infinito, extraccion de ofertas,
// OCR nativo de Windows como verificacion visual y captura de correos de contacto.
// Sigue siendo prepare-only: no rellena ni envia formularios.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from '../apps/orca/workflow-editor/node_modules/playwright/index.mjs';
import { isBotWall, parseOcrOutput } from '../apps/orca/src/careerai/bot-wall.mjs';

const OUT = 'task-ledger/evidence/careerai/live-test';
const STORE = 'data/careerai/harvest.jsonl';
const PROFILE_DIR = path.resolve(process.env.CAREERAI_PROFILE_DIR || 'apps/orca/chrome_profile/careerai-migrated');
const QUERY = process.env.CAREERAI_QUERY || 'software engineer';
const SOURCE = process.env.CAREERAI_SOURCE || 'indeed';
const SOURCES = {
  indeed: {
    url: (q) => `https://www.indeed.com/jobs?q=${encodeURIComponent(q)}&l=Remote`,
    cardSelector: '.job_seen_beacon, [data-testid="slider_item"]',
  },
  weworkremotely: {
    url: (q) => `https://weworkremotely.com/remote-jobs/search?term=${encodeURIComponent(q)}`,
    // WWR no tiene tarjetas con estructura estable: las ofertas reales son los enlaces
    // /remote-jobs/<slug>. Los selectores de tarjeta capturan secciones de categoria.
    anchorSelector: 'a[href*="/remote-jobs/"]',
    anchorExclude: /find-your-plan|\/search|categories|companies|100-percent|region|top-/i,
    anchorSlug: /\/remote-jobs\/[a-z0-9-]{12,}$/i,
  },
};
// Firmas de muro anti-bot: si aparecen, el workflow debe pausar y escalar, nunca
// devolver "0 ofertas" en silencio como si la busqueda no tuviera resultados.
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
const source = SOURCES[SOURCE];
if (!source) throw new Error(`Fuente desconocida: ${SOURCE}`);
await page.goto(source.url(QUERY), { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(4000);

// Gate `captcha`: el muro anti-bot NO aborta el flujo. El navegador es visible, asi
// que se pausa y se cede el control al humano para que resuelva el desafio; si no se
// resuelve dentro del plazo, entonces si se escala.
const WALL_WAIT_MINUTES = Number(process.env.CAREERAI_WALL_WAIT_MINUTES || 3);

async function pageText() {
  return page.evaluate(() => document.body.innerText).catch(() => '');
}

if (isBotWall(await pageText())) {
  const wallShot = `${OUT}/harvest-bot-wall.png`;
  await page.screenshot({ path: wallShot }).catch(() => {});
  await new Promise((r) => setTimeout(r, 800)); // deja que el archivo se cierre antes del OCR
  const wallOcr = ocr(wallShot);
  console.log(JSON.stringify({
    step: 'bot_wall_detected', source: SOURCE, gate: 'captcha',
    action: 'human_takeover', wait_minutes: WALL_WAIT_MINUTES,
    instruction: 'Resuelve la verificacion en la ventana abierta. El agente espera.',
    ocr_text: (wallOcr.text || '').slice(0, 200),
  }));

  const wallDeadline = Date.now() + WALL_WAIT_MINUTES * 60 * 1000;
  let cleared = false;
  while (Date.now() < wallDeadline) {
    await new Promise((r) => setTimeout(r, 10000));
    if (!isBotWall(await pageText())) { cleared = true; break; }
  }

  if (!cleared) {
    const blocked = {
      ok: false, status: 'blocked_bot_wall', source: SOURCE, url: page.url(),
      gate: 'captcha', escalate_to: 'blocked-escalation',
      human_takeover_offered: true, human_takeover_minutes: WALL_WAIT_MINUTES,
      evidence: { screenshot: wallShot, ocr_text: (wallOcr.text || '').slice(0, 300) },
      submit_performed: false, detected_at: new Date().toISOString(),
    };
    fs.appendFileSync(STORE, `${JSON.stringify(blocked)}
`);
    fs.writeFileSync(`${OUT}/harvest.json`, JSON.stringify(blocked, null, 2));
    console.log(JSON.stringify(blocked));
    await context.close();
    process.exit(0);
  }
  console.log(JSON.stringify({ step: 'bot_wall_cleared', source: SOURCE, by: 'human_takeover' }));
  await page.waitForTimeout(3000);
}

const seen = new Map();
for (let i = 0; i < SCROLLS; i += 1) {
  const batch = source.anchorSelector
    ? await page.evaluate((cfg) => Array.from(document.querySelectorAll(cfg.selector))
        .map((a) => ({
          title: a.innerText.trim().split(String.fromCharCode(10)).filter(Boolean)[0] || null,
          company: null,
          location: null,
          url: a.href.split('?')[0],
          snippet: a.innerText.trim().slice(0, 400),
        }))
        .filter((job) => job.title
          && !new RegExp(cfg.exclude, 'i').test(job.url)
          && new RegExp(cfg.slug, 'i').test(job.url)),
      { selector: source.anchorSelector, exclude: source.anchorExclude.source, slug: source.anchorSlug.source })
    : await page.evaluate((selector) => Array.from(document.querySelectorAll(selector))
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
    .filter((job) => job.title), source.cardSelector);
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
  ok: true, source: SOURCE, query: QUERY, scrolls: SCROLLS,
  unique_jobs: seen.size, detailed: jobs.length,
  emails_found: jobs.reduce((total, job) => total + (job.emails?.length || 0), 0),
  ocr: { ok: ocrResult.ok, lines: ocrResult.lines ?? 0 },
  submit_performed: false, harvested_at: new Date().toISOString(),
};
fs.appendFileSync(STORE, `${JSON.stringify({ ...report, jobs })}\n`);
fs.writeFileSync(`${OUT}/harvest.json`, JSON.stringify({ ...report, jobs }, null, 2));
console.log(JSON.stringify(report));
await context.close();
