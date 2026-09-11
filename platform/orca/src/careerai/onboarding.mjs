// Nodos profile-confirmation y priority-prompt.
//
// Cierran el bloque de perfil profesional. El sistema PROPONE lo que extrajo del CV; el
// cliente confirma, corrige y ordena. Nada arranca sin su confirmacion explicita: buscar con
// un perfil equivocado gasta su cuota y le llena la cola de vacantes que no quiere.

export const ESTADOS = Object.freeze({
  PENDING: 'pending_confirmation',
  CONFIRMED: 'confirmed',
  NEEDS_RANKING: 'pending_ranking',
  READY: 'ready_to_search',
});

// El sistema propone en el orden en que salieron del CV, pero eso es una sugerencia:
// alguien puede tener diez anos en una tecnologia y querer buscar en otra.
export function buildConfirmationRequest(extraction = {}, { tenantId } = {}) {
  if (!tenantId) {
    const error = new Error('La confirmacion es por cliente y falta tenantId');
    error.code = 'MISSING_TENANT';
    throw error;
  }
  const professions = extraction.professions || [];
  if (!professions.length) {
    return {
      ok: false,
      status: 'nothing_to_confirm',
      reason: 'no se extrajo ninguna profesion del CV',
      // Sin profesiones no se propone nada: se pide otro CV o revision manual.
      next_action: 'revisar_cv_o_extraccion',
    };
  }

  return {
    ok: true,
    status: ESTADOS.PENDING,
    tenant_id: tenantId,
    extraction_method: extraction.method || null,
    // Se muestra con que confianza se extrajo cada una, para que el cliente sepa cual mirar.
    proposals: professions.map((item, index) => ({
      index,
      label: item.label,
      family_id: item.family_id || null,
      evidence: item.evidence || null,
      years: item.years ?? null,
      confidence: item.confidence || 'desconocida',
      suggested_priority: index + 1,
      // El cliente puede quitar cualquiera: el sistema no impone su lectura del CV.
      removable: true,
    })),
    instructions: 'Confirma, corrige o elimina cada profesion y ordenalas por prioridad.',
    requires_client_action: true,
  };
}

export function applyConfirmation(request, response = {}) {
  if (!request?.ok || request.status !== ESTADOS.PENDING) {
    return { ok: false, status: 'invalid_request', reason: 'no hay una propuesta pendiente de confirmar' };
  }

  const propuestas = new Map(request.proposals.map((item) => [item.label.toLowerCase(), item]));
  const confirmadas = [];
  const anadidas = [];

  for (const entry of response.confirmed || []) {
    const label = String(entry.label || entry).trim();
    if (!label) continue;
    const original = propuestas.get(label.toLowerCase());
    if (original) {
      confirmadas.push({ ...original, label, confirmed_by_client: true });
      propuestas.delete(label.toLowerCase());
    } else {
      // El cliente puede anadir una profesion que el CV no dejaba ver.
      anadidas.push({ label, family_id: entry.family_id || null, added_by_client: true, evidence: 'anadida por el cliente' });
    }
  }

  const descartadas = [...propuestas.values()].map((item) => item.label);

  if (!confirmadas.length && !anadidas.length) {
    return { ok: false, status: 'nothing_confirmed', reason: 'el cliente no confirmo ninguna profesion', rejected: descartadas };
  }

  return {
    ok: true,
    status: ESTADOS.NEEDS_RANKING,
    tenant_id: request.tenant_id,
    professions: [...confirmadas, ...anadidas],
    rejected: descartadas,
    added_by_client: anadidas.map((item) => item.label),
    confirmed_at: response.at || null,
  };
}

// --- priority-prompt ---------------------------------------------------------
export function applyRanking(confirmation, ranking = []) {
  if (!confirmation?.ok || confirmation.status !== ESTADOS.NEEDS_RANKING) {
    return { ok: false, status: 'invalid_state', reason: 'primero hay que confirmar el perfil' };
  }

  const disponibles = new Map(confirmation.professions.map((item) => [item.label.toLowerCase(), item]));
  const ordenadas = [];

  for (const label of ranking) {
    const key = String(label).toLowerCase();
    const found = disponibles.get(key);
    if (!found) {
      // Ordenar algo que no se confirmo indica que cliente y sistema no hablan de lo mismo.
      return { ok: false, status: 'unknown_profession', reason: `"${label}" no esta entre las profesiones confirmadas` };
    }
    ordenadas.push({ ...found, priority: ordenadas.length + 1 });
    disponibles.delete(key);
  }

  // Lo confirmado y no ordenado no se descarta: va al final, y se dice.
  const sinOrdenar = [...disponibles.values()].map((item, index) => ({ ...item, priority: ordenadas.length + index + 1, ranked_by_client: false }));

  return {
    ok: true,
    status: ESTADOS.READY,
    tenant_id: confirmation.tenant_id,
    ranked_families: [...ordenadas, ...sinOrdenar].map((item) => item.family_id).filter(Boolean),
    professions: [...ordenadas.map((item) => ({ ...item, ranked_by_client: true })), ...sinOrdenar],
    unranked_count: sinOrdenar.length,
    // Solo desde aqui puede arrancar la busqueda.
    search_enabled: true,
  };
}

// Guarda de arranque: ningun nodo de busqueda debe correr sin perfil confirmado y ordenado.
export function assertReadyToSearch(profile) {
  if (!profile?.ok || profile.status !== ESTADOS.READY) {
    return { ready: false, reason: 'el perfil no esta confirmado ni ordenado por el cliente' };
  }
  if (!profile.ranked_families?.length) {
    return { ready: false, reason: 'no hay ninguna familia del catalogo asociada al perfil confirmado' };
  }
  return { ready: true, ranked_families: profile.ranked_families };
}
