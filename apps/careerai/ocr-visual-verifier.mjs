// Nodo ocr-visual-verifier: antes de que el automatizador confie en un texto leido del DOM
// (p. ej. "Aplicacion enviada", el nombre de un boton, un mensaje de error), lo cruza contra
// lo que el OCR nativo de Windows (Windows.Media.Ocr, mismo motor que ocr-email-extractor.mjs)
// realmente leyo de los pixeles renderizados. Un elemento puede existir en el DOM y no ser
// visible de verdad (oculto, tapado, fuera de pantalla, texto inyectado sin renderizar) — este
// nodo se niega a confirmar algo que el DOM dice pero el OCR no confirma.
function normalize(text) {
  return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

export function verifyVisibleText({ domText, ocrText, expectedPhrase } = {}) {
  if (!expectedPhrase) return { ok: false, reason: 'falta expectedPhrase: no hay nada que verificar' };
  const expected = normalize(expectedPhrase);
  const domSaysIt = normalize(domText).includes(expected);
  const ocrConfirmsIt = normalize(ocrText).includes(expected);

  if (domSaysIt && ocrConfirmsIt) {
    return { ok: true, verified: true, status: 'visually_confirmed', reason: 'el DOM y el OCR coinciden: el texto es real y visible' };
  }
  if (domSaysIt && !ocrConfirmsIt) {
    return { ok: true, verified: false, status: 'dom_only_not_visible', reason: 'el DOM afirma el texto pero el OCR no lo ve renderizado: podria estar oculto, tapado o inyectado sin mostrarse' };
  }
  if (!domSaysIt && ocrConfirmsIt) {
    return { ok: true, verified: false, status: 'ocr_only_not_in_dom', reason: 'el OCR ve el texto pero no esta en el DOM esperado: verificar que se esta leyendo el elemento correcto' };
  }
  return { ok: true, verified: false, status: 'not_found', reason: 'ni el DOM ni el OCR confirman el texto esperado' };
}

// Compara una lista de frases esperadas (p. ej. varios estados posibles de exito) y devuelve
// cual, si alguna, quedo confirmada visualmente. Nunca elige "a ciegas" la primera del DOM.
export function verifyAnyVisible({ domText, ocrText, expectedPhrases = [] } = {}) {
  const results = expectedPhrases.map((phrase) => ({ phrase, ...verifyVisibleText({ domText, ocrText, expectedPhrase: phrase }) }));
  const confirmed = results.find((result) => result.verified);
  return { ok: true, confirmed: confirmed?.phrase || null, results };
}
