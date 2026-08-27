// Nodo dedupe-canonical: la misma vacante aparece en Indeed, en Dice y en la web de la
// agencia. Postular tres veces a la misma posicion quema la candidatura con el reclutador,
// asi que la deduplicacion es una proteccion, no una optimizacion.

// Parametros de seguimiento que no cambian la vacante y solo ensucian la URL canonica.
const TRACKING_PARAMS = [
  /^utm_/i, /^ref$/i, /^referer$/i, /^referrer$/i, /^source$/i, /^src$/i,
  /^gclid$/i, /^fbclid$/i, /^msclkid$/i, /^vjk$/i, /^jk$/i, /^tk$/i, /^from$/i,
  /^advn$/i, /^adid$/i, /^campaignid$/i, /^trk$/i, /^trackingId$/i, /^position$/i,
  /^pageNum$/i, /^refId$/i, /^originalSubdomain$/i,
];

// Prioridad de fuente cuando hay que elegir un superviviente: se prefiere la fuente
// mas cercana al empleador, porque su ficha suele ser la mas completa y estable.
const SOURCE_RANK = { employer: 0, greenhouse: 1, lever: 1, workday: 1, dice: 2, linkedin: 3, indeed: 4, weworkremotely: 4, unknown: 9 };

export function canonicalizeUrl(rawUrl) {
  if (!rawUrl) return null;
  let url;
  try {
    url = new URL(String(rawUrl).trim());
  } catch {
    return String(rawUrl).trim().toLowerCase() || null;
  }
  url.hash = '';
  url.host = url.host.toLowerCase().replace(/^www\./, '');
  url.protocol = 'https:';

  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_PARAMS.some((pattern) => pattern.test(key))) url.searchParams.delete(key);
  }
  // Orden estable: ?a=1&b=2 y ?b=2&a=1 son la misma vacante.
  url.searchParams.sort();

  let path = url.pathname.replace(/\/+$/, '');
  if (path === '') path = '/';
  url.pathname = path;

  const query = url.searchParams.toString();
  return `${url.protocol}//${url.host}${url.pathname}${query ? `?${query}` : ''}`;
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Ruido habitual en los titulos que no distingue una vacante de otra.
const TITLE_NOISE = /\b(urgent|hiring|immediate|remote|w2|c2c|contract|fulltime|full time|need|required|opening|position|job|apply now|new)\b/g;

export function identityKey(opportunity) {
  const company = normalizeText(opportunity?.company);
  const title = normalizeText(opportunity?.title).replace(TITLE_NOISE, ' ').replace(/\s+/g, ' ').trim();
  const location = normalizeText(opportunity?.location).replace(/\b(remote|anywhere|usa|us)\b/g, ' ').replace(/\s+/g, ' ').trim();
  if (!company || !title) return null;
  return [company, title, location].filter(Boolean).join('|');
}

function rankOf(opportunity) {
  const source = String(opportunity?.source || 'unknown').toLowerCase();
  return SOURCE_RANK[source] ?? SOURCE_RANK.unknown;
}

function completeness(opportunity) {
  return ['description', 'published_at', 'location', 'company', 'match_score']
    .filter((field) => opportunity?.[field]).length;
}

// Gana la fuente mas cercana al empleador; a igual fuente, la ficha mas completa.
function preferred(a, b) {
  if (rankOf(a) !== rankOf(b)) return rankOf(a) < rankOf(b) ? a : b;
  return completeness(a) >= completeness(b) ? a : b;
}

export function dedupe(opportunities = []) {
  const byUrl = new Map();
  const byIdentity = new Map();
  const survivors = [];
  const duplicates = [];

  for (const raw of opportunities) {
    const opportunity = { ...raw, canonical_url: canonicalizeUrl(raw?.canonical_url || raw?.url) };
    const urlKey = opportunity.canonical_url;
    const idKey = identityKey(opportunity);

    const existingIndex = (urlKey && byUrl.get(urlKey)) ?? (idKey && byIdentity.get(idKey));
    if (existingIndex !== undefined && existingIndex !== null && survivors[existingIndex]) {
      const current = survivors[existingIndex];
      const winner = preferred(current, opportunity);
      const loser = winner === current ? opportunity : current;
      duplicates.push({
        dropped_url: loser.canonical_url,
        kept_url: winner.canonical_url,
        matched_by: urlKey && byUrl.has(urlKey) ? 'canonical_url' : 'identity',
      });
      survivors[existingIndex] = { ...winner, duplicate_of: [...(current.duplicate_of || []), loser.canonical_url].filter(Boolean) };
      if (urlKey) byUrl.set(urlKey, existingIndex);
      if (idKey) byIdentity.set(idKey, existingIndex);
      continue;
    }

    const index = survivors.push(opportunity) - 1;
    if (urlKey) byUrl.set(urlKey, index);
    if (idKey) byIdentity.set(idKey, index);
  }

  return {
    ok: true,
    input: opportunities.length,
    unique: survivors.length,
    removed: duplicates.length,
    opportunities: survivors,
    duplicates,
  };
}
