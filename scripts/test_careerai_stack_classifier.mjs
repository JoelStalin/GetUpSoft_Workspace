import { classify, classifyAll } from '../apps/orca/src/careerai/stack-classifier.mjs';

const ranked = ['iseries-core', 'odoo-python', 'fullstack-web'];

// Caso claro: el puesto es de iSeries y lo dice el titulo.
const iseries = classify({
  opportunity_id: 'a',
  title: 'Senior RPGLE Developer - IBM i',
  description: 'Maintain ILE RPG programs on AS/400, CL and DB2/400.',
}, { rankedFamilies: ranked });
if (iseries.family_id !== 'iseries-core') throw new Error(`Esperaba iseries-core, obtuve ${iseries.family_id}`);
if (iseries.priority !== 1) throw new Error('La prioridad debe salir del ranking del cliente');

// El caso que motiva el nodo: Java que menciona AS/400 de pasada NO es una vacante de iSeries.
const java = classify({
  opportunity_id: 'b',
  title: 'Senior Java Engineer',
  description: 'Build REST APIs in TypeScript and React. Some data comes from a legacy AS/400 system.',
}, { rankedFamilies: ranked });
if (java.family_id === 'iseries-core') {
  throw new Error('Una mencion de pasada en la descripcion no debe clasificar como iSeries');
}

// El titulo pesa mas que la descripcion.
const odoo = classify({
  opportunity_id: 'c',
  title: 'Odoo Developer',
  description: 'Python and PostgreSQL. Occasional JavaScript work.',
}, { rankedFamilies: ranked });
if (odoo.family_id !== 'odoo-python') throw new Error(`Esperaba odoo-python, obtuve ${odoo.family_id}`);
if (odoo.priority !== 2) throw new Error('Odoo es la segunda prioridad de este cliente');

// Termino negativo: descarta la familia completa.
const juego = classify({
  opportunity_id: 'd',
  title: 'RPG Designer',
  description: 'Design tabletop role playing game systems and campaigns.',
}, { rankedFamilies: ranked });
if (juego.family_id === 'iseries-core') throw new Error('El termino negativo debe descartar la familia');
if (!juego.rejected_families.includes('iseries-core')) throw new Error('Debe reportar que familia se descarto y por que');

// Sin senal: unclassified antes que forzar una familia equivocada.
const vacio = classify({ opportunity_id: 'e', title: 'Office Manager', description: 'Answer phones.' }, { rankedFamilies: ranked });
if (vacio.status !== 'unclassified') throw new Error('Sin senal debe quedar unclassified');
if (vacio.family_id !== null) throw new Error('Unclassified no debe inventar una familia');

// Limites de palabra: "CL" no debe coincidir dentro de otras palabras.
const falso = classify({
  opportunity_id: 'f',
  title: 'Client Success Manager',
  description: 'Manage client relationships and CLIENT onboarding.',
}, { rankedFamilies: ranked });
if (falso.family_id === 'iseries-core') throw new Error('"CL" no debe coincidir dentro de "CLIENT"');

// El ranking del cliente acota contra que se clasifica.
const soloWeb = classify({
  opportunity_id: 'g',
  title: 'Senior RPGLE Developer',
  description: 'AS/400 shop.',
}, { rankedFamilies: ['fullstack-web'] });
if (soloWeb.status !== 'unclassified') {
  throw new Error('Si el cliente no eligio iSeries, esa vacante no le interesa');
}

const lote = classifyAll([
  { opportunity_id: 'a', title: 'RPGLE Developer', description: 'IBM i' },
  { opportunity_id: 'e', title: 'Office Manager', description: 'Answer phones.' },
], { rankedFamilies: ranked });
if (lote.total !== 2 || lote.classified !== 1 || lote.unclassified !== 1) {
  throw new Error(`Conteo de lote incorrecto: ${JSON.stringify(lote)}`);
}

console.log(JSON.stringify({
  ok: true,
  node: 'stack-classifier',
  clasificadas: lote.classified,
  sin_clasificar: lote.unclassified,
  falsos_positivos_rechazados: ['java-menciona-as400', 'rpg-de-videojuegos', 'CL-dentro-de-CLIENT'],
}));
