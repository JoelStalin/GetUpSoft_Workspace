// Nodo cv-gap-analyzer (node-inventory.json: "Que pide la oferta que el CV no muestra").
//
// application-tailor.mjs ya reporta "gaps", pero esos gaps salen ENTERAMENTE del LLM — no hay
// ninguna verificacion local, determinista y gratis antes de gastar esa llamada. Este modulo
// es esa capa previa: extrae terminos de requisito del texto de la oferta con regex puro (sin
// LLM, sin red, sin costo) y los cruza contra el CV. Sirve para dos cosas: (1) dar una senal
// rapida sin esperar/pagar un LLM, y (2) servir de base para detectar si el LLM alucino un gap
// que en realidad si esta en el CV (o al reves).
//
// Regla igual que el resto del proyecto: esto NO decide que el candidato "no sirve" para la
// vacante. Solo reporta que palabras de la oferta no aparecen en el CV — la decision de que
// hacer con eso es del cliente (ver application-tailor.mjs: "gaps... son su decision").

// Lineas que tipicamente introducen requisitos, en varios idiomas: sirven para pesar mas los
// terminos que aparecen ahi que los que aparecen en texto de relleno (mision, beneficios).
const REQUIREMENT_SECTION_MARKERS = /requisitos|requirements|required|must have|debe tener|conocimiento de|experiencia (en|con)|dominio de|experience (in|with)|qualifications|se requiere/i;

// Terminos tecnicos tipicos: acronimos en mayusculas (RPG, SQL, AS400), nombres con puntos o
// numeros pegados (Node.js, C++, AS/400), y palabras compuestas con guion. No pretende ser
// exhaustivo — es deliberadamente conservador para no inflar "requisitos" con ruido (nombres
// de la empresa, ciudades, etc.).
const TERM_PATTERN = /\b([A-Z]{2,}[A-Z0-9]*(?:\/[A-Z0-9]+)?|[A-Z][a-z]+(?:\.[a-z]+)+|[A-Za-z]+[-+][A-Za-z0-9]+)\b/g;

function normalize(text) {
  return String(text || '').toLowerCase();
}

// Extrae candidatos a "termino de requisito" del texto de la oferta. Determinista, sin LLM:
// no entiende significado, solo forma (acronimos, tecnologias con puntuacion tipica).
export function extractRequirementTerms(opportunityText) {
  const text = String(opportunityText || '');
  const lines = text.split('\n');
  const seen = new Map(); // termino normalizado -> { term, weight }

  lines.forEach((line) => {
    const inRequirementSection = REQUIREMENT_SECTION_MARKERS.test(line);
    const matches = line.match(TERM_PATTERN) || [];
    matches.forEach((raw) => {
      const term = raw.trim();
      if (term.length < 2) return;
      const key = term.toLowerCase();
      const weight = inRequirementSection ? 2 : 1;
      const existing = seen.get(key);
      if (!existing || weight > existing.weight) seen.set(key, { term, weight });
    });
  });

  return [...seen.values()]
    .sort((a, b) => b.weight - a.weight)
    .map((item) => item.term);
}

function termAppearsInCv(term, cvTextNormalized) {
  // Coincidencia por palabra completa cuando el termino es simple (evita que "AS" matchee
  // dentro de "Assistant"); para terminos con puntuacion (Node.js, C++) se usa substring
  // directo porque \b no funciona bien alrededor de simbolos.
  const key = term.toLowerCase();
  if (/^[a-z0-9]+$/i.test(term)) {
    return new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(cvTextNormalized);
  }
  return cvTextNormalized.includes(key);
}

// Cruza los terminos de requisito contra el CV. Si `requirementTerms` no se pasa, se
// auto-extraen del texto de la oferta con extractRequirementTerms.
export function analyzeCvGap({ cvText, opportunityText, requirementTerms = null } = {}) {
  if (!cvText) return { ok: false, reason: 'falta el texto del CV' };
  if (!opportunityText && !requirementTerms) return { ok: false, reason: 'falta el texto de la oferta o una lista explicita de requisitos' };

  const terms = requirementTerms || extractRequirementTerms(opportunityText);
  const cvNormalized = normalize(cvText);

  const matched = [];
  const missing = [];
  for (const term of terms) {
    if (termAppearsInCv(term, cvNormalized)) matched.push(term);
    else missing.push(term);
  }

  const coveragePercent = terms.length ? Math.round((matched.length / terms.length) * 100) : 100;

  return {
    ok: true,
    total_terms: terms.length,
    matched,
    missing,
    coverage_percent: coveragePercent,
    // Se muestra siempre, aunque la cobertura sea alta: la decision de postular con carencias
    // es del cliente, no de este nodo.
    requires_human_review: missing.length > 0,
  };
}
