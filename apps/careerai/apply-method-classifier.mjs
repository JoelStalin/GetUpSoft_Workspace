// Nodo apply-method-classifier: cada vez que el buscador encuentra una posicion NUEVA,
// dispara aqui. Este nodo decide por que via se postula, y esa decision determina toda la
// ruta posterior del workflow.
//
//   easy_apply     -> boton de postulacion en la propia plataforma
//   email_apply    -> enviar correo adjuntando CV y carta
//   external_form  -> formulario externo: exige webscraping + antibot antes de rellenar
//   unsupported    -> no se puede completar; entra al reporte que se envia al cliente

export const APPLY_METHODS = Object.freeze({
  EASY: 'easy_apply',
  EMAIL: 'email_apply',
  EXTERNAL_FORM: 'external_form',
  UNSUPPORTED: 'unsupported',
});

const EASY_APPLY_SIGNALS = [
  /\beasy apply\b/i,
  /\bsolicitud sencilla\b/i,
  /\bquick apply\b/i,
  /\bapply with (indeed|linkedin)\b/i,
  /\b1[- ]click apply\b/i,
  /\bpostulaci[oó]n r[aá]pida\b/i,
];

const EMAIL_APPLY_SIGNALS = [
  /send (?:your )?(?:cv|resume|r[eé]sum[eé])/i,
  /env[ií]e?\s+(?:su|tu)\s+(?:cv|curr[ií]culum|hoja de vida)/i,
  /apply by e-?mail/i,
  /postular por correo/i,
  /forward your (?:cv|resume)/i,
];

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

// ATS conocidos: siempre formulario externo, y cada uno necesita su adaptador.
const KNOWN_ATS = {
  'myworkdayjobs.com': 'workday',
  'workday.com': 'workday',
  'greenhouse.io': 'greenhouse',
  'lever.co': 'lever',
  'taleo.net': 'taleo',
  'icims.com': 'icims',
  'smartrecruiters.com': 'smartrecruiters',
  'ashbyhq.com': 'ashby',
  'bamboohr.com': 'bamboohr',
  'jobvite.com': 'jobvite',
};

// Barreras que impiden completar la postulacion sin intervencion humana o sin cuenta previa.
const BLOCKERS = [
  { pattern: /create an account to apply|debe registrarse para postular/i, blocker: 'account_required' },
  { pattern: /apply (?:only )?(?:in person|by phone)|presentarse en persona/i, blocker: 'offline_only' },
  { pattern: /security clearance required|se requiere autorizaci[oó]n de seguridad/i, blocker: 'clearance_required' },
];

function hostOf(url) {
  try {
    return new URL(String(url)).host.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

function detectAts(url) {
  const host = hostOf(url);
  if (!host) return null;
  const match = Object.keys(KNOWN_ATS).find((domain) => host === domain || host.endsWith(`.${domain}`));
  return match ? { ats: KNOWN_ATS[match], host } : null;
}

export function classifyApplyMethod(opportunity = {}, { platformHosts = [] } = {}) {
  const text = `${opportunity.title || ''} ${opportunity.description || ''} ${opportunity.apply_label || ''}`;
  const applyUrl = opportunity.apply_url || opportunity.canonical_url || null;
  const sourceHost = hostOf(opportunity.canonical_url);
  const applyHost = hostOf(applyUrl);

  const blocker = BLOCKERS.find((item) => item.pattern.test(text));
  if (blocker) {
    return {
      method: APPLY_METHODS.UNSUPPORTED,
      reason: blocker.blocker,
      // Lo que no se puede completar no se descarta en silencio: va al reporte del cliente.
      report_to_client: true,
      requires: [],
    };
  }

  // 1. Boton nativo de la plataforma: la via mas barata y la que menos se rompe.
  const isSamePlatform = !applyHost || applyHost === sourceHost || platformHosts.includes(applyHost);
  if (isSamePlatform && EASY_APPLY_SIGNALS.some((pattern) => pattern.test(text))) {
    return {
      method: APPLY_METHODS.EASY,
      reason: 'boton de postulacion en la propia plataforma',
      platform: sourceHost,
      requires: ['session'],
      report_to_client: false,
    };
  }

  // 2. Correo: solo si hay una direccion real a la que enviar.
  const email = (text.match(EMAIL_RE) || [])[0] || null;
  if (email && EMAIL_APPLY_SIGNALS.some((pattern) => pattern.test(text))) {
    return {
      method: APPLY_METHODS.EMAIL,
      reason: 'la oferta pide enviar CV por correo',
      recipient: email,
      // El envio real exige aprobacion: un correo enviado no se puede retirar.
      requires: ['cv_tailored', 'cover_letter', 'approval'],
      report_to_client: false,
    };
  }

  // 3. Formulario externo: necesita navegador, deteccion de antibot y adaptador del ATS.
  const ats = detectAts(applyUrl);
  if (ats || (applyHost && applyHost !== sourceHost)) {
    return {
      method: APPLY_METHODS.EXTERNAL_FORM,
      reason: ats ? `formulario en ATS externo (${ats.ats})` : 'la postulacion sale a un dominio externo',
      ats: ats?.ats || 'desconocido',
      host: applyHost,
      requires: ['webscraping', 'antibot', 'session', 'cv_tailored', 'approval'],
      // Un dominio no reconocido se pausa: la politica ya exige gate en unknown_domain.
      pause_on_unknown_domain: !ats,
      report_to_client: false,
    };
  }

  // Sin senal suficiente no se adivina: se trata como no soportada y el cliente lo sabe.
  return {
    method: APPLY_METHODS.UNSUPPORTED,
    reason: 'no se pudo determinar la via de postulacion',
    report_to_client: true,
    requires: [],
  };
}

// Disparador: solo las posiciones NUEVAS entran al analizador. Repetir el analisis de una
// oportunidad ya vista gasta tokens y cuota del cliente sin aportar nada.
export function triggerAnalysis(opportunities = [], seenIds = new Set(), options = {}) {
  const nuevas = opportunities.filter((item) => item.opportunity_id && !seenIds.has(item.opportunity_id));
  const analizadas = nuevas.map((opportunity) => ({
    opportunity_id: opportunity.opportunity_id,
    title: opportunity.title || null,
    company: opportunity.company || null,
    classification: classifyApplyMethod(opportunity, options),
  }));

  const porMetodo = analizadas.reduce((acc, item) => {
    acc[item.classification.method] = (acc[item.classification.method] || 0) + 1;
    return acc;
  }, {});

  return {
    ok: true,
    received: opportunities.length,
    new_positions: nuevas.length,
    skipped_already_seen: opportunities.length - nuevas.length,
    by_method: porMetodo,
    // Lo que no se puede completar se agrupa para el reporte periodico al cliente.
    for_client_report: analizadas.filter((item) => item.classification.report_to_client),
    analyzed: analizadas,
  };
}
