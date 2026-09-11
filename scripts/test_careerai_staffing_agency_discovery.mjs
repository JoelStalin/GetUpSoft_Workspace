import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAgencyPortalConfig, discoverStaffingAgencyJobs } from '../platform/orca/src/careerai/staffing-agency-discovery.mjs';
import { getNodeExecutionData } from '../platform/orca/src/careerai/execution-debug.mjs';

// --- buildAgencyPortalConfig: exige lo minimo para poder leer el DOM real ---------------
let fallo = null;
try { buildAgencyPortalConfig({ portalName: 'x' }); } catch (e) { fallo = e.message; }
if (!fallo || !/baseUrl/.test(fallo)) throw new Error('Sin baseUrl, debe fallar explicando que falta');

const portalConfig = buildAgencyPortalConfig({
  portalName: 'agencia-enfermeria',
  baseUrl: 'https://agencia-enfermeria.example/empleos',
  cardSelector: '.job-card',
  titleSelector: '.job-title a',
  companySelector: '.job-company',
  locationSelector: '.job-location',
});

function makeFakePage(pagesByIndex) {
  const gotoCalls = [];
  let callsThisPage = 0;
  const page = {
    goto: async (url) => { gotoCalls.push(url); callsThisPage = 0; page._lastUrl = url; },
    url: () => page._lastUrl,
    evaluate: async (fn, arg) => {
      callsThisPage += 1;
      if (callsThisPage === 1) return 'ok';
      return pagesByIndex[gotoCalls.length - 1] || [];
    },
    screenshot: async () => {},
  };
  page.gotoCalls = gotoCalls;
  return page;
}

// --- configurable por profesion: enfermeria, no tecnologia -----------------------------
const runId = `test-staffing-agency-${Date.now()}`;
const fakePage = makeFakePage([
  [
    { title: 'Auxiliar administrativo', company: 'Clinica X', link: 'https://agencia-enfermeria.example/empleos/1' },
    { title: 'Enfermera de cuidados intensivos', company: 'Clinica Y', link: 'https://agencia-enfermeria.example/empleos/2' },
  ],
]);
const resultado = await discoverStaffingAgencyJobs(runId, {
  page: fakePage, portalConfig, keywords: 'enfermeria', maxPages: 1,
  termPatterns: [/enfermer[ao]/i, /cuidados intensivos/i],
});
if (resultado.ok !== true) throw new Error('Debe completarse sin bloqueo');
if (resultado.returned !== 1) throw new Error('Solo la vacante de enfermeria es relevante, no el puesto administrativo');
if (resultado.portal !== 'agencia-enfermeria') throw new Error('Debe declarar el nombre del portal configurado');
if (!fakePage.gotoCalls[0].includes('agencia-enfermeria.example')) throw new Error('Debe navegar al portal configurado por el cliente, no a uno cableado');

// --- sin termPatterns: se niega a aceptar cualquier resultado a ciegas -----------------
let falloSinPatrones = null;
try {
  await discoverStaffingAgencyJobs(runId, { page: fakePage, portalConfig, keywords: 'x', termPatterns: [] });
} catch (e) { falloSinPatrones = e.message; }
if (!falloSinPatrones || !/termPatterns/.test(falloSinPatrones)) {
  throw new Error('Sin termPatterns, debe negarse explicitamente en vez de aceptar cualquier vacante del portal');
}

const grabado = getNodeExecutionData(runId, 'staffing-agency-discovery:agencia-enfermeria');
if (!grabado.last || grabado.last.status !== 'completed') throw new Error('Debe quedar grabado bajo un node_id que identifica el portal especifico');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
fs.rmSync(path.join(root, 'data', 'careerai', 'executions', `${runId}.json`), { force: true });

console.log(JSON.stringify({
  ok: true,
  node: 'staffing-agency-discovery',
  configurable_por_cliente_no_cableado: true,
  funciona_para_cualquier_profesion_no_solo_tecnologia: true,
  se_niega_sin_criterio_de_relevancia: true,
  node_id_identifica_el_portal_especifico: true,
}));
