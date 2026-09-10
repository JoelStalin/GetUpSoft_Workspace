// B01 — Validacion de manifests de proyecto. Sin dependencias externas a proposito: zod
// esta declarado en package.json pero no instalado en esta raiz compartida (node_modules
// incompleto), e instalar algo nuevo en un monorepo compartido por muchos productos activos
// no es una decision que corresponda a esta tarea. Validador minimo, explicito, sin magia.
const REQUIRED_STRING_FIELDS = ['slug', 'sourcePath', 'runtime'];
const VALID_RUNTIMES = ['node', 'python', 'docker-compose', 'odoo'];

function fail(errors, field, reason) {
  errors.push({ field, reason });
}

// Regla de B01: un manifest invalido debe fallar ANTES de ejecutar cualquier accion —
// nunca a mitad de un bootstrap. Esta funcion es pura: no toca filesystem ni procesos.
export function validateProjectManifest(manifest) {
  const errors = [];
  if (manifest === null || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return { ok: false, errors: [{ field: '(root)', reason: 'el manifest debe ser un objeto JSON' }] };
  }

  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof manifest[field] !== 'string' || manifest[field].trim() === '') {
      fail(errors, field, 'campo string requerido, ausente o vacio');
    }
  }

  if (manifest.slug && !/^[a-z][a-z0-9-]*$/.test(manifest.slug)) {
    fail(errors, 'slug', 'debe ser minusculas, empezar con letra, solo [a-z0-9-]');
  }

  if (manifest.runtime && !VALID_RUNTIMES.includes(manifest.runtime)) {
    fail(errors, 'runtime', `runtime no soportado: "${manifest.runtime}" (validos: ${VALID_RUNTIMES.join(', ')})`);
  }

  if (manifest.dependencies !== undefined) {
    if (!Array.isArray(manifest.dependencies)) {
      fail(errors, 'dependencies', 'debe ser un array de slugs');
    } else if (manifest.dependencies.some((d) => typeof d !== 'string')) {
      fail(errors, 'dependencies', 'todas las entradas deben ser strings (slugs de otros proyectos)');
    } else if (manifest.dependencies.includes(manifest.slug)) {
      fail(errors, 'dependencies', 'un proyecto no puede depender de si mismo');
    }
  }

  if (manifest.commands !== undefined) {
    if (typeof manifest.commands !== 'object' || manifest.commands === null || Array.isArray(manifest.commands)) {
      fail(errors, 'commands', 'debe ser un objeto {nombre: [argv...]}');
    } else {
      for (const [key, value] of Object.entries(manifest.commands)) {
        // Regla del diseno original: comandos como arrays de argumentos, nunca un string
        // interpretado por un shell — evita inyeccion de comandos desde un manifest.
        if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) {
          fail(errors, `commands.${key}`, 'debe ser un array de strings (argv), nunca un string de shell');
        }
      }
    }
  }

  if (manifest.health !== undefined) {
    if (typeof manifest.health !== 'object' || manifest.health === null) {
      fail(errors, 'health', 'debe ser un objeto {liveness?, readiness?}');
    }
  }

  return { ok: errors.length === 0, errors };
}

// Detecta ciclos en el grafo de dependencias ANTES de intentar ejecutar nada (regla B02,
// pero se valida aqui tambien porque un ciclo hace que el manifest sea invalido de raiz).
export function detectDependencyCycle(manifests) {
  const bySlug = new Map(manifests.map((m) => [m.slug, m]));
  const state = new Map(); // 'visiting' | 'done'

  function visit(slug, chain) {
    if (state.get(slug) === 'done') return null;
    if (state.get(slug) === 'visiting') return [...chain, slug];
    state.set(slug, 'visiting');
    const manifest = bySlug.get(slug);
    for (const dep of manifest?.dependencies || []) {
      const cycle = visit(dep, [...chain, slug]);
      if (cycle) return cycle;
    }
    state.set(slug, 'done');
    return null;
  }

  for (const manifest of manifests) {
    const cycle = visit(manifest.slug, []);
    if (cycle) return { ok: false, cycle };
  }
  return { ok: true, cycle: null };
}
