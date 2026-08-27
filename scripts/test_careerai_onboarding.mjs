import { buildConfirmationRequest, applyConfirmation, applyRanking, assertReadyToSearch, ESTADOS } from '../apps/orca/src/careerai/onboarding.mjs';

// Extraccion de un CV cualquiera: el modulo no sabe de tecnologia ni de oficios concretos.
const extraccion = {
  method: 'llm_council',
  professions: [
    { label: 'Coordinadora de Enfermeria', family_id: 'enfermeria', evidence: 'Coordinacion de equipos', years: 12, confidence: 'media' },
    { label: 'Formadora Clinica', family_id: 'formacion', evidence: 'Supervision de personal en formacion', years: 5, confidence: 'media' },
    { label: 'Auxiliar Administrativa', family_id: null, evidence: 'Tareas administrativas', years: 2, confidence: 'baja' },
  ],
};

// --- propuesta ---------------------------------------------------------------
const propuesta = buildConfirmationRequest(extraccion, { tenantId: 't1' });
if (propuesta.status !== ESTADOS.PENDING) throw new Error('Debe quedar pendiente de confirmar');
if (propuesta.proposals.length !== 3) throw new Error('Debe proponer las tres');
if (propuesta.proposals[0].suggested_priority !== 1) throw new Error('El orden del CV es solo una sugerencia');
if (!propuesta.proposals.every((item) => item.removable)) throw new Error('El cliente puede quitar cualquiera');
if (propuesta.requires_client_action !== true) throw new Error('Nada arranca sin accion del cliente');

let code = null;
try { buildConfirmationRequest(extraccion, {}); } catch (error) { code = error.code; }
if (code !== 'MISSING_TENANT') throw new Error('Sin cliente no hay confirmacion');

const vacia = buildConfirmationRequest({ professions: [] }, { tenantId: 't1' });
if (vacia.ok !== false || vacia.status !== 'nothing_to_confirm') throw new Error('Sin profesiones no se propone nada');

// --- confirmacion: el cliente quita una y anade otra --------------------------
const confirmacion = applyConfirmation(propuesta, {
  confirmed: [
    { label: 'Coordinadora de Enfermeria' },
    { label: 'Formadora Clinica' },
    { label: 'Gestion de Calidad Asistencial', family_id: 'calidad' },
  ],
});
if (confirmacion.status !== ESTADOS.NEEDS_RANKING) throw new Error('Tras confirmar toca ordenar');
if (confirmacion.professions.length !== 3) throw new Error('Dos confirmadas mas una anadida');
if (!confirmacion.rejected.includes('Auxiliar Administrativa')) throw new Error('Lo que el cliente no confirmo se descarta y se dice cual');
if (!confirmacion.added_by_client.includes('Gestion de Calidad Asistencial')) {
  throw new Error('El cliente puede anadir una profesion que el CV no dejaba ver');
}

const nadaConfirmado = applyConfirmation(propuesta, { confirmed: [] });
if (nadaConfirmado.ok !== false) throw new Error('Si no confirma nada, no se sigue');
if (!nadaConfirmado.rejected.length) throw new Error('Debe decir que se descarto');

// --- ranking ------------------------------------------------------------------
const ordenado = applyRanking(confirmacion, ['Formadora Clinica', 'Coordinadora de Enfermeria']);
if (ordenado.status !== ESTADOS.READY) throw new Error('Con el orden puesto ya se puede buscar');
if (ordenado.professions[0].label !== 'Formadora Clinica') throw new Error('Manda el orden del cliente, no el del CV');
if (ordenado.professions[0].priority !== 1) throw new Error('La prioridad es la posicion elegida');
if (ordenado.professions[0].ranked_by_client !== true) throw new Error('Debe marcarse quien la ordeno');

// Lo confirmado y no ordenado no se pierde: va al final y se cuenta.
if (ordenado.unranked_count !== 1) throw new Error('Debe contar lo que el cliente no ordeno');
const ultima = ordenado.professions[ordenado.professions.length - 1];
if (ultima.label !== 'Gestion de Calidad Asistencial' || ultima.ranked_by_client !== false) {
  throw new Error('Lo no ordenado va al final marcado como tal');
}
if (ordenado.ranked_families[0] !== 'formacion') throw new Error('Las familias salen en el orden del cliente');

// Ordenar algo no confirmado indica que cliente y sistema no hablan de lo mismo.
const desconocida = applyRanking(confirmacion, ['Profesion Inexistente']);
if (desconocida.ok !== false || desconocida.status !== 'unknown_profession') {
  throw new Error('Ordenar algo no confirmado debe fallar explicitamente');
}

// No se puede saltar la confirmacion.
const saltandoPasos = applyRanking(propuesta, ['Coordinadora de Enfermeria']);
if (saltandoPasos.ok !== false) throw new Error('Primero se confirma, despues se ordena');

// --- guarda de arranque -------------------------------------------------------
const listo = assertReadyToSearch(ordenado);
if (!listo.ready) throw new Error('Un perfil confirmado y ordenado si puede buscar');
if (listo.ranked_families.length !== 3) throw new Error('Debe pasar las familias al buscador');

if (assertReadyToSearch(confirmacion).ready !== false) throw new Error('Sin ordenar no se busca');
if (assertReadyToSearch(null).ready !== false) throw new Error('Sin perfil no se busca');

// Un perfil confirmado pero sin ninguna familia del catalogo no puede generar busquedas.
const sinFamilias = { ok: true, status: ESTADOS.READY, ranked_families: [] };
if (assertReadyToSearch(sinFamilias).ready !== false) throw new Error('Sin familias no hay nada que buscar');

console.log(JSON.stringify({
  ok: true,
  nodes: ['profile-confirmation', 'priority-prompt'],
  flujo: ['propuesta', 'confirmacion', 'ranking', 'listo_para_buscar'],
  cliente_puede: ['quitar', 'anadir', 'reordenar'],
  probado_con: 'perfil de enfermeria (ninguna tecnologia cableada)',
}));
