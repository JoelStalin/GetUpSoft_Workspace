import { extractEmailsFromOcrText, buildOcrJobContext, draftEmailFromOcrContext } from '../apps/orca/src/careerai/ocr-email-extractor.mjs';

// --- caso limpio: email bien formado, con contexto de contacto ---------------------------
const textoLimpio = 'Buscamos Desarrollador AS400. Interesados enviar CV a rrhh@empresa-real.com. Vacante remota.';
const limpio = extractEmailsFromOcrText(textoLimpio);
if (limpio.found !== 1) throw new Error('Debe encontrar exactamente 1 email');
if (limpio.candidates[0].confidence !== 'high') throw new Error('Email bien formado con contexto de contacto debe ser high');
if (limpio.candidates[0].usable_without_review !== true) throw new Error('High confidence debe ser usable sin revision');

// --- sin ningun email en el texto ---------------------------------------------------------
const sinEmail = extractEmailsFromOcrText('Vacante interesante, aplica en nuestra pagina web.');
if (sinEmail.found !== 0) throw new Error('Sin email en el texto, no debe inventarse ninguno');

// --- patron tipico de error de OCR: debe marcarse de baja confianza, NO usarse a ciegas ---
const conErrorOcr = extractEmailsFromOcrText('Escribenos a rnaria.perez@ernpresa.corn para mas info.');
if (!conErrorOcr.candidates.length) throw new Error('Debe extraer el email aunque tenga forma sospechosa');
if (conErrorOcr.candidates[0].confidence !== 'low') throw new Error('rn/corn son errores tipicos de OCR: debe marcarse low, no high');
if (conErrorOcr.candidates[0].usable_without_review !== false) throw new Error('Low confidence NUNCA debe ser usable sin revision');

// --- email valido pero sin contexto de contacto: no se sobre-confia -----------------------
const sinContexto = extractEmailsFromOcrText('Empresa fundada en 2010. contacto@fundacion-generica.org. Mision y vision.');
if (sinContexto.candidates[0].confidence === 'high') throw new Error('Sin señal de contacto real, no debe subir a high automaticamente');

// --- multiples candidatos: cada uno se evalua por separado --------------------------------
const multiples = extractEmailsFromOcrText('Enviar CV a rrhh@empresa.com o rn1@dorninio.corn (backup).');
if (multiples.found !== 2) throw new Error('Debe detectar ambos emails presentes en el texto');
const confidencias = multiples.candidates.map((c) => c.confidence);
if (!confidencias.includes('high') || !confidencias.includes('low')) {
  throw new Error('Con dos emails de calidad distinta, cada uno debe evaluarse independientemente');
}

// --- buildOcrJobContext: elige el mejor candidato, marca revision manual si ninguno califica
const contextoBueno = buildOcrJobContext(textoLimpio);
if (!contextoBueno.best_email || contextoBueno.best_email.email !== 'rrhh@empresa-real.com') {
  throw new Error('Debe identificar el email de alta confianza como el mejor candidato');
}
if (contextoBueno.requires_manual_review !== false) throw new Error('Con un candidato de alta confianza, no deberia exigir revision manual');

const contextoMalo = buildOcrJobContext('Escribenos a rnaria.perez@ernpresa.corn para mas info.');
if (contextoMalo.best_email !== null) throw new Error('Sin ningun candidato de alta confianza, best_email debe ser null, no un dato dudoso');
if (contextoMalo.requires_manual_review !== true) throw new Error('Sin candidato confiable, debe exigir revision manual explicitamente');

// --- draftEmailFromOcrContext: nunca envia, y se niega a redactar con destinatario dudoso --
const borradorListo = draftEmailFromOcrContext(contextoBueno, { bodyText: 'Adjunto mi CV para la vacante.', subject: 'Postulacion AS400' });
if (borradorListo.status !== 'draft_ready' || borradorListo.send_performed !== false) {
  throw new Error('Con email de alta confianza, debe quedar el borrador listo, sin enviar');
}
if (borradorListo.to !== 'rrhh@empresa-real.com') throw new Error('Debe usar el email de alta confianza como destinatario');

const borradorBloqueado = draftEmailFromOcrContext(contextoMalo, { bodyText: 'Adjunto mi CV.' });
if (borradorBloqueado.status !== 'blocked_needs_review') throw new Error('Sin email confiable, debe bloquearse en vez de redactar a ciegas');
if (borradorBloqueado.send_performed !== false) throw new Error('Un borrador bloqueado nunca debe marcar send_performed');

const sinCuerpo = draftEmailFromOcrContext(contextoBueno, {});
if (sinCuerpo.ok !== false) throw new Error('Sin cuerpo del correo, no se puede redactar nada');

console.log(JSON.stringify({
  ok: true,
  node: 'ocr-email-extractor',
  sin_email_no_inventa: true,
  errores_tipicos_de_ocr_bajan_confianza: true,
  contexto_de_contacto_sube_confianza: true,
  low_confidence_nunca_usable_sin_revision: true,
  draft_nunca_envia: true,
}));
