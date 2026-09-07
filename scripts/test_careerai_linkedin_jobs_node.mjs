import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  isRelevantToStack, processRawResults, detectBlocked, discoverLinkedInJobs,
} from '../apps/orca/src/careerai/linkedin-jobs-node.mjs';
import { getNodeExecutionData } from '../apps/orca/src/careerai/execution-debug.mjs';

// --- filtro de relevancia: el bug real de la corrida del 2026-09-07 ------------------
// 7 resultados, 0 relevantes: "Incoming Technician", "Business Analyst" pasaban el OR de
// LinkedIn. Esto verifica que ESTE filtro los descarta.
const ruidoReal = [
  { title: 'Incoming Technician', company: 'Eaton', link: 'https://linkedin.com/jobs/view/1' },
  { title: 'Business Analyst', company: 'SPI|TC', link: 'https://linkedin.com/jobs/view/2' },
  { title: 'Lead Mechanical Engineer', company: 'Eaton', link: 'https://linkedin.com/jobs/view/3' },
];
for (const job of ruidoReal) {
  if (isRelevantToStack(job)) throw new Error(`Falso positivo real que ya paso una vez: "${job.title}" no deberia ser relevante`);
}

const relevantesReales = [
  { title: 'AS400 RPGLE Developer', company: 'Acme' },
  { title: 'Programador iSeries / IBM i', company: 'Acme' },
  { title: 'Senior System i Analyst', company: 'Acme' },
  { title: 'RPG Developer (AS/400)', company: 'Acme' },
];
for (const job of relevantesReales) {
  if (!isRelevantToStack(job)) throw new Error(`Debe reconocer "${job.title}" como relevante al stack`);
}

// Mencionar el termino solo en la descripcion (no en el titulo) NO basta — mismo criterio que
// stack-classifier.mjs con "java-menciona-as400": una mencion de pasada no es la vacante.
const mencionDePasada = { title: 'Business Analyst', description: 'Conocimiento de AS400 es un plus', link: 'x' };
if (isRelevantToStack(mencionDePasada)) throw new Error('Una mencion en la descripcion, sin señal en el titulo, no debe bastar');

// --- processRawResults: dedup + filtro + limite ---------------------------------------
const crudo = [...ruidoReal, ...relevantesReales.map((j, i) => ({ ...j, link: `https://linkedin.com/jobs/view/r${i}` }))];
const procesado = processRawResults(crudo, { maxResults: 2 });
if (procesado.total_scraped !== crudo.length) throw new Error('Debe reportar cuanto se scrapeo antes de filtrar');
if (procesado.relevant.length !== 2) throw new Error('Debe respetar el limite maxResults sobre lo relevante');
if (procesado.discarded_as_noise.length !== ruidoReal.length) throw new Error('Debe reportar lo descartado, no solo omitirlo en silencio');

// Duplicado por mismo link: no debe contarse dos veces.
const conDuplicado = [...crudo, { ...relevantesReales[0], link: crudo[3].link }];
const procesadoDup = processRawResults(conDuplicado, { maxResults: 10 });
if (procesadoDup.total_deduped !== crudo.length) throw new Error('Un link repetido no debe inflar el conteo');

// --- guarda de checkpoint/captcha: parte pura ------------------------------------------
if (!detectBlocked('https://www.linkedin.com/checkpoint/challenge', '')) {
  throw new Error('Una URL de checkpoint debe detectarse como bloqueo');
}
if (!detectBlocked('https://www.linkedin.com/jobs/search/', 'Please verify it\'s you before continuing')) {
  throw new Error('Un texto de verificacion humana debe detectarse como bloqueo');
}
if (detectBlocked('https://www.linkedin.com/jobs/search/', 'Jobs you might like')) {
  throw new Error('Una pagina normal de resultados NO debe marcarse como bloqueada (falso positivo)');
}

// --- discoverLinkedInJobs: nodo completo con un page falso (sin Chrome real) ----------
// Fabrica de page falso consciente de paginacion: cada goto(url) fija la "pagina actual" a
// partir de &start=, y evaluate() alterna bodyText (1ra llamada tras cada goto) / scrape (2da)
// segun ESE contador por-goto, no un contador global — asi el comportamiento no depende de
// cuantas paginas se pidan.
function makeFakePage(pagesByStart) {
  const gotoCalls = [];
  let callsThisPage = 0;
  const page = {
    goto: async (url) => { gotoCalls.push(url); callsThisPage = 0; page._lastUrl = url; },
    url: () => page._lastUrl,
    evaluate: async () => {
      callsThisPage += 1;
      if (callsThisPage === 1) return 'Jobs you might like';
      const start = Number(new URL(page._lastUrl).searchParams.get('start') || 0);
      return pagesByStart[start] || [];
    },
    screenshot: async () => {},
  };
  page.gotoCalls = gotoCalls;
  return page;
}

const runId = `test-linkedin-node-${Date.now()}`;
const fakePage = makeFakePage({
  0: [
    { title: 'Business Analyst', company: 'SPI', location: 'RD', link: 'https://linkedin.com/jobs/view/99' },
    { title: 'AS400 RPGLE Developer', company: 'Acme', location: 'Remote', link: 'https://linkedin.com/jobs/view/100' },
  ],
});

