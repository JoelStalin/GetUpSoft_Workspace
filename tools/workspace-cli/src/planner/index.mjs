// B02 — Planificador DAG. Recibe manifests de proyecto (ya validados por B01) y produce un
// plan de arranque: orden topologico, conflictos de puerto/ruta detectados ANTES de
// ejecutar nada, y el ciclo completo si existe (reusa detectDependencyCycle de B01 en vez
// de reimplementar la deteccion).
import { validateProjectManifest, detectDependencyCycle } from '../cli/validate-manifest.mjs';

export function buildPlan(manifests) {
  // 1. Cada manifest debe ser individualmente valido — un manifest invalido invalida el
  // plan completo, nunca se ejecuta parcialmente.
  const validationErrors = [];
  for (const manifest of manifests) {
    const result = validateProjectManifest(manifest);
    if (!result.ok) validationErrors.push({ slug: manifest.slug, errors: result.errors });
  }
  if (validationErrors.length) {
    return { ok: false, reason: 'manifests_invalidos', validationErrors };
  }

  // 2. Ciclos de dependencias.
  const cycleCheck = detectDependencyCycle(manifests);
  if (!cycleCheck.ok) {
    return { ok: false, reason: 'ciclo_de_dependencias', cycle: cycleCheck.cycle };
  }

  // 3. Conflictos de puerto: dos proyectos DISTINTOS declarando el mismo puerto de host
  // es un conflicto real (nadie podria arrancar ambos). Mismo servicio compartido
  // (mismo slug) no cuenta como conflicto consigo mismo.
  const portOwners = new Map();
  const portConflicts = [];
  for (const manifest of manifests) {
    for (const port of manifest.ports || []) {
      const owner = portOwners.get(port);
      if (owner && owner !== manifest.slug) {
        portConflicts.push({ port, projects: [owner, manifest.slug] });
      } else {
        portOwners.set(port, manifest.slug);
      }
    }
  }
  if (portConflicts.length) {
    return { ok: false, reason: 'conflicto_de_puertos', portConflicts };
  }

  // 4. Conflictos de sourcePath: dos proyectos distintos no pueden declarar la misma ruta
  // de fuente (aunque el filesystem lo permitiria, el bootstrap no distinguiria cual es
  // cual al calcular datos/config por proyecto).
  const pathOwners = new Map();
  const pathConflicts = [];
  for (const manifest of manifests) {
    const owner = pathOwners.get(manifest.sourcePath);
    if (owner && owner !== manifest.slug) {
      pathConflicts.push({ sourcePath: manifest.sourcePath, projects: [owner, manifest.slug] });
    } else {
      pathOwners.set(manifest.sourcePath, manifest.slug);
    }
  }
  if (pathConflicts.length) {
    return { ok: false, reason: 'conflicto_de_rutas', pathConflicts };
  }

  // 5. Orden topologico (Kahn) — un proyecto solo se planifica despues de TODAS sus
  // dependencias declaradas. Dependencias compartidas (referenciadas por varios) no se
  // duplican en el plan.
  const bySlug = new Map(manifests.map((m) => [m.slug, m]));
  const inDegree = new Map(manifests.map((m) => [m.slug, 0]));
  for (const manifest of manifests) {
    for (const dep of manifest.dependencies || []) {
      if (bySlug.has(dep)) inDegree.set(manifest.slug, inDegree.get(manifest.slug) + 1);
    }
  }
  const queue = manifests.filter((m) => inDegree.get(m.slug) === 0).map((m) => m.slug);
  const order = [];
  const dependents = new Map(manifests.map((m) => [m.slug, []]));
  for (const manifest of manifests) {
    for (const dep of manifest.dependencies || []) {
      if (dependents.has(dep)) dependents.get(dep).push(manifest.slug);
    }
  }
  while (queue.length) {
    const slug = queue.shift();
    order.push(slug);
    for (const dependent of dependents.get(slug) || []) {
      inDegree.set(dependent, inDegree.get(dependent) - 1);
      if (inDegree.get(dependent) === 0) queue.push(dependent);
    }
  }

  return {
    ok: true,
    startupOrder: order,
    projectCount: manifests.length,
    ports: [...portOwners.entries()].map(([port, slug]) => ({ port, slug })),
  };
}
