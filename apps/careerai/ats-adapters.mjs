// Nodo ats-router y adaptadores por ATS. La capa de mapeo es pura a proposito: recibe la
// descripcion de los campos del formulario y devuelve un PLAN de llenado, sin tocar el
// navegador. Asi se puede probar sin abrir Chrome y sin postular a nada.
//
// Regla que gobierna todo el modulo: un campo que no se sabe rellenar con certeza NO se
// rellena. Se marca para el humano. Un formulario enviado con un dato inventado no se
// puede deshacer.

const ATS_DOMAINS = {
  greenhouse: [/(^|\.)greenhouse\.io$/i, /(^|\.)boards\.greenhouse\.io$/i],
  lever: [/(^|\.)lever\.co$/i, /(^|\.)jobs\.lever\.co$/i],
  workday: [/(^|\.)myworkdayjobs\.com$/i, /(^|\.)workday\.com$/i],
  taleo: [/(^|\.)taleo\.net$/i],
  icims: [/(^|\.)icims\.com$/i],
  smartrecruiters: [/(^|\.)smartrecruiters\.com$/i],
  ashby: [/(^|\.)ashbyhq\.com$/i],
};

// Solo los adaptadores realmente implementados. Declarar soporte que no existe haria que el
// router enviara el formulario a un adaptador vacio.
const IMPLEMENTED = new Set(['greenhouse', 'lever']);

export function routeAts(applyUrl) {
  let host;
  try {
    host = new URL(String(applyUrl)).host.toLowerCase().replace(/^www\./, '');
  } catch {
    return { ok: false, ats: null, status: 'invalid_url', pause: true, reason: 'la URL de postulacion no es valida' };
  }

  const match = Object.entries(ATS_DOMAINS).find(([, patterns]) => patterns.some((pattern) => pattern.test(host)));
  if (!match) {
    // La politica exige pausar en dominio desconocido: no se improvisa un adaptador.
    return { ok: true, ats: 'desconocido', host, status: 'unknown_domain', pause: true, adapter_available: false,
      reason: 'dominio no reconocido; requiere revision humana antes de rellenar' };
  }

  const [ats] = match;
  return {
    ok: true, ats, host,
    status: IMPLEMENTED.has(ats) ? 'ready' : 'adapter_missing',
    adapter_available: IMPLEMENTED.has(ats),
    pause: !IMPLEMENTED.has(ats),
    reason: IMPLEMENTED.has(ats) ? null : `ATS reconocido (${ats}) pero su adaptador aun no existe`,
  };
}

// Mapeo de campos por significado, no por nombre exacto: cada ATS los nombra a su manera.
const FIELD_MAP = [
  { key: 'first_name', patterns: [/first[_\s-]?name/i, /nombre/i, /given[_\s-]?name/i] },
  { key: 'last_name', patterns: [/last[_\s-]?name/i, /apellido/i, /family[_\s-]?name/i, /surname/i] },
  { key: 'full_name', patterns: [/full[_\s-]?name/i, /^name$/i, /nombre completo/i] },
  { key: 'email', patterns: [/e-?mail/i, /correo/i] },
  { key: 'phone', patterns: [/phone/i, /tel[eé]fono/i, /mobile/i] },
  { key: 'linkedin', patterns: [/linkedin/i] },
  { key: 'website', patterns: [/website/i, /portfolio/i, /sitio web/i] },
  { key: 'github', patterns: [/github/i] },
  { key: 'location', patterns: [/location/i, /city/i, /ciudad/i, /ubicaci[oó]n/i] },
  { key: 'resume', patterns: [/resume/i, /r[eé]sum[eé]/i, /\bcv\b/i, /curr[ií]culum/i], asset: 'cv' },
  { key: 'cover_letter', patterns: [/cover[_\s-]?letter/i, /carta/i, /motivation/i], asset: 'cover_letter' },
];

