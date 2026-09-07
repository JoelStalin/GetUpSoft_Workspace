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
const runId = `test-linkedin-node-${Date.now()}`;
const gotoCalls = [];
const fakePage = {
  goto: async (url) => { gotoCalls.push(url); },
  url: () => 'https://www.linkedin.com/jobs/search/?keywords=x',
  evaluate: async (fn) => {
    // El primer evaluate (bodyText) y el segundo (scrape de tarjetas) usan la misma funcion
    // inyectada; se distingue por longitud del resultado esperado via un contador simple.
    fakePage._calls = (fakePage._calls || 0) + 1;
    if (fakePage._calls === 1) return 'Jobs you might like';
    return [
      { title: 'Business Analyst', company: 'SPI', location: 'RD', link: 'https://linkedin.com/jobs/view/99' },
      { title: 'AS400 RPGLE Developer', company: 'Acme', location: 'Remote', link: 'https://linkedin.com/jobs/view/100' },
    ];
  },
  screenshot: async () => {},
};

const resultado = await discoverLinkedInJobs(runId, { page: fakePage, maxResults: 5 });
if (resultado.ok !== true || resultado.status !== 'completed') throw new Error('Debe completarse con un page valido y sin bloqueo');
if (resultado.applied !== false) throw new Error('Un nodo de discovery jamas debe marcar applied:true');
if (resultado.returned !== 1) throw new Error('Del resultado mixto, solo 1 de 2 es relevante');
if (resultado.relevant[0].title !== 'AS400 RPGLE Developer') throw new Error('Debe devolver el relevante, no el ruido');
if (gotoCalls.length !== 1 || !gotoCalls[0].includes('linkedin.com/jobs/search')) {
  throw new Error('Debe navegar a la busqueda de LinkedIn Jobs');
}

// Debe quedar grabado via execution-debug.mjs (el canvas de ORCA lo puede inspeccionar).
const grabado = getNodeExecutionData(runId, 'linkedin-jobs-search');
if (!grabado.last || grabado.last.status !== 'completed') throw new Error('El nodo debe registrar su ejecucion real');
if (grabado.last.output.returned !== 1) throw new Error('Lo grabado debe coincidir con lo devuelto');

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
for (const id of [runId, runIdBloqueado]) {
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
