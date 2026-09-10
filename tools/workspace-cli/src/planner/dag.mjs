// B02 — Planificador DAG y configuracion.
import { detectDependencyCycle } from '../cli/validate-manifest.mjs';

export function planExecutionOrder(manifests, { targetProfile = 'default' } = {}) {
  const cycleCheck = detectDependencyCycle(manifests);
  if (!cycleCheck.ok) {
    const error = new Error('Ciclo de dependencias detectado: ' + cycleCheck.cycle.join(' -> '));
    error.code = 'DEPENDENCY_CYCLE';
    error.cycle = cycleCheck.cycle;
    throw error;
  }

  const bySlug = new Map(manifests.map((m) => [m.slug, m]));
  const inDegree = new Map();
  const graph = new Map();

  for (const m of manifests) {
    inDegree.set(m.slug, 0);
    graph.set(m.slug, []);
  }

  for (const m of manifests) {
    for (const dep of m.dependencies || []) {
      if (graph.has(dep)) {
        graph.get(dep).push(m.slug);
        inDegree.set(m.slug, (inDegree.get(m.slug) || 0) + 1);
      }
    }
  }

  const queue = [];
  for (const [slug, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(slug);
  }

  const order = [];
  while (queue.length > 0) {
    queue.sort();
    const current = queue.shift();
    order.push(current);

    for (const neighbor of graph.get(current) || []) {
      const updated = inDegree.get(neighbor) - 1;
      inDegree.set(neighbor, updated);
      if (updated === 0) queue.push(neighbor);
    }
  }

  if (order.length !== manifests.length) {
    throw new Error('No se pudo resolver el orden completo (ciclo no detectado o dependencia faltante)');
  }

  return {
    ok: true,
    profile: targetProfile,
    totalServices: order.length,
    executionPlan: order.map((slug, idx) => ({
      step: idx + 1,
      service: slug,
      manifest: bySlug.get(slug)
    }))
  };
}

export function detectPortConflicts(services) {
  const portMap = new Map();
  const conflicts = [];

  for (const s of services) {
    if (s.port) {
      if (portMap.has(s.port)) {
        conflicts.push({
          port: s.port,
          services: [portMap.get(s.port), s.slug]
        });
      } else {
        portMap.set(s.port, s.slug);
      }
    }
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts
  };
}
