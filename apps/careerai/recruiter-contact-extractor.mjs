// Nodo recruiter-contact-extractor: extrae el email de contacto directo de la descripcion en
// TEXTO PLANO de una oferta (no de una imagen/OCR — eso lo cubre ocr-email-extractor.mjs). Sin
// los tipicos errores de lectura de OCR, la heuristica es mas simple, pero igual se niega a
// asumir que el primer email que aparece es el de contacto real (podria ser el pie de un
// aviso legal, un ejemplo, o el dominio de la empresa sin relacion con reclutamiento).
const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const CONTEXT_KEYWORDS = /correo|email|e-?mail|contacto|contactar|enviar\s*(cv|curr[ií]culum|resume)|rrhh|hr\b|reclutamiento|postular|apply/i;
const GENERIC_LOCAL_PARTS = /^(no-?reply|noreply|info|support|soporte|legal|privacy|admin|webmaster)$/i;

export function extractRecruiterContact(descriptionText, { contextWindow = 100 } = {}) {
  const text = String(descriptionText || '');
  const matches = [...text.matchAll(EMAIL_PATTERN)];
  if (!matches.length) return { ok: true, found: 0, candidates: [], best: null };

  const candidates = matches.map((match) => {
    const email = match[0];
    const localPart = email.split('@')[0];
    const before = text.slice(Math.max(0, match.index - contextWindow), match.index);
    const after = text.slice(match.index + email.length, Math.min(text.length, match.index + email.length + contextWindow));
    const hasContext = CONTEXT_KEYWORDS.test(`${before} ${after}`);
    const isGeneric = GENERIC_LOCAL_PARTS.test(localPart);

    let confidence = 'low';
    if (hasContext && !isGeneric) confidence = 'high';
    else if (hasContext || !isGeneric) confidence = 'medium';

    return {
      email, confidence,
      generic_mailbox: isGeneric,
      near_contact_keyword: hasContext,
      usable_without_review: confidence === 'high',
    };
  });

  const best = candidates.find((c) => c.usable_without_review)
    || candidates.find((c) => c.confidence === 'medium')
    || null;

  return { ok: true, found: candidates.length, candidates, best };
}
