// Nodo catalog-researcher: cuando una familia del catalogo esta sin validar, en vez de
// bloquear y esperar a un humano, el consejo de modelos investiga como se nombran esos
// perfiles en el mercado real y propone terminos, adyacentes y negativos.
// El humano deja de ser un requisito para arrancar y pasa a ser un revisor.
import fs from 'node:fs';
import { askCouncil, extractJson, consensusTerms } from './llm-council.mjs';

const catalogPath = new URL('../../../../data/careerai/profession-catalog.json', import.meta.url);

export function buildResearchPrompt(family) {
  return [
    `Eres un reclutador tecnico especializado en el perfil "${family.label}".`,
    '',
    'Devuelve UNICAMENTE un objeto JSON con esta forma exacta:',
    '{"terms": [], "adjacent": [], "negative": [], "titles": [], "certifications": []}',
    '',
    'Donde:',
    '- terms: como se nombra esta tecnologia o profesion en ofertas de empleo REALES,',
    '  incluyendo variantes de escritura y abreviaturas que usan los reclutadores.',
    '- adjacent: tecnologias o productos que suelen aparecer junto a este perfil.',
    '- negative: terminos que causan FALSOS POSITIVOS al buscar, es decir, ofertas que',
    '  contienen palabras parecidas pero son de otra profesion.',
    '- titles: titulos de puesto habituales para este perfil.',
    '- certifications: certificaciones reconocidas, si las hay.',
    '',
    `Terminos que ya tenemos: ${(family.terms || []).join(', ') || '(ninguno)'}`,
    '',
    'Reglas: no inventes tecnologias que no existan; no repitas un termino en dos listas;',
    'usa la forma en que aparece escrito en las ofertas, no la forma academica.',
    'Responde solo el JSON, sin explicacion.',
  ].join('\n');
}

function normalizeList(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 40);
}

export async function researchFamily(familyId, { catalog = null, council = askCouncil, minVotes = 2 } = {}) {
  const data = catalog || JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const family = data.families.find((item) => item.id === familyId);
  if (!family) {
    const error = new Error(`Familia desconocida: ${familyId}`);
    error.code = 'UNKNOWN_FAMILY';
    throw error;
  }

  const result = await council(buildResearchPrompt(family));

  // Sin ninguna respuesta el nodo escala, pero deja el catalogo intacto y usable.
  if (!result.ok) {
    return {
      ok: false,
      family_id: familyId,
      status: 'needs_human',
      reason: 'ningun proveedor respondio',
      failed: result.failed,
      catalog_modified: false,
    };
  }

  const parsed = result.answers
    .map((answer) => ({ provider: answer.provider, json: extractJson(answer.text) }))
    .filter((item) => item.json);

  if (!parsed.length) {
    return {
      ok: false,
      family_id: familyId,
      status: 'needs_human',
      reason: 'ningun proveedor devolvio JSON utilizable',
      answered: result.answered,
      catalog_modified: false,
    };
  }

  const fields = ['terms', 'adjacent', 'negative', 'titles', 'certifications'];
  const consensus = {};
  for (const field of fields) {
    consensus[field] = consensusTerms(
      parsed.map((item) => ({ provider: item.provider, terms: normalizeList(item.json[field]) })),
      { minVotes },
    );
  }

  // Un solo proveedor de acuerdo no basta para entrar al catalogo: queda como propuesta.
  const effectiveVotes = Math.min(minVotes, parsed.length);
  return {
    ok: true,
    family_id: familyId,
    status: parsed.length >= minVotes ? 'researched' : 'single_provider_only',
    providers_answered: parsed.map((item) => item.provider),
    min_votes_required: effectiveVotes,
    consensus,
    proposal: Object.fromEntries(fields.map((field) => [field, consensus[field].agreed.map((item) => item.term)])),
    needs_review: Object.fromEntries(fields.map((field) => [field, consensus[field].single_source.map((item) => item.term)])),
  };
}

// Fusiona la propuesta en el catalogo conservando la procedencia: quien lo propuso y
// cuantos proveedores coincidieron. Nunca borra lo que ya habia.
export function mergeIntoCatalog(catalog, research) {
  const family = catalog.families.find((item) => item.id === research.family_id);
  if (!family) throw new Error(`Familia desconocida: ${research.family_id}`);

  const merge = (existing = [], incoming = []) => {
    const seen = new Set(existing.map((item) => String(item).toLowerCase()));
    return [...existing, ...incoming.filter((item) => !seen.has(String(item).toLowerCase()))];
  };

  family.terms = merge(family.terms, research.proposal.terms);
  family.adjacent = merge(family.adjacent, research.proposal.adjacent);
  family.negative = merge(family.negative, research.proposal.negative);
  if (research.proposal.titles?.length) family.titles = merge(family.titles, research.proposal.titles);
  if (research.proposal.certifications?.length) family.certifications = merge(family.certifications, research.proposal.certifications);

  family.validated = research.status === 'researched';
  family.validated_by = {
    method: 'llm_council',
    providers: research.providers_answered,
    min_votes: research.min_votes_required,
    at: new Date().toISOString(),
  };
  family.pending_review = research.needs_review;
  return catalog;
}
