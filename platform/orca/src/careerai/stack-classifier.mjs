// Nodo stack-classifier: decide a que profesion del catalogo DEL CLIENTE pertenece una
// oferta. Es lo que evita que una vacante de Java que menciona AS/400 de pasada entre a la
// cola como si fuera de iSeries.
import { loadCatalog, matchesNegative } from './search-profile.mjs';

// El titulo pesa mas que la descripcion: una vacante se define por el puesto, no por la
// lista de tecnologias que la empresa usa en algun lugar de la casa.
const WEIGHT = { title: 3, description: 1, adjacent: 0.5 };
const MIN_CONFIDENCE = 0.15;

function occurrences(haystack, term) {
  // Limites de palabra para que "CL" no coincida dentro de "CLIENT" ni "RPG" dentro de "RPGX".
  const escaped = String(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'gi');
  return (String(haystack || '').match(pattern) || []).length;
}

function scoreFamily(opportunity, family) {
  const title = opportunity?.title || '';
  const description = opportunity?.description || '';
  const matched = [];
  let score = 0;

  for (const term of family.terms) {
    const inTitle = occurrences(title, term);
    const inBody = occurrences(description, term);
    if (inTitle) { score += WEIGHT.title * inTitle; matched.push(term); }
    else if (inBody) { score += WEIGHT.description * Math.min(inBody, 3); matched.push(term); }
  }
  for (const term of family.adjacent || []) {
    if (occurrences(title, term) || occurrences(description, term)) {
      score += WEIGHT.adjacent;
      matched.push(term);
    }
  }
  return { score, matched: [...new Set(matched)] };
}

export function classify(opportunity, { rankedFamilies = [], catalog = loadCatalog() } = {}) {
  const families = rankedFamilies.length
    ? catalog.families.filter((family) => rankedFamilies.includes(family.id))
    : catalog.families;

  if (!families.length) {
    const error = new Error('No hay familias del catalogo contra las que clasificar');
    error.code = 'NO_FAMILIES';
    throw error;
  }

  const text = `${opportunity?.title || ''} ${opportunity?.description || ''}`;
  const scored = families.map((family) => {
    const { score, matched } = scoreFamily(opportunity, family);
    // Un termino negativo descarta la familia entera: no es ruido, es otra cosa.
    const rejected = matchesNegative(text, { negative_terms: family.negative || [] });
    return { family_id: family.id, label: family.label, score: rejected ? 0 : score, matched, rejected_by_negative: rejected };
  }).sort((a, b) => b.score - a.score);

  const total = scored.reduce((sum, item) => sum + item.score, 0);
  const best = scored[0];
  const confidence = total > 0 ? Number((best.score / total).toFixed(3)) : 0;

  // Sin senal suficiente se devuelve unclassified en vez de forzar una familia:
  // una vacante mal clasificada cuesta una postulacion desperdiciada.
  const classified = best.score > 0 && confidence >= MIN_CONFIDENCE;

  return {
    ok: true,
    opportunity_id: opportunity?.opportunity_id || null,
    family_id: classified ? best.family_id : null,
    status: classified ? 'classified' : 'unclassified',
    confidence,
    matched_terms: classified ? best.matched : [],
    // El ranking del cliente decide la prioridad; el clasificador solo dice que es.
    priority: classified && rankedFamilies.length ? rankedFamilies.indexOf(best.family_id) + 1 : null,
    candidates: scored.filter((item) => item.score > 0).slice(0, 3),
    rejected_families: scored.filter((item) => item.rejected_by_negative).map((item) => item.family_id),
  };
}

export function classifyAll(opportunities = [], options = {}) {
  const results = opportunities.map((opportunity) => ({ opportunity, classification: classify(opportunity, options) }));
  return {
    ok: true,
    total: results.length,
    classified: results.filter((item) => item.classification.status === 'classified').length,
    unclassified: results.filter((item) => item.classification.status === 'unclassified').length,
    results,
  };
}
