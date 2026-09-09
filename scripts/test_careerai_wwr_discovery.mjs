import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverWwrJobs, isRelevantToStack } from '../apps/orca/src/careerai/wwr-discovery.mjs';
import { getNodeExecutionData } from '../apps/orca/src/careerai/execution-debug.mjs';

if (!isRelevantToStack({ title: 'Senior AS400 RPGLE Developer' })) throw new Error('Debe reconocer el stack en el titulo');
if (isRelevantToStack({ title: 'Business Analyst', description: 'AS400 mencionado de pasada' })) {
  throw new Error('No debe aceptar por mencion fuera del titulo');
}

function makeFakePage(pagesByIndex) {
  const gotoCalls = [];
  let callsThisPage = 0;
  const page = {
    goto: async (url) => { gotoCalls.push(url); callsThisPage = 0; page._lastUrl = url; },
    url: () => page._lastUrl,
    evaluate: async () => {
      callsThisPage += 1;
      if (callsThisPage === 1) return 'ok';
      return pagesByIndex[gotoCalls.length - 1] || [];
    },
    screenshot: async () => {},
  };
  page.gotoCalls = gotoCalls;
  return page;
}

const runId = `test-wwr-${Date.now()}`;
const fakePage = makeFakePage([
  [
    { title: 'Frontend Engineer', company: 'X', link: 'https://weworkremotely.com/remote-jobs/1' },
    { title: 'AS400 iSeries Developer', company: 'Y', link: 'https://weworkremotely.com/remote-jobs/2' },
  ],
]);
const resultado = await discoverWwrJobs(runId, { page: fakePage, maxResults: 5, maxPages: 1 });
if (resultado.ok !== true) throw new Error('Debe completarse sin bloqueo');
if (resultado.returned !== 1) throw new Error('Solo 1 de 2 es relevante');
if (resultado.portal !== 'weworkremotely') throw new Error('Debe declarar el portal explicitamente');
if (resultado.applied !== false) throw new Error('Discovery jamas debe marcar applied:true');
if (!fakePage.gotoCalls[0].includes('weworkremotely.com')) throw new Error('Debe navegar a weworkremotely.com');

const runIdCero = `test-wwr-zero-${Date.now()}`;
const pageVacia = makeFakePage([[]]);
const cero = await discoverWwrJobs(runIdCero, { page: pageVacia, maxResults: 5, maxPages: 1 });
if (!cero.warning || !/selectores_no_verificados/.test(cero.warning)) {
  throw new Error('0 resultados en todas las paginas debe advertir que los selectores podrian estar desactualizados');
}

const grabado = getNodeExecutionData(runId, 'wwr-discovery');
if (!grabado.last || grabado.last.status !== 'completed') throw new Error('Debe quedar grabado el nodo');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const id of [runId, runIdCero]) {
  fs.rmSync(path.join(root, 'data', 'careerai', 'executions', `${id}.json`), { force: true });
}

console.log(JSON.stringify({
  ok: true,
  node: 'wwr-discovery',
  reutiliza_core_compartido: true,
  filtra_ruido_por_titulo: true,
  advierte_si_0_resultados_selectores_no_verificados: true,
  pendiente_de_prueba_real_contra_weworkremotely: true,
}));
