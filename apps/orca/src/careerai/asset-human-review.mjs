// Nodo asset-human-review (node-inventory.json: "Revision humana antes de tocar el
// formulario"). Es el gate entre generar los artefactos de postulacion
// (application-tailor.mjs: CV adaptado, carta, respuestas del formulario;
// cv-gap-analyzer.mjs: carencias) y tocar el formulario real
// (linkedin-easy-apply-node.mjs / ats-adapters.mjs). Sin este nodo, un CV/carta generado por
// el consejo de LLM podia llegar directo al navegador sin que nadie lo mirara primero.
//
// Dos motivos independientes para bloquear, igual que el resto de gates del proyecto: (1)
// falta algo por generar (la carta fallo, el CV no tiene resumen), o (2) nadie aprobo
// explicitamente ESTE paquete para ESTA oportunidad.
import { checkApproval, hashPayload } from './guards.mjs';

// Arma lo que un humano necesita ver de un vistazo para decidir: no solo "listo/no listo" por
// cada parte, tambien QUE le falta a lo que si esta listo (carencias del CV, si la carta usa
// tono generico, etc.) — decidir a ciegas entre "aprobar" y "rechazar" sin contexto no sirve.
export function buildReviewBundle({ opportunity, tailored, gapAnalysis = null, screeningAnswers = [] } = {}) {
  if (!opportunity?.opportunity_id) return { ok: false, reason: 'falta opportunity_id' };
  if (!tailored) return { ok: false, reason: 'falta el resultado de application-tailor (CV/carta adaptados)' };

  const missingParts = [];
  if (tailored.status !== 'draft_ready') missingParts.push('cv_adaptado');
  if (tailored.cover_letter_status && tailored.cover_letter_status !== 'draft_ready') missingParts.push('carta_de_presentacion');

  const unansweredRequired = (screeningAnswers || []).filter((item) => item.status === 'needs_human');
  if (unansweredRequired.length) missingParts.push('respuestas_del_formulario');

  const bundle = {
    opportunity_id: opportunity.opportunity_id,
    opportunity_title: opportunity.title || null,
    opportunity_company: opportunity.company || null,
    cv_summary: tailored.cv?.summary || null,
    cv_headline: tailored.cv?.headline || null,
    highlighted_skills: tailored.cv?.highlighted_skills || [],
    cover_letter: tailored.cover_letter || null,
    gaps: tailored.gaps || gapAnalysis?.missing || [],
    gap_coverage_percent: gapAnalysis?.coverage_percent ?? null,
    unsupported_claims_avoided: tailored.unsupported_claims_avoided || [],
    screening_answers: screeningAnswers,
    unanswered_required_count: unansweredRequired.length,
    missing_parts: missingParts,
    complete: missingParts.length === 0,
  };

  // Hash estable del contenido revisado: si algo cambia despues de que un humano lo aprobo, la
  // aprobacion deja de ser valida para el contenido nuevo (mismo mecanismo que checkApproval
  // ya usa via payload_hash).
  bundle.content_hash = hashPayload({
    cv_summary: bundle.cv_summary, cover_letter: bundle.cover_letter,
    screening_answers: bundle.screening_answers, gaps: bundle.gaps,
  });

  return { ok: true, bundle };
}

// El gate real: solo autoriza a seguir (cleared_to_fill) si el paquete esta completo Y hay una
// aprobacion vigente para esta oportunidad cuyo contenido coincide con el hash del bundle.
export function evaluateReviewGate({ bundle, approval, now = new Date() } = {}) {
  if (!bundle) return { ok: false, cleared_to_fill: false, reason: 'falta el paquete de revision' };

  const reasons = [];
  if (!bundle.complete) reasons.push(...bundle.missing_parts.map((part) => `falta_${part}`));

  const approvalCheck = checkApproval(approval, {
    opportunityId: bundle.opportunity_id,
    payload: { content_hash: bundle.content_hash },
    now,
  });
  // El payload que se le pasa a checkApproval para comparar el hash tiene que ser EXACTAMENTE
  // lo que el aprobador vio, asi que se compara el hash directo del bundle contra el que trae
  // la aprobacion (si trae uno) — mas explicito que depender solo de hashPayload interno.
  if (approval?.content_hash && approval.content_hash !== bundle.content_hash) {
    reasons.push('el_contenido_cambio_despues_de_aprobarse');
  }
  if (!approvalCheck.valid) reasons.push(...approvalCheck.reasons.map((r) => `aprobacion_${r}`));

  return {
    ok: true,
    cleared_to_fill: bundle.complete && approvalCheck.valid && !(approval?.content_hash && approval.content_hash !== bundle.content_hash),
    opportunity_id: bundle.opportunity_id,
    reasons,
    missing_parts: bundle.missing_parts,
  };
}
