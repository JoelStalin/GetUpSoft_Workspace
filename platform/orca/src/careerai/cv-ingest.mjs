// Nodo cv-ingest: extrae el texto del CV que sube el cliente. Sin dependencias externas,
// porque el CV es un documento personal y no debe salir de la maquina para leerse.
// Soporta PDF de texto (incluida la cadena ASCII85 + Flate que genera ReportLab) y texto plano.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

// ASCII85 tal como lo emite ReportLab: sin delimitadores Adobe y terminado en "~>".
function decodeAscii85(input) {
  const clean = input.replace(/\s/g, '').replace(/^<~/, '').replace(/~>$/, '');
  const out = [];
  let tuple = 0;
  let count = 0;
  for (const char of clean) {
    if (char === 'z' && count === 0) { out.push(0, 0, 0, 0); continue; }
    const code = char.charCodeAt(0) - 33;
    if (code < 0 || code > 84) continue;
    tuple = tuple * 85 + code;
    count += 1;
    if (count === 5) {
      out.push((tuple >>> 24) & 255, (tuple >>> 16) & 255, (tuple >>> 8) & 255, tuple & 255);
      tuple = 0;
      count = 0;
    }
  }
  if (count > 0) {
    for (let i = count; i < 5; i += 1) tuple = tuple * 85 + 84;
    const bytes = [(tuple >>> 24) & 255, (tuple >>> 16) & 255, (tuple >>> 8) & 255, tuple & 255];
    out.push(...bytes.slice(0, count - 1));
  }
  return Buffer.from(out);
}

function decodeStream(body) {
  let data = body;
  const asText = data.toString('latin1').trimEnd();
  if (asText.endsWith('~>')) {
    try { data = decodeAscii85(asText); } catch { /* se intenta el siguiente filtro */ }
  }
  try { return zlib.inflateSync(data); } catch { return data; }
}

export function extractPdfText(buffer) {
  const chunks = [];
  let position = 0;
  while (true) {
    const start = buffer.indexOf('stream', position, 'latin1');
    if (start === -1) break;
    const end = buffer.indexOf('endstream', start, 'latin1');
    if (end === -1) break;
    let bodyStart = start + 6;
    while (buffer[bodyStart] === 0x0d || buffer[bodyStart] === 0x0a) bodyStart += 1;
    chunks.push(decodeStream(buffer.subarray(bodyStart, end)));
    position = end + 9;
  }

  const blob = Buffer.concat(chunks).toString('latin1');
  const parts = blob.match(/\((?:[^()\\]|\\.)*\)/g) || [];
  return parts
    .map((part) => part.slice(1, -1))
    .join(' ')
    .replace(/\\([()])/g, '$1')
    .replace(/\\/g, '')
    // ReportLab escribe los acentos como codigos octales sueltos; se normalizan a letra.
    .replace(/(\d{3})/g, (match) => {
      const map = { 341: 'á', 351: 'é', 355: 'í', 363: 'ó', 372: 'ú', 361: 'ñ', 177: '-', 372: 'ú' };
      return map[match] !== undefined ? map[match] : match;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

export function ingestCv(filePath) {
  if (!fs.existsSync(filePath)) {
    const error = new Error(`CV no encontrado: ${filePath}`);
    error.code = 'CV_NOT_FOUND';
    throw error;
  }
  const buffer = fs.readFileSync(filePath);
  const extension = path.extname(filePath).toLowerCase();
  const text = extension === '.pdf' ? extractPdfText(buffer) : buffer.toString('utf8');

  if (!text || text.length < 200) {
    // Un CV escaneado no da texto: se escala en vez de seguir con una extraccion vacia,
    // que produciria un perfil profesional inventado.
    return {
      ok: false,
      status: 'needs_ocr',
      reason: 'el documento no contiene texto extraible (posible PDF escaneado)',
      characters: text.length,
      source_path: filePath,
    };
  }

  return {
    ok: true,
    status: 'ingested',
    source_path: filePath,
    // El CV original se referencia por hash y nunca se copia al repositorio.
    sha256: crypto.createHash('sha256').update(buffer).digest('hex'),
    bytes: buffer.length,
    characters: text.length,
    text,
    ingested_at: new Date().toISOString(),
  };
}
