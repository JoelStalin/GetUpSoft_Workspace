import { runPipeline } from '../apps/orca/src/careerai/pipeline.mjs';

const catalogo = {
  families: [
    { id: 'familia-a', label: 'Familia A', terms: ['Alfa', 'Beta'], adjacent: [], negative: [], seniority_terms: [] },
    { id: 'familia-b', label: 'Familia B', terms: ['Gamma'], adjacent: [], negative: [], seniority_terms: [] },
  ],
};

const oportunidades = [
  {
    opportunity_id: 'o1', title: 'Especialista Alfa', company: 'Empresa Uno',
    canonical_url: 'https://board.example/1?utm_source=x', location: 'Remote',
    description: 'Puesto totalmente remoto trabajando con Alfa. Easy Apply desde la plataforma.',
    match_score: 0.9, published_at: '2026-08-20T00:00:00Z',
  },
  // Duplicado por parametro de seguimiento: debe fundirse con el anterior.
  { opportunity_id: 'o1b', title: 'Especialista Alfa', company: 'Empresa Uno', canonical_url: 'https://board.example/1?utm_source=y', description: 'Alfa remoto' },
  {
    opportunity_id: 'o2', title: 'Tecnico Gamma', company: 'Empresa Dos',
    canonical_url: 'https://board.example/2', location: 'Remote',
    description: 'Trabajo remoto con Gamma, pero 2 days per week in the office. Envie su CV a rrhh@empresa-dos.com',
    match_score: 0.7, published_at: '2026-08-25T00:00:00Z',
  },
  {
    opportunity_id: 'o3', title: 'Puesto ajeno', company: 'Empresa Tres',
    canonical_url: 'https://board.example/3', description: 'Nada que ver con el perfil del cliente.',
  },
];

const now = new Date('2026-08-27T12:00:00Z');

// --- guarda de arranque -------------------------------------------------------
const sinPerfil = await runPipeline({ tenantId: 't1', rankedFamilies: [], opportunities: oportunidades, now });
if (sinPerfil.ok !== false || sinPerfil.blocked_at !== 'profile') {
  throw new Error('Sin perfil confirmado y ordenado no se busca nada');
}

let code = null;
try { await runPipeline({ rankedFamilies: ['familia-a'], now }); } catch (error) { code = error.code; }
if (code !== 'MISSING_TENANT') throw new Error('El pipeline es por cliente');

// --- ejecucion completa -------------------------------------------------------
const resultado = await runPipeline({
  tenantId: 't1',
  rankedFamilies: ['familia-a', 'familia-b'],
  opportunities: oportunidades,
  catalog: catalogo,
  now,
});

if (!resultado.ok || resultado.status !== 'completed') throw new Error('El pipeline debe completarse');
if (resultado.submit_performed !== false) throw new Error('Ningun paso del pipeline envia nada');
if (resultado.approval_required !== true) throw new Error('El envio sigue exigiendo aprobacion');

// Los ocho nodos deben haber corrido, en orden.
const esperados = ['dedupe-canonical', 'stack-classifier', 'remote-verifier', 'opportunity-upsert',
  'priority-ranker', 'new-position-trigger', 'apply-method-classifier', 'unsupported-collector'];
const ejecutados = resultado.steps.map((step) => step.node);
if (JSON.stringify(ejecutados) !== JSON.stringify(esperados)) {
  throw new Error(`El orden de los nodos no coincide: ${ejecutados.join(' -> ')}`);
}

// La deduplicacion funde el duplicado por parametro de seguimiento.
if (resultado.summary.received !== 4 || resultado.summary.unique !== 3) {
  throw new Error(`Esperaba 4 recibidas y 3 unicas, obtuve ${resultado.summary.received}/${resultado.summary.unique}`);
}

// La que no encaja en el catalogo del cliente no pasa a clasificada.
if (resultado.summary.classified !== 2) throw new Error(`Esperaba 2 clasificadas, obtuve ${resultado.summary.classified}`);

// El falso remoto (2 dias en oficina) no cuenta como remoto verificado.
if (resultado.summary.remote_verified !== 1) {
  throw new Error(`Solo una es remota de verdad, obtuve ${resultado.summary.remote_verified}`);
}

// El ranking del cliente manda: familia-a antes que familia-b.
if (resultado.ranked[0].family_id !== 'familia-a') throw new Error('Debe mandar el ranking del cliente');

// La via de postulacion se decide por oportunidad.
if (!resultado.summary.by_method) throw new Error('Debe desglosar por via de postulacion');

// Lo ya visto no se reanaliza: gasta cuota del cliente sin aportar nada.
const conVistas = await runPipeline({
  tenantId: 't1', rankedFamilies: ['familia-a', 'familia-b'], opportunities: oportunidades,
  catalog: catalogo, seenIds: new Set(['o1']), now,
});
if (conVistas.summary.new_positions >= resultado.summary.new_positions) {
  throw new Error('Las posiciones ya vistas deben omitirse');
}

// Persistencia idempotente entre corridas.
const segunda = await runPipeline({
  tenantId: 't1', rankedFamilies: ['familia-a', 'familia-b'], opportunities: oportunidades,
  catalog: catalogo, existing: [], now,
});
if (segunda.stored_total !== resultado.stored_total) throw new Error('La misma entrada debe dar el mismo almacen');

console.log(JSON.stringify({
  ok: true,
  node: 'pipeline',
  pasos: ejecutados.length,
  recibidas: resultado.summary.received,
  unicas: resultado.summary.unique,
  clasificadas: resultado.summary.classified,
  remoto_verificado: resultado.summary.remote_verified,
  submit_performed: false,
}));
