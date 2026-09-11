import assert from 'node:assert/strict';
import { paginateByScroll } from '../platform/orca/src/careerai/scroll-paginator.mjs';

// --- caso feliz: 3 pasadas con contenido nuevo, la 4ta y 5ta repiten -> se detiene -------
const batches = [
  [{ link: 'a' }, { link: 'b' }],
  [{ link: 'b' }, { link: 'c' }], // 'b' duplicado, 'c' nuevo
  [{ link: 'd' }],
  [], // sin novedad (1ra pasada estable)
  [], // sin novedad (2da pasada estable -> corta)
  [{ link: 'e' }], // nunca deberia llegar aca
];
let calls = 0;
const resultado = await paginateByScroll({
  scrollAndExtract: async () => batches[calls++] || [],
  maxScrolls: 20,
  maxResults: 100,
  stableScrollsBeforeStop: 2,
});
assert.equal(resultado.ok, true);
assert.equal(resultado.applied, false, 'discovery jamas debe marcar applied:true');
assert.equal(resultado.total_unique, 4, 'a, b, c, d — sin contar el duplicado');
assert.equal(resultado.stopped_because, 'no_more_new_items');
assert.equal(calls, 5, 'debe detenerse tras 2 pasadas seguidas sin novedad, sin llegar a la 6ta');

// --- limite de resultados corta antes de agotar el scroll --------------------------------
const limitado = await paginateByScroll({
  scrollAndExtract: async () => [{ link: `x-${Math.random()}` }, { link: `y-${Math.random()}` }],
  maxScrolls: 50,
  maxResults: 5,
});
assert.equal(limitado.total_unique, 5);
assert.equal(limitado.stopped_because, 'max_results_reached');

// --- sin scrollAndExtract inyectado: se niega, no inventa un navegador -------------------
const sinFn = await paginateByScroll({});
assert.equal(sinFn.ok, false);

console.log(JSON.stringify({ ok: true, node: 'scroll-paginator', dedup_por_key: true, se_detiene_sin_novedad: true, respeta_max_results: true }));
