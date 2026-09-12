// Nodos cv-tailor, cover-letter-writer y screening-answers: para CADA oportunidad se
// prepara un CV adaptado, una carta y las respuestas del formulario.
// Dos reglas que gobiernan todo este modulo:
//   1. Nunca se inventa un hecho que el CV no respalde. Si falta, se marca para el humano.
//   2. Todo sale en borrador; el envio exige aprobacion explicita por oportunidad.
import crypto from 'node:crypto';
import { askRole, extractJson } from './llm-council.mjs';

export const DRAFT_ONLY = Object.freeze({ submit_performed: false, approval_required: true });

export function buildTailorPrompt({ cvText, opportunity }) {
  return [
    'Adapta este CV a la oferta concreta. No inventes experiencia, titulos, empresas ni fechas.',
    'Solo puedes reordenar, priorizar y reformular lo que YA aparece en el CV.',
    '',
    'Devuelve UNICAMENTE este JSON:',
    '{"headline":"","summary":"","highlighted_skills":[],"reordered_experience":[],',
    ' "keywords_matched":[],"gaps":[],"unsupported_claims_avoided":[]}',
    '',
    '- headline: titular profesional alineado a la oferta, respaldado por el CV.',
    '- summary: resumen de 3 a 5 lineas, en el idioma de la oferta.',
    '- highlighted_skills: competencias del CV que la oferta pide, en su orden de importancia.',
    '- reordered_experience: ids o titulos de puestos del CV, ordenados por relevancia.',
    '- keywords_matched: terminos de la oferta que el CV respalda de verdad.',
    '- gaps: lo que la oferta pide y el CV NO respalda. Se honesto: esto no se rellena.',
    '- unsupported_claims_avoided: afirmaciones que serian atractivas pero el CV no sostiene.',
    '',
    `--- OFERTA: ${opportunity.title || ''} en ${opportunity.company || ''} ---`,
    String(opportunity.description || '').slice(0, 6000),
    '',
    '--- CV ---',
    String(cvText).slice(0, 10000),
  ].join('\n');
}

export function buildCoverLetterPrompt({ cvText, opportunity, tailored }) {
  return [
    'Escribe una carta de presentacion para esta oferta concreta.',
    'No inventes hechos: apoyate solo en lo que el CV respalda.',
    'Menciona la empresa y el puesto por su nombre. Entre 150 y 250 palabras.',
    'Sin formulas vacias del tipo "soy el candidato ideal": di que hizo el candidato y donde.',
    '',
    'Devuelve UNICAMENTE este JSON: {"subject":"","body":"","tone":""}',
    '',
    `--- OFERTA: ${opportunity.title || ''} en ${opportunity.company || ''} ---`,
    String(opportunity.description || '').slice(0, 4000),
    '',
    `--- PUNTOS FUERTES DETECTADOS ---`,
    (tailored?.highlighted_skills || []).join(', '),
    '',
    '--- CV ---',
    String(cvText).slice(0, 8000),
  ].join('\n');
}

function fingerprint(...parts) {
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 24);
}

function requireInputs(cvText, opportunity) {
  if (!cvText || cvText.length < 200) {
    const error = new Error('CV insuficiente para adaptar');
    error.code = 'CV_TEXT_TOO_SHORT';
    throw error;
  }
  if (!opportunity?.opportunity_id) {
    const error = new Error('La adaptacion es por oportunidad y falta opportunity_id');
    error.code = 'MISSING_OPPORTUNITY_ID';
    throw error;
  }
}

export async function tailorApplication({ cvText, opportunity, cvSha256 = null, askFn = askRole } = {}) {
  requireInputs(cvText, opportunity);

  const cvResponse = await askFn('heavy_lifting', buildTailorPrompt({ cvText, opportunity }));
  const tailored = cvResponse?.ok ? extractJson(cvResponse.answers?.[0]?.text) : null;

  if (!tailored?.summary) {
    // Sin adaptacion no se postula con el CV generico: se escala. Enviar un CV sin adaptar
    // a un ATS que filtra por palabras clave es gastar la oportunidad.
    return {
      ok: false,
      status: 'needs_human',
      opportunity_id: opportunity.opportunity_id,
      reason: cvResponse?.ok ? 'el consejo no devolvio una adaptacion utilizable' : 'ningun proveedor respondio',
      council_failures: cvResponse?.failed || [],
      ...DRAFT_ONLY,
    };
  }

  const letterResponse = await askFn('heavy_lifting', buildCoverLetterPrompt({ cvText, opportunity, tailored }));
  const letter = letterResponse?.ok ? extractJson(letterResponse.answers?.[0]?.text) : null;

  const gaps = Array.isArray(tailored.gaps) ? tailored.gaps : [];

  return {
    ok: true,
    status: 'draft_ready',
    opportunity_id: opportunity.opportunity_id,
    // Cada artefacto es derivado y trazable al CV original por hash: el original nunca se toca.
    derived_from_cv: cvSha256,
    asset_id: fingerprint(opportunity.opportunity_id, cvSha256 || '', tailored.summary),
    cv: {
      headline: String(tailored.headline || '').slice(0, 160),
      summary: String(tailored.summary).slice(0, 1200),
      highlighted_skills: (tailored.highlighted_skills || []).slice(0, 20),
      reordered_experience: (tailored.reordered_experience || []).slice(0, 20),
      keywords_matched: (tailored.keywords_matched || []).slice(0, 30),
    },
    cover_letter: letter?.body
      ? { subject: String(letter.subject || '').slice(0, 160), body: String(letter.body).slice(0, 4000), tone: letter.tone || null }
      : null,
    cover_letter_status: letter?.body ? 'draft_ready' : 'needs_retry',
    // Las carencias se muestran al cliente en vez de disimularse: son su decision.
    gaps,
    honest_about_gaps: gaps.length > 0,
    unsupported_claims_avoided: (tailored.unsupported_claims_avoided || []).slice(0, 10),
    requires_human_review: true,
    ...DRAFT_ONLY,
  };
}

// Respuestas del formulario del ATS. Una pregunta factual sin respaldo en el perfil NUNCA
// se contesta: se marca para que la conteste el cliente.
export function answerScreeningQuestions(questions = [], profile = {}) {
  const answers = questions.map((question) => {
    const key = String(question.field || question.label || '').toLowerCase();
    const known = Object.entries(profile).find(([field]) => key.includes(field.toLowerCase()));
    if (!known || known[1] === null || known[1] === undefined || known[1] === '') {
      return {
        question: question.label || question.field,
        answer: null,
        status: 'human_review_required',
        reason: 'el dato no esta en el perfil confirmado por el cliente',
      };
    }
    return { question: question.label || question.field, answer: known[1], status: 'answered', source: 'perfil_confirmado' };
  });

  return {
    ok: true,
    total: answers.length,
    answered: answers.filter((item) => item.status === 'answered').length,
    pending_human: answers.filter((item) => item.status === 'human_review_required').length,
    answers,
    ...DRAFT_ONLY,
  };
}
