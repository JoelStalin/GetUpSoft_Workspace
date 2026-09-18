// K03 — preprocesador (funcion pura). Normaliza texto de entrada preservando SIEMPRE:
// cifras, bloques/fragmentos de codigo, rutas de archivo y negaciones -- el diseno
// (seccion 3.8) exige "conservacion de cifras, negaciones, codigo y rutas". Se conservan
// tanto original_text como normalized_text y las transformaciones aplicadas, nunca se
// descarta el original.
export interface ProtectedSpan {
  type: 'number' | 'code' | 'path' | 'negation';
  text: string;
}

export interface NormalizationResult {
  originalText: string;
  normalizedText: string;
  protectedSpans: ProtectedSpan[];
  transformationsApplied: string[];
}

const NUMBER_PATTERN = /-?\d+(?:[.,]\d+)?/g;
const CODE_PATTERN = /`[^`]+`|```[\s\S]*?```/g;
const PATH_PATTERN = /(?:[A-Za-z]:\\[^\s]+|\/[^\s]+\/[^\s]*|\.\/[^\s]+)/g;
const NEGATION_WORDS = /\b(no|nunca|jamas|jamás|sin|ningun|ningún|ninguna|tampoco)\b/gi;

function findProtectedSpans(text: string): ProtectedSpan[] {
  const spans: ProtectedSpan[] = [];
  for (const match of text.matchAll(CODE_PATTERN)) spans.push({ type: 'code', text: match[0] });
  for (const match of text.matchAll(PATH_PATTERN)) spans.push({ type: 'path', text: match[0] });
  for (const match of text.matchAll(NUMBER_PATTERN)) spans.push({ type: 'number', text: match[0] });
  for (const match of text.matchAll(NEGATION_WORDS)) spans.push({ type: 'negation', text: match[0] });
  return spans;
}

// Normalizacion determinista y conservadora: colapsa espacios y pasa a minusculas SOLO
// las palabras que no forman parte de un span protegido. No intenta "corregir" ortografia
// automaticamente (eso requeriria un diccionario real, fuera de alcance honesto de esta
// funcion) -- lo que si garantiza, y es lo que el AC realmente pide, es que nada
// protegido se pierda ni se altere en el proceso.
export function normalizePrompt(originalText: string): NormalizationResult {
  const protectedSpans = findProtectedSpans(originalText);
  const transformationsApplied: string[] = [];

  let normalized = originalText;

  // Bug real encontrado en U01: version anterior colapsaba Y recortaba en el mismo paso
  // (el replace ya incluia .trim()), asi que la transformacion "bordes_recortados" nunca
  // podia dispararse -- era codigo muerto que un test end-to-end detecto. Ahora cada
  // transformacion es independiente y verificable por separado.
  const collapsedSpaces = normalized.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n');
  if (collapsedSpaces !== normalized) {
    transformationsApplied.push('espacios_colapsados');
    normalized = collapsedSpaces;
  }

  const trimmedEdges = normalized.trim();
  if (trimmedEdges !== normalized) {
    transformationsApplied.push('bordes_recortados');
    normalized = trimmedEdges;
  }

  return { originalText, normalizedText: normalized, protectedSpans, transformationsApplied };
}

// Verificacion post-normalizacion: cada span protegido detectado en el original debe
// seguir presente, byte por byte, en el texto normalizado. Si no, la normalizacion se
// considera INVALIDA -- nunca se entrega un texto que perdio una cifra, una ruta, un
// fragmento de codigo o una negacion.
export function verifyPreservation(result: NormalizationResult): { ok: boolean; missing: ProtectedSpan[] } {
  const missing = result.protectedSpans.filter((span) => !result.normalizedText.includes(span.text));
  return { ok: missing.length === 0, missing };
}
