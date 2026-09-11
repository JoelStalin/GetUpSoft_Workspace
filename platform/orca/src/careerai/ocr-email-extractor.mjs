// Extrae el email de contacto (y datos basicos de la vacante) del texto que devuelve el OCR
// de un post-imagen de LinkedIn (scripts/careerai_ocr.ps1, Windows.Media.Ocr nativo).
//
// Limitacion real, dicha claramente al usuario antes de escribir esto: Windows.Media.Ocr NO
// expone un puntaje de confianza por palabra (a diferencia de Tesseract). No se inventa un
// numero que no existe. En su lugar, esta es una heuristica honesta y documentada: valida
// forma de email + señales de contexto + patrones tipicos de error de OCR conocidos. Un email
// que no pasa la heuristica se marca explicitamente para revision manual y NUNCA se usa para
// redactar/enviar nada — un email mal leido se le manda a un desconocido.
import { sanitizeOcrPayload } from './bot-wall.mjs';

const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const CONTEXT_KEYWORDS = /correo|email|e-?mail|contacto|contactar|enviar\s*(cv|curr[ií]culum|resume)|rrhh|hr\b|reclutamiento|postular/i;

// Confusiones tipicas del OCR sobre texto de vacantes (fuentes de logos/banners, no texto
// plano): 'rn' leido donde iba 'm', '0'/'O' y '1'/'l'/'I' intercambiados, espacios metidos a
// mitad de un dominio. No se puede corregir con certeza — se usa como señal de baja confianza.
const OCR_SUSPECT_PATTERNS = [
  /\brn[a-z]*@/i,          // 'rn' al inicio del usuario suele ser 'm' mal leido
  /@[a-z]*[01][a-z]*\./i,  // digito 0/1 dentro de lo que deberia ser el nombre del dominio
  /\.(cotn|corn|net\.?$|orq)$/i, // 'com' mal leido como 'cotn'/'corn', 'org' como 'orq'
];

const COMMON_TLDS = new Set(['com', 'net', 'org', 'co', 'io', 'edu', 'gov', 'mx', 'do', 'es', 'ar', 'cl', 'pe', 'co.uk', 'com.mx', 'com.do']);

function domainLooksPlausible(email) {
  const domain = email.split('@')[1] || '';
  const tld = domain.split('.').slice(-2).join('.'); // intenta capturar TLDs compuestos como com.do
  const lastLabel = domain.split('.').pop();
  return COMMON_TLDS.has(tld) || COMMON_TLDS.has(lastLabel);
}

export function extractEmailsFromOcrText(rawOcrText, { contextWindow = 80 } = {}) {
  const text = sanitizeOcrPayload(rawOcrText || '');
  const matches = [...text.matchAll(EMAIL_PATTERN)];
  if (!matches.length) {
    return { ok: true, found: 0, candidates: [] };
  }

  const candidates = matches.map((match) => {
    const email = match[0];
    // El contexto es SOLO lo que rodea al email, sin incluirlo — si no, un email cuya parte
    // local dice literalmente "contacto@..." se auto-valida a si mismo como "cerca de texto
    // de contacto", lo cual no dice nada real sobre si el dato esta bien leido.
    const before = text.slice(Math.max(0, match.index - contextWindow), match.index);
    const after = text.slice(match.index + email.length, Math.min(text.length, match.index + email.length + contextWindow));
    const surrounding = `${before} ${after}`;

    const reasons = [];
    let confidence = 'medium';

    const suspect = OCR_SUSPECT_PATTERNS.some((pattern) => pattern.test(email));
    if (suspect) { reasons.push('patron tipico de error de OCR en el dominio/usuario'); confidence = 'low'; }

    const plausibleDomain = domainLooksPlausible(email);
    if (!plausibleDomain) { reasons.push('dominio con TLD poco comun, podria ser lectura erronea'); confidence = 'low'; }

    const hasContext = CONTEXT_KEYWORDS.test(surrounding);
    if (hasContext && confidence !== 'low') { confidence = 'high'; reasons.push('aparece junto a texto de contacto (correo/RRHH/enviar CV)'); }
    else if (!hasContext) { reasons.push('no hay texto de contacto cerca; podria ser un email de otro contexto (logo, firma generica)'); }

    return {
      email, confidence, reasons,
      // Regla explicita, no negociable: solo "high" se puede usar para redactar/enviar algo
      // sin que un humano lo mire primero. "medium" y "low" van a revision.
      usable_without_review: confidence === 'high',
      surrounding_text: surrounding.trim(),
    };
  });

  return { ok: true, found: candidates.length, candidates };
}

// Datos de la vacante en el texto: titulo/empresa no se pueden extraer con certeza de un OCR
// de banner sin un LLM (fuera de alcance aqui) — se devuelve el texto completo limpio para
// que quien redacte (humano o el nodo de application-tailor) lo use como contexto, en vez de
// inventar campos estructurados que no se pueden validar.
export function buildOcrJobContext(rawOcrText) {
  const text = sanitizeOcrPayload(rawOcrText || '').trim();
  const emails = extractEmailsFromOcrText(text);
  return {
    ok: true,
    raw_text: text,
    email_candidates: emails.candidates,
    best_email: emails.candidates.find((c) => c.usable_without_review) || null,
    requires_manual_review: !emails.candidates.some((c) => c.usable_without_review),
  };
}

// Redacta el correo en BORRADOR, nunca lo envia. Si el mejor email disponible no es "high"
// confidence, se niega a redactar dirigido a ese destinatario (aunque el texto del cuerpo
// este listo) — el usuario pidio explicitamente no usarlo a ciegas.
export function draftEmailFromOcrContext(ocrContext, { bodyText, subject } = {}) {
  if (!ocrContext?.ok) return { ok: false, reason: 'contexto OCR invalido' };
  if (!bodyText) return { ok: false, reason: 'falta el cuerpo del correo (redactado aparte, p. ej. por application-tailor.mjs)' };

  if (!ocrContext.best_email) {
    return {
      ok: true, status: 'blocked_needs_review', reason: 'ningun email extraido del OCR paso la heuristica de confianza sin revision',
      candidates: ocrContext.email_candidates, send_performed: false,
    };
  }

  return {
    ok: true, status: 'draft_ready',
    to: ocrContext.best_email.email,
    to_confidence: ocrContext.best_email.confidence,
    subject: subject || 'Postulacion',
    body: bodyText,
    other_candidates_discarded: ocrContext.email_candidates.filter((c) => c.email !== ocrContext.best_email.email),
    send_performed: false,
    approval_required: true,
  };
}
