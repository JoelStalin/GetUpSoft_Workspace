import assert from 'node:assert/strict';
import { verifyVisibleText, verifyAnyVisible } from '../apps/orca/src/careerai/ocr-visual-verifier.mjs';

const coincide = verifyVisibleText({ domText: 'Aplicacion enviada con exito', ocrText: 'Aplicacion enviada con exito', expectedPhrase: 'aplicacion enviada' });
assert.equal(coincide.verified, true);
assert.equal(coincide.status, 'visually_confirmed');

const domMiente = verifyVisibleText({ domText: 'Aplicacion enviada', ocrText: 'Sube tu curriculum aqui', expectedPhrase: 'aplicacion enviada' });
assert.equal(domMiente.verified, false, 'el DOM dice algo que el OCR no confirma: no debe darse por visualmente confirmado');
assert.equal(domMiente.status, 'dom_only_not_visible');

const nada = verifyVisibleText({ domText: 'otra cosa', ocrText: 'otra cosa distinta', expectedPhrase: 'aplicacion enviada' });
assert.equal(nada.verified, false);
assert.equal(nada.status, 'not_found');

const sinFrase = verifyVisibleText({ domText: 'x', ocrText: 'x' });
assert.equal(sinFrase.ok, false);

const cualquiera = verifyAnyVisible({ domText: 'Su postulacion fue recibida', ocrText: 'Su postulacion fue recibida por la empresa', expectedPhrases: ['aplicacion enviada', 'postulacion fue recibida', 'error'] });
assert.equal(cualquiera.confirmed, 'postulacion fue recibida');

console.log(JSON.stringify({ ok: true, node: 'ocr-visual-verifier', dom_solo_no_confirma: true, cruza_dom_contra_pixeles_reales: true }));
