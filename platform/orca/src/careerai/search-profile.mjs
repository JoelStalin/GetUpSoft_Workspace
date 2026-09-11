// Nodo search-profile-builder: convierte las profesiones que el CLIENTE priorizo en
// consultas de busqueda concretas. Ningun oficio esta cableado aqui; todo sale del
// catalogo y del ranking que eligio el cliente en priority-prompt.
import fs from 'node:fs';

const catalogPath = new URL('../../../../data/careerai/profession-catalog.json', import.meta.url);

export function loadCatalog() {
  return JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
}

export function buildSearchProfiles({ rankedFamilies = [], catalog = loadCatalog(), remoteOnly = true, maxTermsPerFamily = 8 } = {}) {
  if (!Array.isArray(rankedFamilies) || rankedFamilies.length === 0) {
    const error = new Error('El cliente no ha priorizado ninguna profesion');
    error.code = 'NO_RANKED_PROFESSIONS';
    throw error;
  }

  const byId = new Map(catalog.families.map((family) => [family.id, family]));
  const unknown = rankedFamilies.filter((id) => !byId.has(id));
  if (unknown.length) {
    const error = new Error(`Profesiones fuera del catalogo: ${unknown.join(', ')}`);
    error.code = 'UNKNOWN_PROFESSION';
    throw error;
  }

  const profiles = rankedFamilies.map((id, index) => {
    const family = byId.get(id);
    const terms = family.terms.slice(0, maxTermsPerFamily);
    return {
      family_id: family.id,
      label: family.label,
      // La prioridad es la posicion que el cliente eligio, no un peso del sistema.
      priority: index + 1,
      validated: family.validated === true,
      queries: terms.map((term) => ({
        term,
        remote: remoteOnly,
        query: remoteOnly ? `${term} ${catalog.modifiers.remote[0]}` : term,
      })),
      adjacent_terms: family.adjacent || [],
      negative_terms: family.negative || [],
    };
  });

  const unvalidated = profiles.filter((profile) => !profile.validated).map((profile) => profile.family_id);

  return {
    ok: true,
    schema_version: 'careerai.search-profile.v1',
    ranked_by_client: rankedFamilies,
    remote_only: remoteOnly,
    total_queries: profiles.reduce((sum, profile) => sum + profile.queries.length, 0),
    // Se reporta, no se bloquea: el cliente puede querer buscar con una semilla sin validar.
    unvalidated_families: unvalidated,
    profiles,
  };
}

// Filtro negativo: evita que "RPG" de videojuegos o "Odoo sales rep" contaminen la cola.
export function matchesNegative(text, profile) {
  const haystack = String(text || '').toLowerCase();
  return (profile.negative_terms || []).some((term) => haystack.includes(String(term).toLowerCase()));
}
