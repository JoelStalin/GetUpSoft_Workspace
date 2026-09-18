// Nodos opportunity-upsert, audit-append y priority-ranker.
// Persistencia por tenant y ordenacion de la cola. Dos reglas del contrato que aqui se
// aplican de verdad, no solo se declaran:
//   - `secret_fields_forbidden`: ningun token, cookie o contrasena entra a la bitacora.
//   - la prioridad la marca el ranking del CLIENTE, no una heuristica del sistema.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Declarado en data/careerai/contracts.json; aqui se hace cumplir.
const SECRET_FIELDS = ['token', 'access_token', 'refresh_token', 'cookie', 'cookies', 'password', 'client_secret', 'api_key', 'authorization'];

export function stripSecrets(value, depth = 0) {
  if (depth > 6 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => stripSecrets(item, depth + 1));
  const clean = {};
  for (const [key, item] of Object.entries(value)) {
    if (SECRET_FIELDS.some((secret) => key.toLowerCase().includes(secret))) {
      clean[key] = '[redactado]';
      continue;
    }
    clean[key] = stripSecrets(item, depth + 1);
  }
  return clean;
}

// --- opportunity-upsert ------------------------------------------------------
// Idempotente por (tenant, canonical_url): volver a ver la misma vacante actualiza lo que
// se sabe de ella en vez de crear un duplicado que luego generaria una segunda postulacion.
export function upsertOpportunities(existing = [], incoming = [], { tenantId, now = new Date() } = {}) {
  if (!tenantId) {
    const error = new Error('El almacen es por tenant y falta tenantId');
    error.code = 'MISSING_TENANT';
    throw error;
  }

  const index = new Map(existing.map((item, position) => [`${item.tenant_id}|${item.canonical_url}`, position]));
  const result = [...existing];
  let creadas = 0;
  let actualizadas = 0;

  for (const opportunity of incoming) {
    if (!opportunity?.canonical_url) continue;
    const key = `${tenantId}|${opportunity.canonical_url}`;
    const position = index.get(key);

    if (position === undefined) {
      result.push({
        ...opportunity,
        tenant_id: tenantId,
        opportunity_id: opportunity.opportunity_id || crypto.createHash('sha256').update(key).digest('hex').slice(0, 24),
        first_seen_at: now.toISOString(),
        last_seen_at: now.toISOString(),
        status: opportunity.status || 'discovered',
      });
      index.set(key, result.length - 1);
      creadas += 1;
      continue;
    }

    const previa = result[position];
    result[position] = {
      ...previa,
      ...opportunity,
      tenant_id: tenantId,
      opportunity_id: previa.opportunity_id,
      first_seen_at: previa.first_seen_at,
      last_seen_at: now.toISOString(),
      // El estado que ya avanzo no retrocede: una vacante postulada no vuelve a "descubierta".
      status: rankStatus(opportunity.status) > rankStatus(previa.status) ? opportunity.status : previa.status,
    };
    actualizadas += 1;
  }

  return { ok: true, tenant_id: tenantId, created: creadas, updated: actualizadas, total: result.length, opportunities: result };
}

const ORDEN_ESTADOS = ['discovered', 'classified', 'drafted', 'approved', 'applied', 'confirmed'];
function rankStatus(status) {
  const position = ORDEN_ESTADOS.indexOf(status);
  return position === -1 ? -1 : position;
}

// --- audit-append ------------------------------------------------------------
export function buildAuditEntry({ tenantId, event, data = {}, actor = 'system', now = new Date() } = {}) {
  if (!tenantId) {
    const error = new Error('La bitacora es por tenant y falta tenantId');
    error.code = 'MISSING_TENANT';
    throw error;
  }
  if (!event) {
    const error = new Error('Falta el nombre del evento');
    error.code = 'MISSING_EVENT';
    throw error;
  }
  return {
    tenant_id: tenantId,
    event,
    actor,
    data: stripSecrets(data),
    at: now.toISOString(),
  };
}

export function appendAudit(filePath, entry) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, `${JSON.stringify(entry)}\n`, 'utf8');
  return { ok: true, appended: true, path: filePath };
}

export function readAudit(filePath, { tenantId = null, limit = 100 } = {}) {
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/).filter(Boolean).map((line) => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
  // Un tenant nunca ve la bitacora de otro.
  const filtered = tenantId ? lines.filter((item) => item.tenant_id === tenantId) : lines;
  return filtered.slice(-limit).reverse();
}

// --- priority-ranker ---------------------------------------------------------
// El orden lo marca el ranking que eligio el cliente. La frescura y el score solo desempatan
// dentro de una misma familia: el sistema no reordena las prioridades del cliente.
export function rankOpportunities(opportunities = [], { rankedFamilies = [], now = new Date() } = {}) {
  const familyRank = new Map(rankedFamilies.map((id, position) => [id, position]));

  const scored = opportunities.map((opportunity) => {
    const family = opportunity.family_id;
    const familyPosition = familyRank.has(family) ? familyRank.get(family) : Number.MAX_SAFE_INTEGER;
    const publishedAt = opportunity.published_at ? new Date(opportunity.published_at) : null;
    const ageDays = publishedAt ? Math.max(0, Math.floor((now - publishedAt) / 86400000)) : null;
    return {
      opportunity_id: opportunity.opportunity_id,
      family_id: family || null,
      client_priority: familyPosition === Number.MAX_SAFE_INTEGER ? null : familyPosition + 1,
      age_days: ageDays,
      match_score: typeof opportunity.match_score === 'number' ? opportunity.match_score : null,
      _familyPosition: familyPosition,
      _age: ageDays === null ? Number.MAX_SAFE_INTEGER : ageDays,
      _score: opportunity.match_score ?? -1,
    };
  });

  scored.sort((a, b) => {
    if (a._familyPosition !== b._familyPosition) return a._familyPosition - b._familyPosition;
    if (a._score !== b._score) return b._score - a._score;
    return a._age - b._age;
  });

  return {
    ok: true,
    total: scored.length,
    // Lo que no encaja en ninguna familia elegida no se descarta, va al final y se cuenta.
    outside_client_ranking: scored.filter((item) => item.client_priority === null).length,
    ranked: scored.map(({ _familyPosition, _age, _score, ...item }, position) => ({ ...item, position: position + 1 })),
  };
}