const resultado = await discoverLinkedInJobs(runId, { page: fakePage, maxResults: 5 });
if (resultado.ok !== true || resultado.status !== 'completed') throw new Error('Debe completarse con un page valido y sin bloqueo');
if (resultado.applied !== false) throw new Error('Un nodo de discovery jamas debe marcar applied:true');
if (resultado.returned !== 1) throw new Error('Del resultado mixto, solo 1 de 2 es relevante');
if (resultado.relevant[0].title !== 'AS400 RPGLE Developer') throw new Error('Debe devolver el relevante, no el ruido');
// Solo 1 relevante encontrado (< maxResults 5), pero la pagina 2 no trae nada nuevo (no esta
// en pagesByStart) -> debe parar por "no_more_results", no seguir pidiendo paginas vacias.
if (resultado.stopped_reason !== 'no_more_results') throw new Error('Sin mas resultados nuevos, debe parar y decir por que, no seguir insistiendo');
if (fakePage.gotoCalls.length !== 2) throw new Error('Debe intentar una pagina mas antes de concluir que no hay mas, ni una sola de mas');

// Debe quedar grabado via execution-debug.mjs (el canvas de ORCA lo puede inspeccionar).
const grabado = getNodeExecutionData(runId, 'linkedin-jobs-search');
if (!grabado.last || grabado.last.status !== 'completed') throw new Error('El nodo debe registrar su ejecucion real');
if (grabado.last.output.returned !== 1) throw new Error('Lo grabado debe coincidir con lo devuelto');

// --- paginacion real: la pagina 1 no alcanza, la pagina 2 completa maxResults ----------
const runIdPaginado = `test-linkedin-node-paginado-${Date.now()}`;
const fakePagePaginado = makeFakePage({
  0: [{ title: 'AS400 RPGLE Developer', company: 'Acme', link: 'https://linkedin.com/jobs/view/1' }],
  25: [
    { title: 'Programador iSeries', company: 'Beta', link: 'https://linkedin.com/jobs/view/2' },
    { title: 'Business Analyst', company: 'Noise', link: 'https://linkedin.com/jobs/view/3' },
  ],
});
const paginado = await discoverLinkedInJobs(runIdPaginado, { page: fakePagePaginado, maxResults: 2, maxPages: 3 });
if (paginado.returned !== 2) throw new Error('Debe juntar relevantes a traves de varias paginas hasta llegar a maxResults');
if (paginado.stopped_reason !== 'max_results_reached') throw new Error('Al llegar a maxResults debe parar por eso, no seguir paginando');
if (paginado.pages_fetched !== 2) throw new Error('Debe parar en cuanto junta maxResults, sin pedir una tercera pagina de mas');
if (fakePagePaginado.gotoCalls.length !== 2) throw new Error('No debe navegar mas paginas de las necesarias');

// --- maxPages como tope duro: aunque falten relevantes, no sigue indefinidamente ------
const runIdTope = `test-linkedin-node-tope-${Date.now()}`;
const fakePageTope = makeFakePage({
  0: [{ title: 'Noise A', company: 'X', link: 'https://linkedin.com/jobs/view/a' }],
  25: [{ title: 'Noise B', company: 'X', link: 'https://linkedin.com/jobs/view/b' }],
  50: [{ title: 'Noise C', company: 'X', link: 'https://linkedin.com/jobs/view/c' }],
  75: [{ title: 'AS400 tardio', company: 'X', link: 'https://linkedin.com/jobs/view/d' }],
});
const tope = await discoverLinkedInJobs(runIdTope, { page: fakePageTope, maxResults: 5, maxPages: 3 });
if (tope.stopped_reason !== 'max_pages_reached') throw new Error('Debe respetar el tope de paginas aunque no haya juntado maxResults');
if (tope.pages_fetched !== 3) throw new Error('No debe pasarse del tope de paginas configurado');
if (tope.returned !== 0) throw new Error('La vacante relevante de la pagina 4 no debe aparecer: nunca se pidio esa pagina');

// --- caso bloqueado: checkpoint detectado, no revienta, reporta claro -----------------
const runIdBloqueado = `test-linkedin-node-blocked-${Date.now()}`;
const fakePageBloqueado = {
  goto: async () => {},
  url: () => 'https://www.linkedin.com/checkpoint/challenge',
  evaluate: async () => 'verify it\'s you',
  screenshot: async () => {},
};
const bloqueado = await discoverLinkedInJobs(runIdBloqueado, { page: fakePageBloqueado });
if (bloqueado.ok !== false || bloqueado.status !== 'blocked' || bloqueado.blocked_at !== 'linkedin_checkpoint') {
  throw new Error('Un checkpoint real debe reportarse como bloqueado, no como error generico ni como exito');
}

// Limpieza de los archivos de ejecucion que crearon estos tests.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const id of [runId, runIdPaginado, runIdTope, runIdBloqueado]) {
  fs.rmSync(path.join(root, 'data', 'careerai', 'executions', `${id}.json`), { force: true });
}

console.log(JSON.stringify({
  ok: true,
  node: 'linkedin-jobs-search',
  filtro_de_relevancia_corrige_el_bug_real: true,
  descarta_ruido_reportandolo: true,
  detecta_checkpoint_sin_esquivarlo: true,
  registrado_en_execution_debug: true,
  nunca_marca_applied: true,
}));
