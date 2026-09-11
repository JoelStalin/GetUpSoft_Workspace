// Nodo file-upload-handler (data/careerai/node-inventory.json: "Sube el CV adaptado; gate
// propio"). Hasta ahora, la subida de archivos en linkedin-easy-apply-node.mjs
// (fillPlanIntoPage, action:'upload') llamaba page.setInputFiles directamente con lo que
// buildFillPlan le pasara, sin validar que el archivo exista, sea del tipo correcto, o no
// este vacio/corrupto. Subir el archivo equivocado (o uno vacio) a un formulario real es un
// error que la revision humana descubriria demasiado tarde, despues del click.
//
// Este modulo es la validacion + gate, PURA (sin tocar el navegador): decide si un archivo es
// seguro de subir, y solo entonces entrega un plan que la capa de navegador puede ejecutar.
import fs from 'node:fs';
import path from 'node:path';
import { checkApproval } from './guards.mjs';

const ALLOWED_EXTENSIONS_BY_FIELD = {
  cv: ['.pdf', '.doc', '.docx'],
  resume: ['.pdf', '.doc', '.docx'],
  cover_letter: ['.pdf', '.doc', '.docx'],
};
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB: limite tipico de los ATS/formularios reales.

function guardResult(stage, reason, extra = {}) {
  return { ok: false, status: 'blocked', blocked_at: stage, reason, upload_performed: false, ...extra };
}

// Solo lo que se puede verificar sin abrir el navegador: existencia, tipo, tamano no vacio ni
// desmedido. No valida el CONTENIDO del archivo (eso ya lo hace cv-ingest.mjs al momento de
// generarlo) — este nodo evita subir algo roto, no vuelve a auditar un archivo ya generado.
export function validateAsset(assetPath, { fieldKey = 'cv', existsFn = fs.existsSync, statFn = fs.statSync } = {}) {
  if (!assetPath) return { ok: false, reason: 'no se especifico ruta de archivo' };
  if (!existsFn(assetPath)) return { ok: false, reason: `el archivo no existe: ${assetPath}` };

  const ext = path.extname(assetPath).toLowerCase();
  const allowed = ALLOWED_EXTENSIONS_BY_FIELD[fieldKey] || ALLOWED_EXTENSIONS_BY_FIELD.cv;
  if (!allowed.includes(ext)) {
    return { ok: false, reason: `extension ${ext || '(sin extension)'} no permitida para ${fieldKey}; se esperaba ${allowed.join('/')}` };
  }

  let stats;
  try {
    stats = statFn(assetPath);
  } catch (error) {
    return { ok: false, reason: `no se pudo leer el archivo: ${String(error?.message || error)}` };
  }
  if (stats.size === 0) return { ok: false, reason: 'el archivo esta vacio (0 bytes); subir esto arruinaria la postulacion' };
  if (stats.size > MAX_SIZE_BYTES) {
    return { ok: false, reason: `el archivo pesa ${(stats.size / 1024 / 1024).toFixed(1)}MB, mas del limite tipico de ${MAX_SIZE_BYTES / 1024 / 1024}MB` };
  }

  return { ok: true, extension: ext, size_bytes: stats.size };
}

// Gate propio (como pide el inventario): requiere aprobacion vigente, ADEMAS de la validacion
// del archivo. Dos motivos independientes para bloquear: el archivo esta mal, o nadie aprobo
// subirlo a esta oportunidad especifica.
export function prepareFileUpload({
  opportunity,
  approval,
  fieldKey = 'cv',
  assetPath,
  selector = null,
  existsFn,
  statFn,
  now = new Date(),
} = {}) {
  if (!opportunity?.opportunity_id) return guardResult('input', 'falta opportunity_id');

  const approvalCheck = checkApproval(approval, { opportunityId: opportunity.opportunity_id, now });
  if (!approvalCheck.valid) return guardResult('approval', 'aprobacion no valida para subir este archivo', { approval_reasons: approvalCheck.reasons });

  const validation = validateAsset(assetPath, { fieldKey, existsFn, statFn });
  if (!validation.ok) return guardResult('asset_validation', validation.reason);

  return {
    ok: true,
    status: 'ready_to_upload',
    opportunity_id: opportunity.opportunity_id,
    field: fieldKey,
    selector,
    asset_path: assetPath,
    extension: validation.extension,
    size_bytes: validation.size_bytes,
    approval_id: approval?.approval_id || null,
    // La subida real (page.setInputFiles) la ejecuta la capa de navegador con este plan; este
    // nodo nunca la ejecuta el mismo.
    upload_performed: false,
  };
}
