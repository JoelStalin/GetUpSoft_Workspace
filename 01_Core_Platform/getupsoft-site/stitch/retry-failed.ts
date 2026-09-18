/**
 * Retry script for failed screens: global-ai-agents-desktop, rd-odoo-desktop, rd-home-desktop
 * Uses shorter prompts that stay within Stitch generation limits.
 */

import { stitch } from "@google/stitch-sdk";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const OUTPUT_DIR = join(import.meta.dirname, "output");
const PROJECT_TITLE = "GetUpSoft Portal Redesign";

const DESIGN_TOKENS = `Design tokens: bg #0F1115, surface #161920, elevated #1C2028. Text #E2E8F0 main, #64748B muted. Font: Space Grotesk display, Plus Jakarta Sans body, IBM Plex Mono mono. Borders rgba(255,255,255,0.07). Glass cards: bg rgba(255,255,255,0.03) backdrop-blur border rgba(255,255,255,0.07). NO white backgrounds. Dark premium.`;

const SCREENS = [
  {
    id: "global-ai-agents-desktop",
    portal: "global",
    device: "DESKTOP" as const,
    name: "Global AI Agents — Desktop",
    prompt: `${DESIGN_TOKENS} Accent #A5B4FC (indigo).

GetUpSoft Global — AI Agents page. Desktop.

Nav: logo "getupsoft" (Space Grotesk light) + "Global" tag, links Home|AI Agents|Integration|Products|Solutions|About, CTA "Book Strategy" (rounded-full indigo border).

Hero: monospace tag "// AI Agents" in #A5B4FC. H1 "Autonomous agents that run your operations." Space Grotesk light 72px. Subtext muted 18px. CTA button "Deploy Your First Agent" filled #A5B4FC.

Agent modules 2×4 glass grid: Workflow Orchestration | Cognitive Analysis | Natural Language Ops | Agentic Memory | Executive Intelligence | Data Interpretation | Process Automation | Decision Support. Each: symbol icon, title, 2-line desc, small accent dot.

Architecture section: dark diagram nodes (Agent Core, ERP, CRM, BI, APIs, Infrastructure) connected with lines. Premium technical aesthetic.

Footer CTA: "Talk to an AI Architect" centered glass card.`,
  },
  {
    id: "rd-odoo-desktop",
    portal: "rd",
    device: "DESKTOP" as const,
    name: "RD Odoo ERP — Desktop",
    prompt: `${DESIGN_TOKENS} Accent #99F6E4 (mint teal).

GetUpSoft RD — Odoo ERP page. Spanish. Dominican Republic.

Nav: logo "getupsoft RD" (RD in #99F6E4), links Inicio|Odoo ERP|Facturación|Infraestructura|Sectores|Nosotros, CTA "Diagnóstico" (mint border rounded-full).

Hero: tag "// Odoo ERP Certificado" mint mono. H1 "Odoo ERP para empresas dominicanas." Space Grotesk light 72px. Subtext muted Spanish 18px. CTA "Cotizar Implementación" filled mint.

Modules 3×3 glass grid: Ventas | Inventario | Compras | Contabilidad | CRM | POS | Reportes | Facturación e-CF | DGII. Each: symbol, title, 2-line Spanish desc, mint accent.

Dashboard section: dark glass "Odoo Dashboard" mockup — inventory gauge, sales chart bars, accounts table, DGII compliance badge "Activo" in mint. Premium business style.

CTA card: "¿Listo para implementar Odoo?" + mint button.`,
  },
  {
    id: "rd-home-desktop",
    portal: "rd",
    device: "DESKTOP" as const,
    name: "RD Home — Desktop",
    prompt: `${DESIGN_TOKENS} Accent #99F6E4 (mint teal).

GetUpSoft RD homepage. Spanish. Dominican Republic.

Nav: logo "getupsoft RD" (RD mint), links Inicio|Odoo ERP|Facturación|Infraestructura|Sectores|Nosotros, CTA "Diagnóstico" (mint border).
Top bar: "República Dominicana · Odoo ERP · Facturación e-CF · Infraestructura"

Hero left: monospace tag "// Soluciones Tangibles · Software + Hardware" mint. H1 "Infraestructura y gestión / para el éxito / local." Space Grotesk light 80px, "gestión" italic mint. Subtext muted. CTAs: "Solicitar Diagnóstico" (filled mint) + "Ver Servicios" (ghost). Stats: ERP/Odoo | Facturación/DGII | Soporte/Local.
Hero right: dark glass dashboard — 5 progress bars (Odoo ERP 92%, Facturación e-CF 88%, Inventario 95%, Redes 78%, DGII 100%) + "Cumplimiento DGII Activo" badge.

Services grid 2×2 glass: Odoo ERP | Facturación Electrónica | Infraestructura | Redes Empresariales.
Sectors pills: Distribuidoras·Retail·Ferreterías·Restaurantes·Logística.
Cases 2-col: Galantes Jewelry (#F0ABFC) + chefalitas (#6EE7B7) — glass cards.
Final CTA: "Evalúa tu infraestructura hoy." glass card mint button.`,
  },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function downloadFile(url: string, destPath: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${url}`);
  const buffer = await res.arrayBuffer();
  writeFileSync(destPath, Buffer.from(buffer));
}

async function resolveUrls(
  generated: any,
  project: any,
  retries = 6,
  delayMs = 8000,
): Promise<{ htmlUrl: string; imageUrl: string }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const htmlUrl = await generated.getHtml();
    const imageUrl = await generated.getImage();
    if (htmlUrl && imageUrl) return { htmlUrl, imageUrl };

    if (attempt < retries) {
      console.log(`  ⏳ URLs empty (${attempt + 1}/${retries}), waiting ${delayMs / 1000}s...`);
      await sleep(delayMs);

      try {
        const screens = await project.screens();
        const latest = screens[screens.length - 1];
        if (latest) {
          const h = await latest.getHtml();
          const i = await latest.getImage();
          if (h && i) return { htmlUrl: h, imageUrl: i };
        }
      } catch { /* ignore */ }
    }
  }
  throw new Error("URLs remained empty after all retries");
}

async function main() {
  if (!process.env.STITCH_API_KEY) {
    console.error("❌ Missing STITCH_API_KEY");
    process.exit(1);
  }

  // Find existing project
  const existing = await stitch.projects();
  const found = existing.find(
    (p) => (p as any).data?.title === PROJECT_TITLE || (p as any).data?.displayName === PROJECT_TITLE,
  );
  let projectId: string;
  if (found) {
    projectId = found.projectId;
    console.log(`Reusing project: ${projectId}`);
  } else {
    const created = await stitch.createProject(PROJECT_TITLE);
    projectId = created.projectId;
    console.log(`Created project: ${projectId}`);
  }

  for (const screen of SCREENS) {
    console.log(`\nGenerating: ${screen.name} (${screen.device})`);
    const project = stitch.project(projectId);

    try {
      const generated = await project.generate(screen.prompt, screen.device);
      console.log(`  Generated, resolving URLs...`);

      const { htmlUrl, imageUrl } = await resolveUrls(generated, project);

      const outDir = join(OUTPUT_DIR, screen.portal);
      mkdirSync(outDir, { recursive: true });
      const htmlPath = join(outDir, `${screen.id}.html`);
      const imagePath = join(outDir, `${screen.id}.png`);

      await downloadFile(htmlUrl, htmlPath);
      await downloadFile(imageUrl, imagePath);

      console.log(`  ✓ Saved: ${htmlPath}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${screen.id}: ${msg}`);
    }

    await sleep(3000);
  }

  console.log("\nDone.");
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
