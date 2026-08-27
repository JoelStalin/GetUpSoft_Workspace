import { canonicalizeUrl, identityKey, dedupe } from '../apps/orca/src/careerai/dedupe.mjs';

// --- URL canonica -----------------------------------------------------------
const tracked = 'https://www.indeed.com/viewjob?jk=abc123&vjk=52707ab174f65c52&utm_source=alert&from=web';
if (canonicalizeUrl(tracked) !== 'https://indeed.com/viewjob') {
  throw new Error(`Debe limpiar parametros de seguimiento: ${canonicalizeUrl(tracked)}`);
}
if (canonicalizeUrl('https://boards.greenhouse.io/acme/jobs/42/') !== 'https://boards.greenhouse.io/acme/jobs/42') {
  throw new Error('Debe quitar la barra final');
}
if (canonicalizeUrl('https://x.com/j?b=2&a=1') !== canonicalizeUrl('https://x.com/j?a=1&b=2')) {
  throw new Error('El orden de los parametros no debe cambiar la URL canonica');
}
if (canonicalizeUrl('http://Dice.com/Job/7') !== 'https://dice.com/Job/7') {
  throw new Error('Debe normalizar host y protocolo sin tocar la ruta');
}
if (canonicalizeUrl('') !== null) throw new Error('URL vacia debe dar null');

// --- clave de identidad -----------------------------------------------------
const a = { company: 'Acme Corp.', title: 'URGENT! Senior Developer (Remote)', location: 'Remote - USA' };
const b = { company: 'acme corp', title: 'Senior Developer', location: 'Anywhere' };
if (identityKey(a) !== identityKey(b)) {
  throw new Error(`Misma vacante debe dar la misma clave: ${identityKey(a)} vs ${identityKey(b)}`);
}
const other = { company: 'Acme Corp', title: 'Junior Developer', location: 'Remote' };
if (identityKey(a) === identityKey(other)) throw new Error('Puestos distintos no deben colisionar');
if (identityKey({ title: 'Sin empresa' }) !== null) throw new Error('Sin empresa no hay clave fiable');

// --- deduplicacion ----------------------------------------------------------
const feed = [
  { source: 'indeed', company: 'Acme Corp', title: 'Senior Developer', location: 'Remote',
    canonical_url: 'https://www.indeed.com/viewjob?jk=1&utm_source=x' },
  { source: 'dice', company: 'Acme Corp.', title: 'URGENT Senior Developer (Remote)', location: 'Remote - USA',
    canonical_url: 'https://dice.com/job/1', description: 'desc', published_at: '2026-08-20' },
  { source: 'indeed', company: 'Acme Corp', title: 'Senior Developer', location: 'Remote',
    canonical_url: 'https://indeed.com/viewjob?jk=1&vjk=zzz' },
  { source: 'lever', company: 'Globex', title: 'Platform Engineer', location: 'Remote',
    canonical_url: 'https://jobs.lever.co/globex/9' },
];

const result = dedupe(feed);
if (result.input !== 4) throw new Error('Debe reportar la entrada completa');
if (result.unique !== 2) throw new Error(`Esperaba 2 unicas, obtuve ${result.unique}`);
if (result.removed !== 2) throw new Error(`Esperaba 2 duplicadas, obtuve ${result.removed}`);

const acme = result.opportunities.find((item) => /acme/i.test(item.company));
if (acme.source !== 'dice') {
  throw new Error(`Debe sobrevivir la fuente mas cercana al empleador, no ${acme.source}`);
}
if (!result.duplicates.some((item) => item.matched_by === 'identity')) {
  throw new Error('Debe detectar el duplicado cruzado por identidad, no solo por URL');
}
if (!result.duplicates.some((item) => item.matched_by === 'canonical_url')) {
  throw new Error('Debe detectar el duplicado por URL con distinto parametro de seguimiento');
}
if (dedupe([]).unique !== 0) throw new Error('Lista vacia debe devolver cero');

console.log(JSON.stringify({
  ok: true,
  node: 'dedupe-canonical',
  input: result.input,
  unique: result.unique,
  removed: result.removed,
  matched_by: [...new Set(result.duplicates.map((item) => item.matched_by))],
}));
