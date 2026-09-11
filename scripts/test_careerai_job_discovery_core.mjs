import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeRelevanceFilter, processRawResults, detectBlocked, discoverJobsPaginated } from '../platform/orca/src/careerai/job-discovery-core.mjs';
import { getNodeExecutionData } from '../platform/orca/src/careerai/execution-debug.mjs';

// --- makeRelevanceFilter: solo acepta señal en el titulo -----------------------------
const filtroAS400 = makeRelevanceFilter([/\bas\s?\/?400\b/i, /\brpg\s?le?\b/i]);
if (!filtroAS400({ title: 'AS400 Developer' })) throw new Error('Debe reconocer AS400 en el titulo');
if (filtroAS400({ title: 'Business Analyst', description: 'menciona AS400 de pasada' })) {
  throw new Error('No debe aceptar solo por mencion en la descripcion, igual que el bug real corregido en LinkedIn');
}

// --- processRawResults: dedup + filtro + limite -----------------------------------------
const crudo = [
  { title: 'Incoming Technician', company: 'X', link: 'a' },
  { title: 'AS400 Developer', company: 'Y', link: 'b' },
  { title: 'AS400 Developer', company: 'Y', link: 'b' }, // duplicado exacto
];
const procesado = processRawResults(crudo, filtroAS400, { maxResults: 5 });
if (procesado.total_deduped !== 2) throw new Error('Un link repetido no debe contarse dos veces');
if (procesado.relevant.length !== 1) throw new Error('Solo 1 de 2 es relevante');
if (procesado.discarded_as_noise.length !== 1) throw new Error('Debe reportar lo descartado, no silenciarlo');

// --- detectBlocked: generico, mismos patrones que ya funcionaron en LinkedIn ----------
if (!detectBlocked('https://portal.example/checkpoint/x', '')) throw new Error('Debe detectar checkpoint en la URL');
if (!detectBlocked('https://portal.example/jobs', 'Please verify you are human')) throw new Error('Debe detectar texto de verificacion humana');
if (detectBlocked('https://portal.example/jobs', 'Jobs you might like')) throw new Error('Una pagina normal no debe marcarse como bloqueada');

// --- discoverJobsPaginated: nodo generico completo, con un page falso ------------------
function makeFakePage(pagesByIndex) {
  const gotoCalls = [];
  let callsThisPage = 0;
  const page = {
    goto: async (url) => { gotoCalls.push(url); callsThisPage = 0; page._lastUrl = url; },
    url: () => page._lastUrl,
    evaluate: async () => {
      callsThisPage += 1;
      if (callsThisPage === 1) return 'ok pagina normal';
      const idx = gotoCalls.length - 1;
      return pagesByIndex[idx] || [];
    },
    screenshot: async () => {},
  };
  page.gotoCalls = gotoCalls;
  return page;
}

const runId = `test-discovery-core-${Date.now()}`;
const fakePage = makeFakePage([
  [{ title: 'AS400 Developer', company: 'Acme', link: 'https://portal.example/1' }],
  [], // pagina 2 vacia -> fin real de resultados
]);
const resultado = await discoverJobsPaginated(runId, 'generic-test-node', {
  page: fakePage,
  buildPageUrl: (i) => `https://portal.example/jobs?page=${i}`,
  scrapePage: async (p) => p.evaluate(),
  isRelevant: filtroAS400,
  maxResults: 5,
  extra: { portal: 'test-portal' },
});
if (resultado.ok !== true || resultado.status !== 'completed') throw new Error('Debe completarse sin bloqueo');
if (resultado.returned !== 1) throw new Error('Debe encontrar 1 relevante');
if (resultado.stopped_reason !== 'no_more_results') throw new Error('Debe parar por fin real de resultados, no por otro motivo');
if (resultado.portal !== 'test-portal') throw new Error('Los campos extra deben propagarse al resultado');
if (resultado.applied !== false) throw new Error('Un nodo de discovery jamas debe marcar applied:true');

// Registrado via execution-debug.mjs.
const grabado = getNodeExecutionData(runId, 'generic-test-node');
if (!grabado.last || grabado.last.status !== 'completed') throw new Error('Debe quedar grabado el nodo generico');

// --- caso bloqueado ------------------------------------------------------------------
const runIdBloqueado = `test-discovery-core-blocked-${Date.now()}`;
const pageBloqueada = {
  goto: async () => {}, url: () => 'https://portal.example/checkpoint/x',
  evaluate: async () => 'verify you are human', screenshot: async () => {},
};
const bloqueado = await discoverJobsPaginated(runIdBloqueado, 'generic-test-node', {
  page: pageBloqueada, buildPageUrl: () => 'https://portal.example/checkpoint/x',
  scrapePage: async () => [], isRelevant: filtroAS400,
});
if (bloqueado.ok !== false || bloqueado.status !== 'blocked') throw new Error('Un checkpoint real debe pararse y reportarse');

// Limpieza.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const id of [runId, runIdBloqueado]) {
  fs.rmSync(path.join(root, 'data', 'careerai', 'executions', `${id}.json`), { force: true });
}

console.log(JSON.stringify({
  ok: true,
  node: 'job-discovery-core',
  compartido_entre_portales: true,
  mismo_filtro_de_relevancia_por_titulo: true,
  mismo_detectBlocked_generico: true,
  paginacion_generica_probada: true,
}));
