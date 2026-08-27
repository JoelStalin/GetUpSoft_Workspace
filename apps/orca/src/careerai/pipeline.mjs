// Ejecuta la cadena real de nodos de punta a punta. Hasta ahora los modulos estaban
// probados en aislamiento y declarados en el blueprint, pero nada los encadenaba: el canvas
// mostraba la arquitectura, no una ejecucion. Esto es lo que la hace ejecutable.
//
// Se detiene en el primer gate que lo exija y devuelve el estado de cada paso, para que el
// panel de ORCA muestre donde esta el flujo y por que se paro.
import { dedupe } from './dedupe.mjs';
import { classify } from './stack-classifier.mjs';
import { verifyRemote } from './guards.mjs';
import { upsertOpportunities } from './store.mjs';
import { rankOpportunities } from './store.mjs';
import { triggerAnalysis } from './apply-method-classifier.mjs';
import { collectUnsupported } from './client-report.mjs';

export async function runPipeline({
  tenantId,
  rankedFamilies = [],
  opportunities = [],
  seenIds = new Set(),
  existing = [],
  catalog = undefined,
  candidateCountry = null,
  now = new Date(),
} = {}) {
  if (!tenantId) {
    const error = new Error('El pipeline es por cliente y falta tenantId');
    error.code = 'MISSING_TENANT';
    throw error;
  }
  if (!rankedFamilies.length) {
    // La guarda de arranque: sin perfil confirmado y ordenado no se busca nada.
    return {
      ok: false,
      status: 'blocked',
      blocked_at: 'profile',
      reason: 'el cliente no ha confirmado ni ordenado sus profesiones',
      steps: [],
    };
  }

  const steps = [];
  const paso = (node, status, detail = {}) => {
    steps.push({ node, status, ...detail });
  };

  // 1. Deduplicacion
  const deduped = dedupe(opportunities);
  paso('dedupe-canonical', 'completed', { input: deduped.input, unique: deduped.unique, removed: deduped.removed });

  // 2. Clasificacion contra el catalogo del cliente
  const clasificadas = deduped.opportunities.map((opportunity) => {
    const classification = classify(opportunity, { rankedFamilies, ...(catalog ? { catalog } : {}) });
    return { ...opportunity, family_id: classification.family_id, classification_status: classification.status };
  });
  const reconocidas = clasificadas.filter((item) => item.classification_status === 'classified');
  paso('stack-classifier', 'completed', { classified: reconocidas.length, unclassified: clasificadas.length - reconocidas.length });

  // 3. Verificacion de remoto real
  const verificadas = reconocidas.map((opportunity) => {
    const remote = verifyRemote(opportunity, { candidateCountry });
    return { ...opportunity, remote_verified: remote.remote_verified, remote_recommendation: remote.recommendation };
  });
  const remotasReales = verificadas.filter((item) => item.remote_verified);
  paso('remote-verifier', 'completed', { verified_remote: remotasReales.length, needs_review: verificadas.length - remotasReales.length });

  // 4. Persistencia idempotente
  const store = upsertOpportunities(existing, verificadas, { tenantId, now });
  paso('opportunity-upsert', 'completed', { created: store.created, updated: store.updated, total: store.total });

  // 5. Orden segun el ranking del cliente
  const orden = rankOpportunities(verificadas, { rankedFamilies, now });
  paso('priority-ranker', 'completed', { ranked: orden.total, outside_ranking: orden.outside_client_ranking });

  // 6. Disparo del analisis solo con posiciones nuevas
  const disparo = triggerAnalysis(verificadas, seenIds);
  paso('new-position-trigger', 'completed', { new_positions: disparo.new_positions, skipped: disparo.skipped_already_seen });
  paso('apply-method-classifier', 'completed', { by_method: disparo.by_method });

  // 7. Lo que no se puede completar va al reporte del cliente
  const pendientes = collectUnsupported(disparo.analyzed);
  paso('unsupported-collector', 'completed', { unsupported: pendientes.total, by_reason: pendientes.by_reason });

  return {
    ok: true,
    status: 'completed',
    tenant_id: tenantId,
    // Ningun paso de este pipeline envia nada: la ejecucion real se detiene antes del envio.
    submit_performed: false,
    approval_required: true,
    steps,
    summary: {
      received: opportunities.length,
      unique: deduped.unique,
      classified: reconocidas.length,
      remote_verified: remotasReales.length,
      new_positions: disparo.new_positions,
      unsupported: pendientes.total,
      by_method: disparo.by_method,
    },
    ranked: orden.ranked.slice(0, 10),
    unsupported: pendientes.items,
    stored_total: store.total,
  };
}
