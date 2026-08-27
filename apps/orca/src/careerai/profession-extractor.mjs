// Nodo profession-extractor: deduce las profesiones del cliente A PARTIR DE SU CV.
// Ninguna profesion esta cableada; el resultado depende enteramente del documento.
// Dos caminos: el consejo de modelos (rol heavy_lifting, que carga Hermes con modelos
// gratuitos) y, si el consejo no responde, un barrido determinista contra el catalogo
// para que el cliente nunca se quede sin perfil.
import { askRole, extractJson } from './llm-council.mjs';
import { loadCatalog } from './search-profile.mjs';

export function buildExtractionPrompt(cvText) {
  return [
    'Analiza este CV y determina las profesiones del candidato.',
    '',
    'Devuelve UNICAMENTE un objeto JSON con esta forma:',
    '{"professions": [{"label": "", "evidence": "", "years": 0, "seniority": ""}]}',
    '',
    'Reglas:',
    '- label: el nombre de la profesion tal como se anuncia en ofertas de empleo.',
    '- evidence: la frase del CV que respalda esa profesion. No inventes evidencia.',
    '- years: anos de experiencia que el CV respalda; 0 si no se puede deducir.',
    '- Ordena de mayor a menor peso en el CV.',
    '- Si el CV no respalda una profesion, no la incluyas.',
    '',
    '--- CV ---',
    cvText.slice(0, 12000),
  ].join('\n');
}

// Barrido determinista: cuenta apariciones de los terminos de cada familia del catalogo.
// No sustituye al analisis del consejo, pero evita que un fallo de proveedor deje al
// cliente sin ningun perfil con el que empezar.
export function extractByCatalog(cvText, catalog = loadCatalog()) {
  const haystack = String(cvText || '').toLowerCase();
  const matches = catalog.families.map((family) => {
    const hits = (family.terms || []).filter((term) => {
      const escaped = String(term).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(haystack);
    });
    return { family_id: family.id, label: family.label, hits, score: hits.length };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score);

  return { method: 'catalog_scan', families: matches };
}

export async function extractProfessions(cvText, { catalog = loadCatalog(), askFn = askRole } = {}) {
  if (!cvText || cvText.length < 200) {
    const error = new Error('El texto del CV es demasiado corto para extraer profesiones');
    error.code = 'CV_TEXT_TOO_SHORT';
    throw error;
  }

  const fallback = extractByCatalog(cvText, catalog);
  let council = null;
  try {
    council = await askFn('heavy_lifting', buildExtractionPrompt(cvText));
  } catch {
    council = { ok: false, failed: [{ provider: 'n/a', error: 'excepcion al consultar el consejo' }] };
  }

  const parsed = council?.ok ? extractJson(council.answers?.[0]?.text) : null;
  const professions = Array.isArray(parsed?.professions) ? parsed.professions : null;

  if (!professions || !professions.length) {
    return {
      ok: fallback.families.length > 0,
      method: 'catalog_fallback',
      // Se dice con claridad que el consejo no aporto, en vez de presentar el barrido
      // como si fuera un analisis completo.
      council_status: council?.ok ? 'respondio_sin_json_utilizable' : 'sin_respuesta',
      council_failures: council?.failed || [],
      professions: fallback.families.map((item, index) => ({
        label: item.label,
        family_id: item.family_id,
        evidence: `terminos hallados en el CV: ${item.hits.slice(0, 6).join(', ')}`,
        rank: index + 1,
        confidence: 'baja',
      })),
      requires_client_confirmation: true,
    };
  }

  // Se cruza lo que dijo el consejo con el catalogo para poder enlazar cada profesion
  // con una familia conocida, sin descartar las que el catalogo todavia no cubre.
  const byFamily = new Map(fallback.families.map((item) => [item.label.toLowerCase(), item.family_id]));
  return {
    ok: true,
    method: 'llm_council',
    provider: council.provider || council.answered?.[0] || null,
    used_fallback_provider: council.used_fallback === true,
    professions: professions.slice(0, 12).map((item, index) => ({
      label: String(item.label || '').trim(),
      family_id: byFamily.get(String(item.label || '').toLowerCase()) || null,
      evidence: String(item.evidence || '').slice(0, 300),
      years: Number(item.years) || 0,
      seniority: String(item.seniority || '').trim() || null,
      rank: index + 1,
      confidence: 'media',
    })).filter((item) => item.label),
    catalog_scan: fallback.families,
    // El cliente siempre confirma u ordena: el sistema propone, no decide por el.
    requires_client_confirmation: true,
  };
}
