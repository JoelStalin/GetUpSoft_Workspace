import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { upsertOpportunities, buildAuditEntry, appendAudit, readAudit, stripSecrets, rankOpportunities } from '../apps/orca/src/careerai/store.mjs';

const ahora = new Date('2026-08-27T12:00:00Z');

// --- opportunity-upsert ------------------------------------------------------
const primera = upsertOpportunities([], [
  { canonical_url: 'https://board.example/1', title: 'Uno', status: 'discovered' },
  { canonical_url: 'https://board.example/2', title: 'Dos' },
], { tenantId: 't1', now: ahora });
if (primera.created !== 2) throw new Error('Debe crear las dos nuevas');
if (!primera.opportunities[0].opportunity_id) throw new Error('Debe asignar id estable');
if (primera.opportunities[1].status !== 'discovered') throw new Error('Estado por defecto');

// Volver a ver la misma vacante actualiza, no duplica.
const segunda = upsertOpportunities(primera.opportunities, [
  { canonical_url: 'https://board.example/1', title: 'Uno (actualizado)', status: 'classified' },
], { tenantId: 't1', now: new Date('2026-08-27T13:00:00Z') });
if (segunda.created !== 0 || segunda.updated !== 1) throw new Error('Volver a verla actualiza, no duplica');
if (segunda.total !== 2) throw new Error('No debe crecer el total');
const actualizada = segunda.opportunities.find((item) => item.canonical_url === 'https://board.example/1');
if (actualizada.title !== 'Uno (actualizado)') throw new Error('Debe refrescar los datos');
if (actualizada.first_seen_at !== ahora.toISOString()) throw new Error('La primera vez no cambia');
if (actualizada.last_seen_at === ahora.toISOString()) throw new Error('La ultima vez si cambia');
if (actualizada.opportunity_id !== primera.opportunities[0].opportunity_id) throw new Error('El id debe mantenerse');

// El estado no retrocede: una vacante ya postulada no vuelve a "descubierta".
const conAplicada = upsertOpportunities(
  [{ tenant_id: 't1', canonical_url: 'https://board.example/3', opportunity_id: 'x', status: 'applied', first_seen_at: ahora.toISOString() }],
  [{ canonical_url: 'https://board.example/3', status: 'discovered' }],
  { tenantId: 't1', now: ahora },
);
if (conAplicada.opportunities[0].status !== 'applied') throw new Error('El estado avanzado no retrocede');

let code = null;
try { upsertOpportunities([], [], {}); } catch (error) { code = error.code; }
if (code !== 'MISSING_TENANT') throw new Error('Sin tenant debe fallar explicitamente');

// --- audit-append: los secretos nunca entran a la bitacora --------------------
const limpio = stripSecrets({
  usuario: 'joel',
  access_token: 'secreto-real',
  nested: { cookie: 'abc', Authorization: 'Bearer xyz', ok: 'visible' },
  lista: [{ client_secret: 'zzz', titulo: 'visible' }],
});
if (limpio.access_token !== '[redactado]') throw new Error('El token no puede quedar en claro');
if (limpio.nested.cookie !== '[redactado]') throw new Error('Las cookies tampoco');
if (limpio.nested.Authorization !== '[redactado]') throw new Error('La cabecera de autorizacion tampoco');
if (limpio.lista[0].client_secret !== '[redactado]') throw new Error('Ni dentro de un array');
if (limpio.nested.ok !== 'visible' || limpio.usuario !== 'joel') throw new Error('Lo que no es secreto se conserva');

const entrada = buildAuditEntry({ tenantId: 't1', event: 'application_submitted', data: { opportunity_id: 'o1', access_token: 'no-debe-verse' }, actor: 'cliente', now: ahora });
if (entrada.data.access_token !== '[redactado]') throw new Error('La entrada de bitacora debe salir limpia');
if (entrada.tenant_id !== 't1' || entrada.event !== 'application_submitted') throw new Error('Debe conservar tenant y evento');

let codeAudit = null;
try { buildAuditEntry({ event: 'x' }); } catch (error) { codeAudit = error.code; }
if (codeAudit !== 'MISSING_TENANT') throw new Error('Sin tenant no hay bitacora');
try { buildAuditEntry({ tenantId: 't1' }); } catch (error) { codeAudit = error.code; }
if (codeAudit !== 'MISSING_EVENT') throw new Error('Sin evento no hay bitacora');

// Aislamiento entre tenants.
const tmp = path.join(os.tmpdir(), `careerai-audit-${Date.now()}.jsonl`);
appendAudit(tmp, entrada);
appendAudit(tmp, buildAuditEntry({ tenantId: 't2', event: 'otro_evento', now: ahora }));
const soloT1 = readAudit(tmp, { tenantId: 't1' });
if (soloT1.length !== 1) throw new Error('Un tenant no debe ver la bitacora de otro');
if (soloT1[0].event !== 'application_submitted') throw new Error('Debe devolver su propia entrada');
fs.unlinkSync(tmp);

// --- priority-ranker ---------------------------------------------------------
const cola = [
  { opportunity_id: 'a', family_id: 'segunda', match_score: 0.9, published_at: '2026-08-26T00:00:00Z' },
  { opportunity_id: 'b', family_id: 'primera', match_score: 0.4, published_at: '2026-08-20T00:00:00Z' },
  { opportunity_id: 'c', family_id: 'primera', match_score: 0.8, published_at: '2026-08-25T00:00:00Z' },
  { opportunity_id: 'd', family_id: 'sin-elegir', match_score: 0.99, published_at: '2026-08-27T00:00:00Z' },
];
const orden = rankOpportunities(cola, { rankedFamilies: ['primera', 'segunda'], now: ahora });

// El ranking del cliente manda sobre el score: 'b' tiene peor score que 'a' pero su familia
// es la primera que el cliente eligio.
if (orden.ranked[0].opportunity_id !== 'c') throw new Error('Dentro de la familia elegida gana el mejor score');
if (orden.ranked[1].opportunity_id !== 'b') throw new Error('La familia prioritaria va antes que otra con mejor score');
if (orden.ranked[2].opportunity_id !== 'a') throw new Error('La segunda familia del cliente va despues');
if (orden.ranked[3].opportunity_id !== 'd') throw new Error('Lo que no eligio el cliente va al final aunque tenga el mejor score');
if (orden.ranked[3].client_priority !== null) throw new Error('Sin familia elegida no hay prioridad de cliente');
if (orden.outside_client_ranking !== 1) throw new Error('Debe contar lo que queda fuera del ranking, no ocultarlo');

console.log(JSON.stringify({
  ok: true,
  nodes: ['opportunity-upsert', 'audit-append', 'priority-ranker'],
  upsert_idempotente: true,
  estado_no_retrocede: true,
  secretos_redactados: ['access_token', 'cookie', 'authorization', 'client_secret'],
  aislamiento_por_tenant: true,
}));
