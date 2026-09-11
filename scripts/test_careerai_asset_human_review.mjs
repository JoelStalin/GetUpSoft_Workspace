import { buildReviewBundle, evaluateReviewGate } from '../platform/orca/src/careerai/asset-human-review.mjs';
import { hashPayload } from '../platform/orca/src/careerai/guards.mjs';

const now = new Date('2026-09-07T12:00:00Z');
const opportunity = { opportunity_id: 'opp-1', title: 'AS400 RPGLE Developer', company: 'Stefanini LATAM' };

const tailoredCompleto = {
  status: 'draft_ready',
  cv: { summary: 'Desarrollador con 5 anos en AS400.', headline: 'Dev AS400', highlighted_skills: ['AS400', 'RPGLE'] },
  cover_letter: { subject: 'Postulacion', body: 'Estimados...' },
  cover_letter_status: 'draft_ready',
  gaps: ['SQL avanzado'],
  unsupported_claims_avoided: [],
};

// --- bundle completo: sin partes faltantes -------------------------------------------
const { bundle } = buildReviewBundle({ opportunity, tailored: tailoredCompleto, screeningAnswers: [] });
if (bundle.complete !== true) throw new Error('Con CV y carta listos, el bundle debe estar completo');
if (bundle.missing_parts.length !== 0) throw new Error('No debe haber partes faltantes');
if (bundle.gaps.join() !== 'SQL avanzado') throw new Error('Debe traer las carencias del CV en el bundle');

// --- bundle incompleto: carta fallo -----------------------------------------------
const { bundle: bundleSinCarta } = buildReviewBundle({
  opportunity, tailored: { ...tailoredCompleto, cover_letter_status: 'needs_retry' },
});
if (bundleSinCarta.complete !== false) throw new Error('Sin carta lista, el bundle no debe estar completo');
if (!bundleSinCarta.missing_parts.includes('carta_de_presentacion')) throw new Error('Debe listar la carta como parte faltante');

// --- bundle con respuestas del formulario sin resolver ------------------------------
const { bundle: bundleSinRespuestas } = buildReviewBundle({
  opportunity, tailored: tailoredCompleto,
  screeningAnswers: [{ question: 'Anos de experiencia con AS400', status: 'needs_human' }],
});
if (bundleSinRespuestas.complete !== false) throw new Error('Con una respuesta sin resolver, el bundle no debe estar completo');
if (bundleSinRespuestas.unanswered_required_count !== 1) throw new Error('Debe contar exactamente las respuestas sin resolver');

// --- gate: bundle completo + aprobacion vigente con el hash correcto -> cleared -----
const aprobacionValida = {
  approval_id: 'appr-1', opportunity_id: 'opp-1', status: 'approved',
  expires_at: '2026-09-08T00:00:00Z', content_hash: bundle.content_hash,
};
const cleared = evaluateReviewGate({ bundle, approval: aprobacionValida, now });
if (cleared.cleared_to_fill !== true) throw new Error(`Con bundle completo y aprobacion valida, debe quedar cleared_to_fill. Razones: ${JSON.stringify(cleared.reasons)}`);

// --- gate: bundle incompleto, aunque haya "aprobacion" no se libera -----------------
const noClearedIncompleto = evaluateReviewGate({ bundle: bundleSinCarta, approval: aprobacionValida, now });
if (noClearedIncompleto.cleared_to_fill !== false) throw new Error('Un bundle incompleto nunca debe liberarse, tenga aprobacion o no');
if (!noClearedIncompleto.reasons.includes('falta_carta_de_presentacion')) throw new Error('Debe explicar exactamente que falta');

// --- gate: bundle completo pero SIN aprobacion --------------------------------------
const sinAprobacion = evaluateReviewGate({ bundle, approval: null, now });
if (sinAprobacion.cleared_to_fill !== false) throw new Error('Sin aprobacion, un bundle completo tampoco debe liberarse');

// --- gate: aprobacion para OTRA oportunidad no sirve para esta ----------------------
const aprobacionCruzada = evaluateReviewGate({
  bundle, approval: { ...aprobacionValida, opportunity_id: 'opp-2' }, now,
});
if (aprobacionCruzada.cleared_to_fill !== false) throw new Error('Una aprobacion de otra oportunidad no debe liberar esta');

// --- gate: el contenido cambio DESPUES de aprobarse (hash no coincide) --------------
const aprobacionDesactualizada = { ...aprobacionValida, content_hash: hashPayload({ algo: 'distinto' }) };
const contenidoAlterado = evaluateReviewGate({ bundle, approval: aprobacionDesactualizada, now });
if (contenidoAlterado.cleared_to_fill !== false) throw new Error('Si el contenido cambio tras aprobarse, no debe liberarse con la aprobacion vieja');
if (!contenidoAlterado.reasons.includes('el_contenido_cambio_despues_de_aprobarse')) throw new Error('Debe explicar que el contenido cambio');

// --- gate: aprobacion vencida --------------------------------------------------------
const aprobacionVencida = { ...aprobacionValida, expires_at: '2026-01-01T00:00:00Z' };
const vencida = evaluateReviewGate({ bundle, approval: aprobacionVencida, now });
if (vencida.cleared_to_fill !== false) throw new Error('Una aprobacion vencida no debe liberar nada');

// --- sin opportunity_id o sin tailored: no se puede construir el bundle -------------
const sinOportunidad = buildReviewBundle({ tailored: tailoredCompleto });
if (sinOportunidad.ok !== false) throw new Error('Sin opportunity_id, no se puede armar el bundle');
const sinTailored = buildReviewBundle({ opportunity });
if (sinTailored.ok !== false) throw new Error('Sin resultado de application-tailor, no hay nada que revisar');

console.log(JSON.stringify({
  ok: true,
  node: 'asset-human-review',
  bundle_completo_requiere_cv_carta_y_respuestas: true,
  gate_exige_bundle_completo_y_aprobacion_vigente: true,
  contenido_alterado_tras_aprobar_invalida_la_aprobacion: true,
  aprobacion_es_por_oportunidad_especifica: true,
}));
