import { isBotWall, sanitizeOcrPayload, parseOcrOutput } from '../apps/orca/src/careerai/bot-wall.mjs';

// Textos reales capturados por OCR durante las corridas en vivo del 2026-08-26.
const INDEED_WALL = 'indeed Company Reviews Additional Verification Required Your Ray ID for this request is a3174a01cafcc82c Verifying... CLOUDFLARE';
const WWR_WALL = 'weworkremotely.com Performing security verification This website uses a security service to protect against malicious bots.';
const REAL_LISTING = 'software engineer jobs in Remote Sort by: relevance Junior Software Engineer Corporate Tools Remote $75.000 a year Full-time';
const FOOTER_MENTION = 'This site is hosted behind Cloudflare. Privacy Policy. Terms of Service.';

if (!isBotWall(INDEED_WALL)) throw new Error('Debe detectar el muro de Indeed');
if (!isBotWall(WWR_WALL)) throw new Error('Debe detectar el muro de WeWorkRemotely');
if (isBotWall(REAL_LISTING)) throw new Error('Un listado real no es un muro');
if (isBotWall(FOOTER_MENTION)) throw new Error('Mencionar Cloudflare en el pie no es un muro (falso positivo)');
if (isBotWall('')) throw new Error('Texto vacio no es un muro');

// El BEL (0x07) que el OCR produce al leer el logotipo de Cloudflare rompia
// JSON.parse y dejaba la evidencia OCR vacia en el registro de escalamiento.
const BEL = String.fromCharCode(7);
const payload = `{"ok":true,"lines":6,"text":"verifies you are not ${BEL} Verifying... CLOUDFLARE"}`;

let threw = false;
try { JSON.parse(payload); } catch { threw = true; }
if (!threw) throw new Error('El fixture debe reproducir el fallo original de JSON.parse');

const parsed = parseOcrOutput(payload);
if (parsed.ok !== true) throw new Error('El saneado debe permitir parsear el OCR');
if (!parsed.text.includes('Verifying')) throw new Error('El texto reconocido debe conservarse');
if (sanitizeOcrPayload(payload).includes(BEL)) throw new Error('No deben quedar caracteres de control');

console.log(JSON.stringify({
  ok: true,
  wall_signatures_detected: 2,
  false_positives_rejected: 2,
  ocr_control_chars: 'sanitized',
}));
