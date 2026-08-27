import { collectUnsupported, buildReportData, renderPdf, buildWhatsappDelivery } from '../apps/orca/src/careerai/client-report.mjs';
import { extractPdfText } from '../apps/orca/src/careerai/cv-ingest.mjs';

const analizadas = [
  { opportunity_id: 'a', title: 'Puesto Uno', company: 'Empresa A', classification: { method: 'easy_apply', report_to_client: false } },
  { opportunity_id: 'b', title: 'Puesto Dos', company: 'Empresa B', classification: { method: 'unsupported', reason: 'account_required', report_to_client: true } },
  { opportunity_id: 'c', title: 'Puesto Tres', company: 'Empresa C', classification: { method: 'unsupported', reason: 'clearance_required', report_to_client: true } },
  { opportunity_id: 'd', title: 'Puesto Cuatro', company: 'Empresa D', classification: { method: 'external_form', report_to_client: false } },
];

// --- recoleccion -------------------------------------------------------------
const pendientes = collectUnsupported(analizadas);
if (pendientes.total !== 2) throw new Error('Solo lo marcado para el cliente entra al reporte');
// El cliente lee un motivo, no un codigo interno.
if (!pendientes.items[0].reason.includes('crear una cuenta')) {
  throw new Error('El motivo debe estar en lenguaje del cliente, no en codigo interno');
}
if (pendientes.items[0].reason_code !== 'account_required') throw new Error('El codigo interno se conserva para trazabilidad');

// --- datos del reporte -------------------------------------------------------
const enviadas = [
  { title: 'Puesto Uno', company: 'Empresa A', method: 'easy_apply', confirmation: 'REF-123' },
];
const report = buildReportData({ tenant: 'cliente-demo', period: { from: '2026-08-27T00:00:00Z', to: '2026-08-27T01:00:00Z' }, analyzed: analizadas, applied: enviadas });
if (report.summary.posiciones_analizadas !== 4) throw new Error('Debe contar todo lo analizado');
if (report.summary.postulaciones_enviadas !== 1) throw new Error('Debe contar lo enviado');
if (report.summary.sin_completar !== 2) throw new Error('Debe contar lo no completado');
if (report.by_method.easy_apply !== 1 || report.by_method.external_form !== 1) throw new Error('Debe desglosar por via');

// --- PDF sin dependencias ----------------------------------------------------
const pdf = renderPdf(report);
if (!Buffer.isBuffer(pdf)) throw new Error('Debe devolver un buffer');
if (!pdf.subarray(0, 8).toString('latin1').startsWith('%PDF-1.4')) throw new Error('Debe ser un PDF valido');
if (!pdf.toString('latin1').includes('%%EOF')) throw new Error('El PDF debe cerrarse correctamente');
if (!pdf.toString('latin1').includes('xref')) throw new Error('El PDF necesita su tabla xref');

// El PDF debe ser legible de verdad, no solo tener la cabecera correcta.
const texto = extractPdfText(pdf);
if (!texto.includes('CareerAI')) throw new Error('El PDF debe contener el titulo del reporte');
if (!texto.includes('Puesto Dos')) throw new Error('El PDF debe listar las posiciones sin completar');
if (!texto.includes('REF-123')) throw new Error('El PDF debe incluir la referencia de confirmacion');

// Un reporte sin pendientes no miente ni deja la seccion vacia.
const limpio = buildReportData({ tenant: 'x', analyzed: [], applied: [] });
if (!extractPdfText(renderPdf(limpio)).includes('No hubo posiciones sin completar')) {
  throw new Error('Sin pendientes debe decirlo explicitamente');
}

// --- entrega por WhatsApp ----------------------------------------------------
const bloqueado = buildWhatsappDelivery(report, pdf, { recipientRef: 'desconocido', allowlist: ['dueno'] });
if (bloqueado.ok !== false || bloqueado.send_performed !== false) {
  throw new Error('Un destinatario fuera de la lista permitida no recibe nada');
}

const entrega = buildWhatsappDelivery(report, pdf, { recipientRef: 'dueno', allowlist: ['dueno'] });
if (entrega.send_performed !== false) throw new Error('La entrega se prepara, no se envia sola');
if (entrega.approval_required !== true) throw new Error('El envio exige aprobacion');
if (entrega.attachment.media_type !== 'application/pdf') throw new Error('El adjunto debe ser el PDF');
if (entrega.attachment.bytes !== pdf.length) throw new Error('El adjunto debe declarar el tamano real');

// Idempotencia: reenviar el mismo reporte no genera un segundo mensaje.
const repetida = buildWhatsappDelivery(report, pdf, { recipientRef: 'dueno', allowlist: ['dueno'] });
if (repetida.idempotency_key !== entrega.idempotency_key) throw new Error('La clave de idempotencia debe ser estable');
const distinta = buildWhatsappDelivery({ ...report, summary: { ...report.summary, sin_completar: 9 } }, pdf, { recipientRef: 'dueno', allowlist: ['dueno'] });
if (distinta.idempotency_key === entrega.idempotency_key) throw new Error('Un reporte distinto debe tener otra clave');

console.log(JSON.stringify({
  ok: true,
  nodes: ['unsupported-collector', 'pdf-report-builder', 'whatsapp-report-sender'],
  pdf_bytes: pdf.length,
  pdf_legible: true,
  sin_completar: report.summary.sin_completar,
  send_performed: false,
}));
