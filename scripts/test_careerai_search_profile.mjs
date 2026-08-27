import { buildSearchProfiles, matchesNegative, loadCatalog } from '../apps/orca/src/careerai/search-profile.mjs';

const catalog = loadCatalog();

// El catalogo no debe privilegiar ninguna profesion: es una taxonomia, no una config.
if (catalog.families.length < 2) throw new Error('El catalogo debe demostrar que es generico con varias familias');
for (const family of catalog.families) {
  for (const field of ['id', 'label', 'terms', 'seniority_terms']) {
    if (!family[field]) throw new Error(`${family.id || '(sin id)'}: falta ${field}`);
  }
}

// El orden lo pone el cliente, no el sistema.
const joel = buildSearchProfiles({ rankedFamilies: ['iseries-core', 'odoo-python', 'fullstack-web'] });
if (joel.profiles[0].family_id !== 'iseries-core') throw new Error('Debe respetar el ranking del cliente');
if (joel.profiles[0].priority !== 1) throw new Error('La prioridad es la posicion elegida por el cliente');

const otro = buildSearchProfiles({ rankedFamilies: ['fullstack-web', 'iseries-core'] });
if (otro.profiles[0].family_id !== 'fullstack-web') {
  throw new Error('Otro cliente con otro orden debe obtener otro perfil: el sistema no tiene favoritos');
}

// Consultas concretas, con el modificador de remoto tomado del catalogo.
if (!joel.profiles[0].queries.some((item) => item.term === 'RPGLE')) throw new Error('Debe expandir sinonimos del catalogo');
if (!joel.profiles[0].queries[0].query.includes('Remote')) throw new Error('remoteOnly debe anadir el modificador');
const sinRemoto = buildSearchProfiles({ rankedFamilies: ['odoo-python'], remoteOnly: false });
if (sinRemoto.profiles[0].queries[0].query.includes('Remote')) throw new Error('Sin remoteOnly no debe anadirlo');

// Semillas sin validar: se reportan, no se bloquean.
if (!joel.unvalidated_families.includes('iseries-core')) {
  throw new Error('Debe avisar que la familia es una semilla sin validar por alguien del oficio');
}

// Errores explicitos en vez de silencio.
let code = null;
try { buildSearchProfiles({ rankedFamilies: [] }); } catch (error) { code = error.code; }
if (code !== 'NO_RANKED_PROFESSIONS') throw new Error('Sin ranking del cliente debe fallar explicitamente');

code = null;
try { buildSearchProfiles({ rankedFamilies: ['profesion-inventada'] }); } catch (error) { code = error.code; }
if (code !== 'UNKNOWN_PROFESSION') throw new Error('Una profesion fuera del catalogo debe fallar explicitamente');

// Filtro negativo: RPG de videojuegos no es RPGLE.
const iseries = joel.profiles[0];
if (!matchesNegative('Looking for a tabletop role playing game designer', iseries)) {
  throw new Error('Debe descartar el falso positivo de RPG de videojuegos');
}
if (matchesNegative('Senior RPGLE Developer for IBM i modernization', iseries)) {
  throw new Error('No debe descartar una vacante legitima');
}

console.log(JSON.stringify({
  ok: true,
  node: 'search-profile-builder',
  families_in_catalog: catalog.families.length,
  ranked_by_client: joel.ranked_by_client,
  total_queries: joel.total_queries,
  unvalidated_families: joel.unvalidated_families,
}));
