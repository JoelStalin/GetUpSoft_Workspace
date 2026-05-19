import { DESIGN_SYSTEM, GLOBAL_CONTEXT, RD_CONTEXT } from "./design-system";

export interface ScreenDef {
  id: string;
  portal: "global" | "rd";
  name: string;
  device: "DESKTOP" | "MOBILE" | "TABLET";
  prompt: string;
}

const g = (id: string, name: string, device: ScreenDef["device"], prompt: string): ScreenDef => ({
  id,
  portal: "global",
  name,
  device,
  prompt: `${DESIGN_SYSTEM}\n${GLOBAL_CONTEXT}\n\n${prompt}`,
});

const r = (id: string, name: string, device: ScreenDef["device"], prompt: string): ScreenDef => ({
  id,
  portal: "rd",
  name,
  device,
  prompt: `${DESIGN_SYSTEM}\n${RD_CONTEXT}\n\n${prompt}`,
});

export const SCREENS: ScreenDef[] = [
  // ─── GLOBAL DESKTOP ──────────────────────────────────────────────────────
  g(
    "global-home-desktop",
    "Global Home — Desktop",
    "DESKTOP",
    `Create the full homepage for GetUpSoft Global.

Hero section (above fold):
- Dark premium header with logo "getupsoft" (Space Grotesk) + "Global" label
- Nav: Home | AI Agents | Integration | Products | Solutions | About + "Book Strategy" CTA (rounded-full, pastel indigo border)
- Top announcement bar: "Enterprise AI Architecture · System Integration · Digital Transformation"
- H1 (hero): "Architectural Intelligence / for the Modern / Enterprise." — Space Grotesk, light, ~80px, line-height 0.92
- The word "Intelligence" is italic in #A5B4FC
- Subtext: "We design autonomous AI agents, integrated systems and operational intelligence layers that turn fragmented companies into scalable digital ecosystems." — muted, 18px, light
- Two CTAs: "Book Strategy Session" (rounded-full filled #A5B4FC, dark text) + "Explore Methodology" (ghost border)
- Three stat items: AI Agents / Production-grade | Integrations / ERP·CRM·BI·APIs | Infrastructure / Cloud-native
- Right column: floating dark glass card showing "Intelligence Layer" dashboard with 5 rows (AI Agents, ERP Integration, Automation, Data Orchestration, Operational BI) each with progress bar, plus 3 metric cells (Latency 18ms, Agents Active, Uptime 99.9%)
- Ambient background: subtle indigo glow top-left, faint teal glow right

Below fold sections (scroll):
1. Problem statement banner: centered, "Modern companies operate with fragmented systems..." — muted background
2. Capabilities grid 4 cols: Enterprise AI Agents | System Integration | Operational Intelligence | Digital Transformation — glass cards with icon symbols (◈ ⬡ ◎ ▣), title, short desc
3. Products section: title "Our proprietary ecosystem." + grid of 5 product cards (Orca, AIHub, GetUpBuilder, Galantes Jewelry, chefalitas)
4. Methodology 3 steps: 01 Architecture Audit / 02 Intelligence Design / 03 Operational Delivery — two-col layout
5. CTA section: glass card, headline "Ready to architect your intelligence layer?" + two CTA buttons`,
  ),

  g(
    "global-home-mobile",
    "Global Home — Mobile",
    "MOBILE",
    `Mobile version of GetUpSoft Global homepage.
Hamburger menu. Stack layout. Hero headline 40px. CTA buttons full-width. Stats in 1-col list. Dashboard card hidden on mobile, replaced by 3 metric pills. Capabilities 2-col grid. Products 1-col cards. Same color tokens and typography as desktop.`,
  ),

  g(
    "global-ai-agents-desktop",
    "Global AI Agents — Desktop",
    "DESKTOP",
    `Page: AI Agents for GetUpSoft Global.

Above fold:
- Same nav as homepage
- Page label: "// AI Agents" in font-mono #A5B4FC
- H1: "Autonomous agents that run your operations." Space Grotesk light
- Subtext explaining multi-step autonomous workflows
- CTA: "Deploy Your First Agent"

Agent modules grid (2×4):
Show 8 modules as glass cards: Workflow Orchestration | Cognitive Analysis | Natural Language Operations | Agentic Memory | Executive Intelligence | Data Interpretation | Process Automation | Decision Support
Each card: icon symbol, title, 2-line desc, accent dot

Architecture diagram section:
Dark diagram showing agents connected to ERP, CRM, BI, APIs, Infrastructure — nodes with lines, premium technical style, no cartoonish icons

CTA section: "Talk to an AI Architect"`,
  ),

  g(
    "global-products-desktop",
    "Global Products — Desktop",
    "DESKTOP",
    `Products page for GetUpSoft Global.

Header section: "Our Proprietary Ecosystem." — 5 product cards in a premium grid.

Each product card is large, glass, with:
- Tag (font-mono uppercase small)
- Product name (font-display large, accent color)
- Description (2-3 lines, muted)
- "Explore →" link
- Animated accent dot (pulsing)
- Status indicator

Products:
1. Orca — tag: AI Orchestration — color: #A5B4FC — "Operational Real-time Cognitive Orchestrator. Connects agents, workflows and business systems into one intelligent core."
2. AIHub — tag: Intelligence Library — color: #C084FC — "Centralized repository of AI blocks, automation patterns, models and workflows."
3. GetUpBuilder — tag: Delivery Accelerator — color: #67E8F9 — "Project generator and accelerator for structured, production-ready software delivery."
4. Galantes Jewelry — tag: Commerce Case — color: #F0ABFC — "Business case: inventory intelligence, sales analytics and digital commerce operations."
5. chefalitas — tag: Food-Tech Case — color: #6EE7B7 — "Restaurant operations: orders, kitchen workflow, delivery routing, inventory and analytics."

Orca card spans 2 columns (featured). Rest in 2×2 grid below.`,
  ),

  g(
    "global-contact-desktop",
    "Global Contact — Desktop",
    "DESKTOP",
    `Contact page for GetUpSoft Global.

Two-column layout:
Left: "Schedule a Strategic Session." headline. Short text about who they work with. Three bullet points: enterprise teams, founders, CTOs/COOs.

Right: Clean glass form card:
Fields: Name | Organization | Work Email | Role | Focus Area (dropdown: AI Agents / System Integration / Digital Transformation / Infrastructure / Other) | Project Scope (dropdown) | Message (textarea)
Submit button: "Schedule Strategic Session" — full width, rounded-full, #A5B4FC filled

Below form: "Or reach us directly" with email/LinkedIn placeholders.`,
  ),

  // ─── RD DESKTOP ──────────────────────────────────────────────────────────
  r(
    "rd-home-desktop",
    "RD Home — Desktop",
    "DESKTOP",
    `Homepage for GetUpSoft RD (Dominican Republic portal). Spanish language.

Important output requirement:
- Return a complete responsive HTML page, not a logo SVG or isolated asset.
- The first viewport must include header, hero copy, CTAs, stats and operational dashboard.
- Do not generate only the wordmark.

Header:
- Logo "getupsoft RD" where "RD" is in #99F6E4 (mint)
- Nav: Inicio | Odoo ERP | Facturación | Infraestructura | Sectores | Nosotros + "Diagnóstico" CTA (mint border rounded-full)
- Top bar: "República Dominicana · Odoo ERP · Facturación e-CF · Infraestructura"

Hero:
- Tag: "// Soluciones Tangibles · Software + Hardware" (mint, font-mono)
- H1: "Infraestructura y gestión / para el éxito / local." — Space Grotesk light ~80px, "gestión" italic in #99F6E4
- Subtext: "Implementamos Odoo ERP, facturación electrónica e infraestructura empresarial para que tu operación funcione sin interrupciones." — muted, light
- CTAs: "Solicitar Diagnóstico" (filled mint) + "Ver Servicios" (ghost)
- Stats: ERP / Odoo Certified | Facturación / DGII · e-CF | Soporte / Local · RD
- Right column: dark glass operational dashboard — service progress bars (Odoo ERP 92%, Facturación e-CF 88%, Inventario 95%, Redes/WiFi 78%, DGII 100%) + "Cumplimiento DGII Activo" mint badge

Below fold:
1. Problem statement: two-col — headline "Muchas empresas dominicanas operan con sistemas desconectados" + bullet list of 5 common problems
2. Services grid 2×2: Odoo ERP | Facturación Electrónica | Infraestructura | Redes Empresariales — glass cards with icon, title, desc, "Ver más →"
3. Sectors row: "Atendemos empresas de todos los sectores." + pill tags: Distribuidoras · Retail · Ferreterías · Restaurantes · Logística · Servicios · Food-tech
4. Cases 2-col: Galantes Jewelry (color #F0ABFC) + chefalitas (color #6EE7B7) — glass cards
5. Process 3 steps: 01 Diagnóstico / 02 Diseño / 03 Implementación
6. Final CTA: glass card "Evalúa tu infraestructura hoy." + mint CTA button`,
  ),

  r(
    "rd-home-mobile",
    "RD Home — Mobile",
    "MOBILE",
    `Mobile version of GetUpSoft RD homepage. Spanish. Stack layout. Hamburger menu. Hero headline 40px. Full-width CTAs. Dashboard card replaced by 3 status pills. Services 1-col. Sector pills wrap. Same mint accent #99F6E4.`,
  ),

  r(
    "rd-odoo-desktop",
    "RD Odoo ERP — Desktop",
    "DESKTOP",
    `Odoo ERP page for GetUpSoft RD. Spanish.

Hero: "Odoo ERP para empresas dominicanas." — headline. Subtext about full Odoo implementation.

Modules grid (3×3): Ventas | Inventario | Compras | Contabilidad | CRM | POS | Reportes | Facturación Electrónica | Integración DGII
Each: glass card, icon symbol, name, 2-line desc, mint accent

Dashboard mockup section: dark glass "Odoo Dashboard" showing inventory levels, sales chart, accounts payable, and DGII compliance status — premium business style

CTA: "Cotizar Implementación"`,
  ),

  r(
    "rd-facturacion-desktop",
    "RD Facturación Electrónica — Desktop",
    "DESKTOP",
    `Facturación Electrónica page for GetUpSoft RD. Spanish.

Hero: "Facturación Electrónica conforme a DGII." headline.

Three-col info section: e-CF | DGII | Integración Odoo

Flow diagram: step-by-step visual showing: Emisión → Validación DGII → Firma Digital → Envío al cliente → Archivo

FAQ accordion section: 5 common questions about e-CF, DGII compliance, NCF, integration

CTA: "Activar Facturación Electrónica"`,
  ),

  r(
    "rd-contacto-desktop",
    "RD Contacto — Desktop",
    "DESKTOP",
    `Contact page for GetUpSoft RD. Spanish.

Two-column layout.
Left: "Solicita tu Diagnóstico Tecnológico." headline. Short text. Three bullets: Odoo ERP / Facturación DGII / Infraestructura y Redes.

Right: Glass form card:
Fields (Spanish): Nombre | Empresa | Teléfono | Email | Servicio de interés (dropdown: Odoo ERP / Facturación Electrónica / Infraestructura / Redes / Soporte) | Mensaje (textarea)
Submit: "Enviar Solicitud de Diagnóstico" — full width, rounded-full, mint filled (#99F6E4, dark text)`,
  ),
];
