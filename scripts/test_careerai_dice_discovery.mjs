import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverDiceJobs, isRelevantToStack } from '../platform/orca/src/careerai/dice-discovery.mjs';
import { getNodeExecutionData } from '../platform/orca/src/careerai/execution-debug.mjs';

// --- filtro de relevancia: mismo criterio ya probado en LinkedIn -----------------------
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

// --- caso feliz: resultado mixto, filtra el ruido ---------------------------------------
const runId = `test-dice-${Date.now()}`;
const fakePage = makeFakePage([
  [
    { title: 'Marketing Manager', company: 'X', link: 'https://dice.com/jobs/1' },
    { title: 'AS400 RPG Developer', company: 'Y', link: 'https://dice.com/jobs/2' },
  ],
]);
const resultado = await discoverDiceJobs(runId, { page: fakePage, maxResults: 5, maxPages: 1 });
if (resultado.ok !== true) throw new Error('Debe completarse sin bloqueo');
if (resultado.returned !== 1) throw new Error('Solo 1 de 2 es relevante');
if (resultado.portal !== 'dice') throw new Error('Debe declarar el portal explicitamente');
if (resultado.applied !== false) throw new Error('Discovery jamas debe marcar applied:true');
if (!fakePage.gotoCalls[0].includes('dice.com')) throw new Error('Debe navegar a dice.com');

// --- 0 resultados: debe avisar que puede ser un selector desactualizado, no confiar a ciegas
const runIdCero = `test-dice-zero-${Date.now()}`;
const pageVacia = makeFakePage([[]]);
const cero = await discoverDiceJobs(runIdCero, { page: pageVacia, maxResults: 5, maxPages: 1 });
if (!cero.warning || !/selectores_no_verificados/.test(cero.warning)) {
  throw new Error('0 resultados en todas las paginas debe advertir que los selectores podrian estar desactualizados, no reportarlo como si fuera un hecho confiable');
}

// Registrado via execution-debug.mjs.
const grabado = getNodeExecutionData(runId, 'dice-discovery');
if (!grabado.last || grabado.last.status !== 'completed') throw new Error('Debe quedar grabado el nodo');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const id of [runId, runIdCero]) {
  fs.rmSync(path.join(root, 'data', 'careerai', 'executions', `${id}.json`), { force: true });
}

console.log(JSON.stringify({
  ok: true,
  node: 'dice-discovery',
  reutiliza_core_compartido: true,
  filtra_ruido_por_titulo: true,
  advierte_si_0_resultados_selectores_no_verificados: true,
  pendiente_de_prueba_real_contra_dice: true,
}));
