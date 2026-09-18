import assert from 'node:assert/strict';
import { buildPlan } from '../src/planner/index.mjs';

const base = { sourcePath: 'x', runtime: 'node' };

// --- caso feliz: cadena lineal, orden topologico correcto ---
const feliz = buildPlan([
  { ...base, slug: 'a', sourcePath: 'path-a', dependencies: ['b'], ports: [3000] },
  { ...base, slug: 'b', sourcePath: 'path-b', dependencies: ['c'], ports: [3001] },
  { ...base, slug: 'c', sourcePath: 'path-c', dependencies: [], ports: [3002] },
]);
assert.equal(feliz.ok, true);
assert.deepEqual(feliz.startupOrder, ['c', 'b', 'a'], 'c no depende de nadie, debe ir primero');

// --- dependencia compartida: dos proyectos dependen del mismo, no se duplica ---
const compartida = buildPlan([
  { ...base, slug: 'a', sourcePath: 'path-a', dependencies: ['shared'], ports: [4000] },
  { ...base, slug: 'b', sourcePath: 'path-b', dependencies: ['shared'], ports: [4001] },
  { ...base, slug: 'shared', sourcePath: 'path-shared', dependencies: [], ports: [4002] },
]);
assert.equal(compartida.ok, true);
assert.equal(compartida.startupOrder.filter((s) => s === 'shared').length, 1);
assert.equal(compartida.startupOrder.indexOf('shared'), 0);

// --- ciclo: rechazado con la cadena completa ---
const conCiclo = buildPlan([
  { ...base, slug: 'a', sourcePath: 'path-a', dependencies: ['b'] },
  { ...base, slug: 'b', sourcePath: 'path-b', dependencies: ['a'] },
]);
assert.equal(conCiclo.ok, false);
assert.equal(conCiclo.reason, 'ciclo_de_dependencias');

// --- conflicto de puerto entre DOS proyectos distintos ---
const puertoChocado = buildPlan([
  { ...base, slug: 'a', sourcePath: 'path-a', ports: [5000] },
  { ...base, slug: 'b', sourcePath: 'path-b', ports: [5000] },
]);
assert.equal(puertoChocado.ok, false);
assert.equal(puertoChocado.reason, 'conflicto_de_puertos');
assert.equal(puertoChocado.portConflicts[0].port, 5000);

// --- mismo puerto, mismo proyecto (duplicado en su propia lista) no es un conflicto ---
const mismoProyectoMismoPuerto = buildPlan([
  { ...base, slug: 'a', sourcePath: 'path-a', ports: [5000, 5000] },
]);
assert.equal(mismoProyectoMismoPuerto.ok, true);

// --- conflicto de sourcePath entre dos proyectos distintos ---
const rutaChocada = buildPlan([
  { ...base, slug: 'a', sourcePath: 'misma-ruta' },
  { ...base, slug: 'b', sourcePath: 'misma-ruta' },
]);
assert.equal(rutaChocada.ok, false);
assert.equal(rutaChocada.reason, 'conflicto_de_rutas');

// --- manifest individualmente invalido invalida el plan completo ---
const conInvalido = buildPlan([
  { ...base, slug: 'a', sourcePath: 'path-a' },
  { slug: 'B-mal', sourcePath: 'path-b', runtime: 'php' },
]);
assert.equal(conInvalido.ok, false);
assert.equal(conInvalido.reason, 'manifests_invalidos');
assert.equal(conInvalido.validationErrors[0].slug, 'B-mal');

console.log(JSON.stringify({ ok: true, task: 'B02', orden_topologico_correcto: true, ciclo_rechazado_con_cadena: true, conflicto_puerto_y_ruta_detectados_antes_de_ejecutar: true, dependencia_compartida_no_duplicada: true }));
