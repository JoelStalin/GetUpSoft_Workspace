// Nodos unsupported-collector y pdf-report-builder: agrupan lo que no se pudo completar y
// arman el PDF que se envia al cliente por WhatsApp en la cadencia que el elija.
//
// El PDF se genera a mano, sin dependencias: el reporte contiene el historial laboral del
// cliente y no tiene por que pasar por una libreria de terceros para existir.
import crypto from 'node:crypto';

const MOTIVOS = {
  account_required: 'Requiere crear una cuenta en el portal antes de postular',
  offline_only: 'Solo admite postulacion presencial o telefonica',
  clearance_required: 'Exige autorizacion de seguridad',
  bot_wall: 'El portal bloqueo el acceso automatizado',
  session_expired: 'La sesion del portal caduco',
  unknown_domain: 'La postulacion sale a un dominio no reconocido',
  form_incomplete: 'El formulario pide datos que no estan en el perfil confirmado',
  'no se pudo determinar la via de postulacion': 'No se pudo determinar como postular',
};

export function collectUnsupported(analyzed = []) {
  const items = analyzed
    .filter((item) => item?.classification?.report_to_client)
    .map((item) => ({
      opportunity_id: item.opportunity_id,
      title: item.title || 'Sin titulo',
      company: item.company || 'Sin empresa',
      reason_code: item.classification.reason,
      // El cliente lee el motivo, no el codigo interno.
      reason: MOTIVOS[item.classification.reason] || item.classification.reason,
      url: item.url || null,
    }));

  const porMotivo = items.reduce((acc, item) => {
    acc[item.reason] = (acc[item.reason] || 0) + 1;
    return acc;
  }, {});

  return { ok: true, total: items.length, by_reason: porMotivo, items };
}

export function buildReportData({ tenant, period, analyzed = [], applied = [], unsupported = null } = {}) {
  const pendientes = unsupported || collectUnsupported(analyzed);
  return {
    ok: true,
    tenant: tenant || null,
    period: period || { from: null, to: null },
    generated_at: new Date().toISOString(),
    summary: {
      posiciones_analizadas: analyzed.length,
      postulaciones_enviadas: applied.length,
      sin_completar: pendientes.total,
    },
    by_method: analyzed.reduce((acc, item) => {
      const method = item?.classification?.method || 'desconocido';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {}),
    unsupported: pendientes,
    applied: applied.map((item) => ({
      title: item.title || 'Sin titulo',
      company: item.company || 'Sin empresa',
      method: item.method || null,
      // La prueba de que la postulacion existio: sin esto el reporte es una promesa.
      confirmation: item.confirmation || null,
    })),
  };
}

// --- Generador de PDF minimo, sin dependencias -------------------------------
function escapePdfText(value) {
  return String(value)
    .replace(/[\\()]/g, (match) => `\\${match}`)
    // El PDF base usa WinAnsi: los acentos se translitera para no romper la codificacion.
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\x20-\x7e]/g, '');
}

function pdfLines(report) {
  const lines = [
    { text: 'CareerAI - Reporte de postulaciones', size: 16, bold: true },
    { text: `Cliente: ${report.tenant || 'sin identificar'}`, size: 10 },
    { text: `Generado: ${report.generated_at}`, size: 10 },
    { text: '', size: 10 },
    { text: 'Resumen', size: 13, bold: true },
    { text: `Posiciones analizadas: ${report.summary.posiciones_analizadas}`, size: 11 },
    { text: `Postulaciones enviadas: ${report.summary.postulaciones_enviadas}`, size: 11 },
    { text: `Sin completar: ${report.summary.sin_completar}`, size: 11 },
    { text: '', size: 10 },
  ];

  if (report.applied.length) {
    lines.push({ text: 'Postulaciones enviadas', size: 13, bold: true });
    for (const item of report.applied.slice(0, 25)) {
      lines.push({ text: `- ${item.title} - ${item.company}${item.confirmation ? ` (ref ${item.confirmation})` : ''}`, size: 10 });
    }
    lines.push({ text: '', size: 10 });
  }

  if (report.unsupported.total) {
    lines.push({ text: 'Posiciones que no se pudieron completar', size: 13, bold: true });
    for (const item of report.unsupported.items.slice(0, 30)) {
      lines.push({ text: `- ${item.title} - ${item.company}`, size: 10 });
      lines.push({ text: `  Motivo: ${item.reason}`, size: 9 });
    }
  } else {
    lines.push({ text: 'No hubo posiciones sin completar en este periodo.', size: 11 });
  }

  return lines;
}

export function renderPdf(report) {
  const lines = pdfLines(report);
  let y = 800;
  const content = ['BT'];
  for (const line of lines) {
    if (y < 50) break; // una pagina: el reporte periodico es un resumen, no un archivo
    content.push(`/${line.bold ? 'F2' : 'F1'} ${line.size} Tf`);
    content.push(`1 0 0 1 50 ${y} Tm`);
    content.push(`(${escapePdfText(line.text)}) Tj`);
    y -= line.size + 6;
  }
  content.push('ET');
  const stream = content.join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefStart = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return Buffer.from(pdf, 'latin1');
}

// El envio real exige proveedor oficial y aprobacion: aqui solo se prepara el mensaje.
export function buildWhatsappDelivery(report, pdfBuffer, { recipientRef, allowlist = [] } = {}) {
  if (!recipientRef || !allowlist.includes(recipientRef)) {
    return {
      ok: false,
      status: 'blocked',
      reason: 'destinatario fuera de la lista permitida',
      send_performed: false,
    };
  }
  return {
    ok: true,
    channel: 'whatsapp',
    recipient_ref: recipientRef,
    attachment: { filename: `careerai-${report.generated_at.slice(0, 10)}.pdf`, bytes: pdfBuffer.length, media_type: 'application/pdf' },
    summary_text: `CareerAI: ${report.summary.posiciones_analizadas} posiciones analizadas, ${report.summary.postulaciones_enviadas} postulaciones enviadas, ${report.summary.sin_completar} sin completar.`,
    // Clave estable: reenviar el mismo reporte no genera un segundo mensaje.
    idempotency_key: crypto.createHash('sha256')
      .update(`${report.tenant}|${report.period?.from}|${report.period?.to}|${report.summary.sin_completar}`)
      .digest('hex'),
    delivery_status: 'draft',
    send_performed: false,
    approval_required: true,
  };
}