// Campos que NUNCA se rellenan automaticamente aunque haya dato: son declaraciones legales
// o decisiones del candidato, y equivocarse tiene consecuencias reales.
const NEVER_AUTOFILL = [
  { patterns: [/work[_\s-]?authoriz/i, /autorizaci[oó]n de trabajo/i, /right to work/i], reason: 'declaracion legal' },
  { patterns: [/sponsor/i, /visa/i], reason: 'declaracion legal' },
  { patterns: [/salary/i, /compensation/i, /expectativa salarial/i], reason: 'decision del candidato' },
  { patterns: [/veteran/i, /disability/i, /discapacidad/i, /gender/i, /g[eé]nero/i, /race/i, /etnia/i, /ethnicity/i], reason: 'dato sensible protegido' },
  { patterns: [/start[_\s-]?date/i, /fecha de inicio/i, /notice period/i], reason: 'decision del candidato' },
  { patterns: [/criminal/i, /background check/i], reason: 'declaracion legal' },
];

function classifyField(field) {
  const haystack = `${field.name || ''} ${field.label || ''} ${field.id || ''}`;

  const blocked = NEVER_AUTOFILL.find((item) => item.patterns.some((pattern) => pattern.test(haystack)));
  if (blocked) return { key: null, blocked: true, reason: blocked.reason };

  const known = FIELD_MAP.find((item) => item.patterns.some((pattern) => pattern.test(haystack)));
  return known ? { key: known.key, asset: known.asset || null, blocked: false } : { key: null, blocked: false };
}

export function buildFillPlan(fields = [], { profile = {}, assets = {} } = {}) {
  const plan = [];
  const pendientes = [];

  for (const field of fields) {
    const classified = classifyField(field);
    const etiqueta = field.label || field.name || field.id || '(sin nombre)';

    if (classified.blocked) {
      pendientes.push({ field: etiqueta, status: 'human_review_required', reason: classified.reason });
      continue;
    }
    if (!classified.key) {
      pendientes.push({ field: etiqueta, status: 'human_review_required', reason: 'campo no reconocido' });
      continue;
    }
    if (classified.asset) {
      const asset = assets[classified.asset];
      if (!asset) {
        pendientes.push({ field: etiqueta, status: 'human_review_required', reason: `falta el artefacto ${classified.asset}` });
        continue;
      }
      plan.push({ field: etiqueta, selector: field.selector || null, action: 'upload', asset: classified.asset, value: asset });
      continue;
    }

    const value = profile[classified.key];
    if (value === undefined || value === null || value === '') {
      pendientes.push({ field: etiqueta, status: 'human_review_required', reason: 'el dato no esta en el perfil confirmado' });
      continue;
    }
    plan.push({ field: etiqueta, selector: field.selector || null, action: field.type === 'file' ? 'upload' : 'fill', key: classified.key, value });
  }

  const requeridosSinResolver = fields.filter((field) => field.required)
    .map((field) => field.label || field.name || field.id)
    .filter((etiqueta) => pendientes.some((item) => item.field === etiqueta));

  return {
    ok: true,
    total_fields: fields.length,
    fillable: plan.length,
    pending_human: pendientes.length,
    // Si un campo obligatorio no se puede resolver, el formulario no se puede enviar solo.
    can_submit_without_human: requeridosSinResolver.length === 0,
    blocking_required_fields: requeridosSinResolver,
    plan,
    pending: pendientes,
    submit_performed: false,
    approval_required: true,
  };
}

export const ADAPTERS = {
  greenhouse: {
    ats: 'greenhouse',
    layout: 'single_page',
    // Selectores base de Greenhouse; el plan real se arma con los campos que se lean del DOM.
    field_hints: { first_name: '#first_name', last_name: '#last_name', email: '#email', phone: '#phone', resume: 'input[type=file]' },
    submit_selector: 'input[type=submit], button[type=submit]',
    supports_file_upload: true,
  },
  lever: {
    ats: 'lever',
    layout: 'single_page',
    field_hints: { full_name: 'input[name=name]', email: 'input[name=email]', phone: 'input[name=phone]', resume: 'input[name=resume]' },
    submit_selector: 'button[type=submit]',
    supports_file_upload: true,
  },
};

export function getAdapter(ats) {
  return ADAPTERS[ats] || null;
}
