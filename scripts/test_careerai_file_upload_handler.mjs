import { validateAsset, prepareFileUpload } from '../apps/orca/src/careerai/file-upload-handler.mjs';

const now = new Date('2026-09-07T12:00:00Z');
const approval = {
  approval_id: 'appr-upload-1', opportunity_id: 'opp-1', status: 'approved',
  expires_at: '2026-09-08T00:00:00Z', payload_hash: null,
};
const opportunity = { opportunity_id: 'opp-1' };

// --- fixtures de fs falsos: no toca el disco real ------------------------------------
const files = {
  '/cv/valido.pdf': { size: 250_000 },
  '/cv/vacio.pdf': { size: 0 },
  '/cv/enorme.pdf': { size: 15 * 1024 * 1024 },
  '/cv/foto.jpg': { size: 100_000 },
};
const existsFn = (p) => Object.prototype.hasOwnProperty.call(files, p);
const statFn = (p) => files[p];

// --- archivo valido: pasa la validacion --------------------------------------------
const valido = validateAsset('/cv/valido.pdf', { fieldKey: 'cv', existsFn, statFn });
if (valido.ok !== true) throw new Error('Un PDF valido y con contenido debe pasar la validacion');

// --- archivo inexistente ------------------------------------------------------------
const inexistente = validateAsset('/cv/no-existe.pdf', { fieldKey: 'cv', existsFn, statFn });
if (inexistente.ok !== false || !/no existe/.test(inexistente.reason)) throw new Error('Un archivo inexistente debe bloquearse con razon clara');

// --- archivo vacio: NUNCA se sube, arruinaria la postulacion -----------------------
const vacio = validateAsset('/cv/vacio.pdf', { fieldKey: 'cv', existsFn, statFn });
if (vacio.ok !== false || !/vacio/.test(vacio.reason)) throw new Error('Un archivo de 0 bytes jamas debe pasar la validacion');

// --- archivo demasiado grande --------------------------------------------------------
const enorme = validateAsset('/cv/enorme.pdf', { fieldKey: 'cv', existsFn, statFn });
if (enorme.ok !== false || !/MB/.test(enorme.reason)) throw new Error('Un archivo por encima del limite debe bloquearse');

// --- extension no permitida (una foto no es un CV) ----------------------------------
const extensionMala = validateAsset('/cv/foto.jpg', { fieldKey: 'cv', existsFn, statFn });
if (extensionMala.ok !== false || !/extension/.test(extensionMala.reason)) throw new Error('Una extension no permitida debe bloquearse, no asumir que esta bien');

// --- prepareFileUpload: gate propio, aprobacion + validacion independientes ---------
const listo = prepareFileUpload({
  opportunity, approval, fieldKey: 'cv', assetPath: '/cv/valido.pdf', selector: '#resume-upload',
  existsFn, statFn, now,
});
if (listo.status !== 'ready_to_upload' || listo.upload_performed !== false) {
  throw new Error('Con aprobacion vigente y archivo valido, debe quedar listo para que el navegador lo suba');
}

// Sin aprobacion: bloqueado, aunque el archivo este perfecto.
const sinAprobacion = prepareFileUpload({
  opportunity, approval: null, fieldKey: 'cv', assetPath: '/cv/valido.pdf', existsFn, statFn, now,
});
if (sinAprobacion.ok !== false || sinAprobacion.blocked_at !== 'approval') {
  throw new Error('Sin aprobacion vigente, un archivo perfecto no debe alcanzar para subirlo');
}

// Con aprobacion pero archivo invalido: bloqueado por el archivo, no por la aprobacion.
const archivoMalo = prepareFileUpload({
  opportunity, approval, fieldKey: 'cv', assetPath: '/cv/vacio.pdf', existsFn, statFn, now,
});
if (archivoMalo.ok !== false || archivoMalo.blocked_at !== 'asset_validation') {
  throw new Error('Con aprobacion valida pero archivo vacio, debe bloquearse por el archivo, no pasar');
}

// Aprobacion de OTRA oportunidad no sirve para esta.
const aprobacionCruzada = prepareFileUpload({
  opportunity: { opportunity_id: 'opp-2' }, approval, fieldKey: 'cv', assetPath: '/cv/valido.pdf', existsFn, statFn, now,
});
if (aprobacionCruzada.ok !== false || aprobacionCruzada.blocked_at !== 'approval') {
  throw new Error('Una aprobacion de otra oportunidad no debe autorizar subir el archivo aqui');
}

console.log(JSON.stringify({
  ok: true,
  node: 'file-upload-handler',
  archivo_vacio_nunca_pasa: true,
  archivo_enorme_bloqueado: true,
  extension_incorrecta_bloqueada: true,
  gate_propio_independiente_de_aprobacion: true,
  upload_performed_siempre_false: true,
}));
