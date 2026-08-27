import { tailorApplication, answerScreeningQuestions, buildTailorPrompt, buildCoverLetterPrompt } from '../apps/orca/src/careerai/application-tailor.mjs';

const cv = [
  'Perfil profesional con ocho anos coordinando equipos de soporte tecnico en entornos hospitalarios.',
  'Responsable de la gestion de incidencias, del inventario de equipamiento y de la formacion del personal.',
  'Experiencia documentando procedimientos operativos y auditando su cumplimiento trimestral.',
  'Idiomas: espanol nativo, ingles profesional.',
].join(' ');

const oferta = {
  opportunity_id: 'opp-001',
  title: 'Coordinador de Soporte Tecnico',
  company: 'Clinica Norte',
  description: 'Buscamos coordinador con experiencia en gestion de incidencias y formacion de equipos. Se valora certificacion ITIL.',
};

// Un consejo que responde con una adaptacion honesta, incluyendo lo que falta.
const consejoBueno = async (role, prompt) => {
  const esCarta = prompt.includes('carta de presentacion');
  return {
    ok: true, provider: 'stub', answered: ['stub'], failed: [], status: 'answered',
    answers: [{ provider: 'stub', text: JSON.stringify(esCarta
      ? { subject: 'Coordinador de Soporte Tecnico - Clinica Norte', body: 'Durante ocho anos coordine equipos de soporte en entornos hospitalarios...', tone: 'profesional' }
      : {
          headline: 'Coordinador de Soporte Tecnico',
          summary: 'Ocho anos coordinando equipos de soporte en entornos hospitalarios, con foco en gestion de incidencias.',
          highlighted_skills: ['gestion de incidencias', 'formacion de equipos'],
          reordered_experience: ['Coordinador de soporte'],
          keywords_matched: ['gestion de incidencias', 'formacion'],
          gaps: ['certificacion ITIL'],
          unsupported_claims_avoided: ['experiencia en ITIL'],
        }) }],
  };
};

const resultado = await tailorApplication({ cvText: cv, opportunity: oferta, cvSha256: 'abc123', askFn: consejoBueno });
if (resultado.status !== 'draft_ready') throw new Error('Con el consejo respondiendo debe quedar borrador listo');
if (resultado.submit_performed !== false) throw new Error('El artefacto nunca se envia solo');
if (resultado.approval_required !== true) throw new Error('Siempre exige aprobacion');
if (resultado.requires_human_review !== true) throw new Error('Siempre exige revision humana');
if (!resultado.cover_letter?.body) throw new Error('Debe generar la carta de la oportunidad');
if (!resultado.cover_letter.subject.includes('Clinica Norte')) throw new Error('La carta debe nombrar a la empresa');

// La honestidad sobre lo que falta es parte del contrato, no un extra.
if (!resultado.gaps.includes('certificacion ITIL')) throw new Error('Debe reportar lo que la oferta pide y el CV no respalda');
if (resultado.honest_about_gaps !== true) throw new Error('Debe declarar que hay carencias');
if (!resultado.unsupported_claims_avoided.length) throw new Error('Debe registrar las afirmaciones que evito');

// Cada oportunidad produce un artefacto distinto y trazable al CV original.
const otra = await tailorApplication({ cvText: cv, opportunity: { ...oferta, opportunity_id: 'opp-002' }, cvSha256: 'abc123', askFn: consejoBueno });
if (otra.asset_id === resultado.asset_id) throw new Error('Cada oportunidad debe producir su propio artefacto');
if (otra.derived_from_cv !== 'abc123') throw new Error('El artefacto debe apuntar al CV original por hash');

// Sin consejo no se postula con el CV generico: se escala.
const sinConsejo = await tailorApplication({
  cvText: cv, opportunity: oferta,
  askFn: async () => ({ ok: false, failed: [{ provider: 'stub', error: 'HTTP 503' }] }),
});
if (sinConsejo.status !== 'needs_human') throw new Error('Sin adaptacion debe escalar');
if (sinConsejo.submit_performed !== false) throw new Error('Ni escalando se envia nada');

// Falta el id de la oportunidad: error explicito, porque la adaptacion es POR oportunidad.
let code = null;
try { await tailorApplication({ cvText: cv, opportunity: { title: 'X' }, askFn: consejoBueno }); }
catch (error) { code = error.code; }
if (code !== 'MISSING_OPPORTUNITY_ID') throw new Error('Sin opportunity_id debe fallar explicitamente');

// --- respuestas del formulario ----------------------------------------------
const preguntas = [
  { field: 'years_experience', label: 'Anos de experiencia' },
  { field: 'work_authorization', label: 'Autorizacion de trabajo' },
  { field: 'salary_expectation', label: 'Expectativa salarial' },
];
const perfil = { years_experience: 8 };
const respuestas = answerScreeningQuestions(preguntas, perfil);
if (respuestas.answered !== 1) throw new Error('Solo debe contestar lo que el perfil respalda');
if (respuestas.pending_human !== 2) throw new Error('Lo no respaldado queda para el cliente');
const autorizacion = respuestas.answers.find((item) => /Autorizacion/.test(item.question));
if (autorizacion.answer !== null) throw new Error('Nunca debe inventar un dato factual como la autorizacion de trabajo');
if (autorizacion.status !== 'human_review_required') throw new Error('Debe marcarlo para revision del cliente');

// Los prompts prohiben inventar, explicitamente.
if (!buildTailorPrompt({ cvText: cv, opportunity: oferta }).includes('No inventes experiencia')) {
  throw new Error('El prompt de CV debe prohibir inventar experiencia');
}
if (!buildCoverLetterPrompt({ cvText: cv, opportunity: oferta, tailored: {} }).includes('No inventes hechos')) {
  throw new Error('El prompt de carta debe prohibir inventar hechos');
}

console.log(JSON.stringify({
  ok: true,
  nodes: ['cv-tailor', 'cover-letter-writer', 'screening-answers'],
  artefacto_por_oportunidad: true,
  carencias_reportadas: resultado.gaps,
  datos_factuales_sin_inventar: respuestas.pending_human,
  submit_performed: false,
}));
