import assert from 'node:assert/strict';
import { validateProjectManifest, detectDependencyCycle } from '../src/cli/validate-manifest.mjs';

// --- caso feliz ---
const valido = validateProjectManifest({
  slug: 'orca', sourcePath: 'platform/orca', runtime: 'node',
  dependencies: ['orca-postgres'],
  commands: { build: ['npm', 'run', 'build'] },
  health: { liveness: '/api/health/live' },
});
assert.equal(valido.ok, true);
assert.equal(valido.errors.length, 0);

// --- campos requeridos ausentes ---
const sinSlug = validateProjectManifest({ sourcePath: 'x', runtime: 'node' });
assert.equal(sinSlug.ok, false);
assert.ok(sinSlug.errors.some((e) => e.field === 'slug'));

// --- runtime no soportado: rechazado ANTES de cualquier accion ---
const runtimeInvalido = validateProjectManifest({ slug: 'x', sourcePath: 'x', runtime: 'php' });
assert.equal(runtimeInvalido.ok, false);
assert.ok(runtimeInvalido.errors.some((e) => e.field === 'runtime'));

// --- slug con mayusculas o caracteres invalidos ---
const slugInvalido = validateProjectManifest({ slug: 'Orca_Bad', sourcePath: 'x', runtime: 'node' });
assert.equal(slugInvalido.ok, false);

// --- comando como string de shell (riesgo de inyeccion): rechazado ---
const comandoShell = validateProjectManifest({
  slug: 'x', sourcePath: 'x', runtime: 'node',
  commands: { build: 'npm run build && rm -rf /' },
});
assert.equal(comandoShell.ok, false);
assert.ok(comandoShell.errors.some((e) => e.field === 'commands.build'));

// --- dependencia de si mismo ---
const autoDependencia = validateProjectManifest({ slug: 'x', sourcePath: 'x', runtime: 'node', dependencies: ['x'] });
assert.equal(autoDependencia.ok, false);

// --- no es un objeto ---
const noEsObjeto = validateProjectManifest('esto no es un manifest');
assert.equal(noEsObjeto.ok, false);

// --- ciclo de dependencias: A -> B -> C -> A ---
const conCiclo = detectDependencyCycle([
  { slug: 'a', dependencies: ['b'] },
  { slug: 'b', dependencies: ['c'] },
  { slug: 'c', dependencies: ['a'] },
]);
assert.equal(conCiclo.ok, false);
assert.ok(conCiclo.cycle.includes('a') && conCiclo.cycle.includes('b') && conCiclo.cycle.includes('c'));

// --- sin ciclo: cadena lineal ---
const sinCiclo = detectDependencyCycle([
  { slug: 'a', dependencies: ['b'] },
  { slug: 'b', dependencies: ['c'] },
  { slug: 'c', dependencies: [] },
]);
assert.equal(sinCiclo.ok, true);

// --- dependencia compartida (no exclusiva) no es un ciclo ---
const compartida = detectDependencyCycle([
  { slug: 'a', dependencies: ['shared'] },
  { slug: 'b', dependencies: ['shared'] },
  { slug: 'shared', dependencies: [] },
]);
assert.equal(compartida.ok, true);

console.log(JSON.stringify({ ok: true, task: 'B01', manifest_invalido_rechazado_antes_de_ejecutar: true, ciclo_detectado_con_cadena_completa: true, comando_shell_rechazado: true }));
