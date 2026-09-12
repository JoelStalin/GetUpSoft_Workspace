import fs from "node:fs";
import path from "node:path";

function escapePdfText(value) {
  return String(value)
    .replace(/[\\()]/g, (match) => `\\${match}`)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7e]/g, "");
}

function createPdfBuffer(lines) {
  let y = 750;
  const content = ["BT"];
  for (const line of lines) {
    if (y < 40) break;
    content.push(`/${line.bold ? "F2" : "F1"} ${line.size} Tf`);
    content.push(`1 0 0 1 50 ${y} Tm`);
    content.push(`(${escapePdfText(line.text)}) Tj`);
    y -= line.size + 4;
  }
  content.push("ET");
  const stream = content.join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefStart = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return Buffer.from(pdf, "latin1");
}

const dataPath = path.resolve("task-ledger/evidence/careerai/10-candidaturas/candidaturas_procesadas.json");
const applications = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const outputDir = path.resolve("task-ledger/evidence/careerai/cvs_y_cartas_reales");
fs.mkdirSync(outputDir, { recursive: true });

console.log("Generando 10 archivos PDF reales de CV adaptado y 10 Cartas de Presentacion...");

for (const app of applications) {
  const index = String(app.index).padStart(2, "0");
  
  // 1. CV PDF Adaptado
  const cvLines = [
    { text: "JOEL STALIN", size: 18, bold: true },
    { text: app.tailored_cv.headline, size: 12, bold: true },
    { text: "Email: joelstalin@getupsoft.com | LinkedIn: linkedin.com/in/joelstalin | GitHub: github.com/JoelStalin", size: 9 },
    { text: "Location: Santo Domingo / Remote | Phone: +1 849 260 0983", size: 9 },
    { text: "", size: 8 },
    { text: "RESUMEN PROFESIONAL", size: 12, bold: true },
    { text: app.tailored_cv.summary, size: 9 },
    { text: "", size: 8 },
    { text: "HABILIDADES CLAVE ALINEADAS A LA OFERTA", size: 12, bold: true },
    { text: app.tailored_cv.highlighted_skills.join(" - "), size: 9 },
    { text: "", size: 8 },
    { text: "EXPERIENCIA PROFESIONAL RELEVANTE", size: 12, bold: true },
  ];

  for (const exp of app.tailored_cv.experience_reordered) {
    cvLines.push({ text: `* ${exp}`, size: 9, bold: true });
  }

  cvLines.push(
    { text: "", size: 8 },
    { text: "PROYECTOS Y LOGROS DESTACADOS", size: 12, bold: true },
    { text: "- GetUpSoft Cloud: Migracion y optimizacion de Odoo ERP (9,000+ pedidos POS) y Cloudflare Tunnels.", size: 9 },
    { text: "- Orca Engine & CareerAI: Arquitectura de 99 nodos n8n, Playwright stealth scraping y LLM Council.", size: 9 },
    { text: "- Diseno de sistemas tolerantes a fallos con integracion de WhatsApp Cloud API y Webhooks.", size: 9 }
  );

  const cvPdf = createPdfBuffer(cvLines);
  const cvFilename = path.join(outputDir, `CV_${index}_${app.company.replace(/\s+/g, "_")}.pdf`);
  fs.writeFileSync(cvFilename, cvPdf);

  // 2. Carta de Presentación PDF
  const letterLines = [
    { text: "CARTA DE PRESENTACION", size: 16, bold: true },
    { text: `Posicion: ${app.title}`, size: 11, bold: true },
    { text: `Empresa: ${app.company}`, size: 11 },
    { text: `Fecha: 28 de Agosto, 2026`, size: 10 },
    { text: "", size: 10 },
    { text: app.cover_letter.subject, size: 11, bold: true },
    { text: "", size: 10 },
  ];

  for (const paragraph of app.cover_letter.body.split("\n\n")) {
    letterLines.push({ text: paragraph, size: 10 });
    letterLines.push({ text: "", size: 6 });
  }

  const letterPdf = createPdfBuffer(letterLines);
  const letterFilename = path.join(outputDir, `Carta_${index}_${app.company.replace(/\s+/g, "_")}.pdf`);
  fs.writeFileSync(letterFilename, letterPdf);

  console.log(`[${index}/10] Generado: ${path.basename(cvFilename)} y ${path.basename(letterFilename)}`);
}

console.log("\nArchivos creados en:", outputDir);
