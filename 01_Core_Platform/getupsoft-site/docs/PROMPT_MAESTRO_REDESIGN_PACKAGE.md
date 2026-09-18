# Prompt Maestro Redesign Package: GetUpSoft Global and GetUpSoft RD

## 1. Brand Strategy

GetUpSoft will operate as one premium technology architecture brand with two market expressions.

Global, at `getupsoft.com`, is the international enterprise portal. It leads with enterprise AI, autonomous agents, system integration, digital transformation, operational intelligence, automation and data orchestration. Default language is English, with Spanish available at `/es/`.

RD, at `getupsoft.com.do`, is the Dominican Republic operating portal. It leads with Odoo ERP, DGII, e-CF, electronic invoicing, inventory, accounting, networks, servers, infrastructure and local support. Default language is Spanish, with English available at `/en/`.

Brand idea for Global:

```txt
GetUpSoft designs the intelligence and infrastructure that make companies operate as one connected system.
```

Brand idea for RD:

```txt
GetUpSoft conecta gestión, infraestructura y soporte local para que las empresas dominicanas operen con más control, velocidad y continuidad.
```

Public product and case names are limited to Orca, AIHub, GetUpBuilder, Galantes Jewelry and `chefalitas`. Always write `chefalitas` in lowercase, one word. Do not publish TinderBot, scraping bots, dating automation or social automation cases.

## 2. Visual Direction

The visual language is `Enterprise AI Architecture`: dark, sober, precise and infrastructural. The common DNA should feel like IBM enterprise seriousness, Palantir intelligence architecture, Apple Pro minimalism, Linear clarity, Vercel polish and a serious consulting firm.

Global should be darker, more abstract, more futuristic and more strategic. RD should be practical, reliable, local and operational, with the same premium system language but more business process visibility.

Core visual motifs:

- Global: enterprise AI core, agent networks, data orchestration, secure infrastructure layers, executive dashboards, modular glass cubes and automation pipelines.
- RD: Odoo ERP dashboards, DGII/e-CF flows, inventory, POS, accounting, warehouse operations, racks, servers, structured cabling, WiFi and local support workflows.

## 3. Design System

Tokens:

| Token | Value | Use |
|---|---:|---|
| `bg.deep` | `#0F1115` | Main background |
| `bg.surface` | `#161920` | Section surfaces |
| `bg.elevated` | `#1C2028` | Cards, forms, nav |
| `text.main` | `#E2E8F0` | Primary text |
| `text.soft` | `#94A3B8` | Secondary text |
| `text.muted` | `#64748B` | Captions |
| `accent.global` | `#A5B4FC` | Global CTAs and highlights |
| `accent.rd` | `#99F6E4` | RD CTAs and highlights |
| `accent.cyan` | `#67E8F9` | Data lines, system flows |
| `accent.violet` | `#C084FC` | AI modules |
| `accent.green` | `#6EE7B7` | Operational success |
| `border.subtle` | `rgba(255,255,255,0.07)` | Cards and dividers |
| `border.mid` | `rgba(255,255,255,0.12)` | Inputs and buttons |

Typography:

- Display: Space Grotesk, light to semibold, clear hierarchy, no negative letter spacing.
- Body: Plus Jakarta Sans, 300 to 500, readable line height.
- Technical labels: IBM Plex Mono, uppercase, 10 to 12px.

Component rules:

- Navbar: sticky, compact, dark glass surface, clear domain identity and language switcher.
- Buttons: primary filled, secondary outline, ghost for utility. Rounded-full is acceptable for CTAs; cards remain 8px to 16px unless legacy design requires more.
- Cards: glass surface, subtle border, hover lift no more than 6px, no noisy glow.
- Forms: labels always visible, focus state with visible accent outline, inputs at least 44px tall.
- Tabs and accordions: keyboard navigable, `aria-expanded`, visible active state.
- Skeleton/loading: muted surface blocks with reduced shimmer disabled under reduced motion.
- Reduced motion: disable nonessential rotations, parallax and pulsing; keep static poster frames.

Responsive grid:

- Desktop: 12 columns, max width 1280px, 24px gutters.
- Tablet: 8 columns, max width 960px, 20px gutters.
- Mobile: 4 columns, 16px gutters, CTAs full width when paired.

## 4. Sitemap

Global:

```txt
/
/es/
/ai-agents
/system-integration
/digital-transformation
/products
/solutions
/case-studies
/methodology
/about
/contact
```

RD:

```txt
/
/en/
/odoo-erp
/facturacion-electronica
/infraestructura
/redes-empresariales
/servidores
/sectores
/casos
/nosotros
/contacto
```

## 5. Page UX Structure

Global home:

1. Hero with 3D enterprise intelligence core, H1, subheadline and two CTAs.
2. Trust indicators: AI Agents, ERP/CRM/BI/API integrations, cloud/infrastructure.
3. Problem statement: fragmented systems, disconnected teams, manual workflows.
4. Intelligence architecture section with system map.
5. AI Agents section with module grid.
6. System Integration section with before/after architecture.
7. Product ecosystem cards.
8. Case studies.
9. Methodology.
10. Final CTA.

RD home:

1. Hero with operational command center, H1, subheadline and two CTAs.
2. Main services: Odoo ERP, e-CF/DGII, infrastructure, networks.
3. Common Dominican business problems.
4. Odoo ERP module block.
5. Electronic invoicing DGII/e-CF block.
6. Infrastructure and networks block.
7. Sectors.
8. Cases.
9. Diagnostic CTA.

Global AI Agents page:

- Hero: autonomous agents for operations.
- Modules: Workflow Orchestration, Cognitive Analysis, Natural Language Operations, Agentic Memory, Executive Intelligence, Data Interpretation, Process Automation, Decision Support.
- 3D diagram: agents connected to ERP, CRM, BI, APIs, infrastructure and data.
- Use cases, governance, FAQ and CTA.

RD Odoo ERP page:

- Hero: Odoo ERP para empresas dominicanas.
- Modules: Ventas, Inventario, Compras, Contabilidad, CRM, POS, Reportes, Facturación Electrónica, Integración DGII.
- Dashboard mockup, implementation process, FAQ and CTA.

Contact forms:

- Global fields: Name, Organization, Work email, Role, Focus area, Project scope, Message.
- RD fields: Nombre, Empresa, Teléfono, Email, Servicio de interés, Mensaje.

## 6. Key Copy

Global H1:

```txt
Architectural Intelligence for the Modern Enterprise
```

Global subheadline:

```txt
We design autonomous AI agents, integrated systems and operational intelligence layers that turn fragmented companies into scalable digital ecosystems.
```

Global problem:

```txt
Modern companies operate with fragmented systems, disconnected teams and manual workflows. GetUpSoft designs the intelligence layer that connects operations, data and decision-making into one scalable architecture.
```

Global solution:

```txt
We build autonomous agents, integration layers and operational intelligence systems that help companies move faster, reduce manual work and make better decisions.
```

RD H1:

```txt
Infraestructura y gestión para el éxito local
```

RD subheadline:

```txt
Implementamos Odoo ERP, facturación electrónica e infraestructura empresarial para que tu operación funcione sin interrupciones.
```

RD problem:

```txt
Muchas empresas dominicanas operan con sistemas desconectados, inventarios difíciles de controlar, procesos manuales, facturación complicada y redes inestables. GetUpSoft conecta gestión, infraestructura y soporte para que la operación funcione con más control.
```

RD solution:

```txt
Implementamos Odoo ERP, facturación electrónica, redes, servidores e infraestructura tecnológica para empresas que necesitan orden, visibilidad y continuidad operativa.
```

## 7. SEO Metadata

Global home:

- Title: `GetUpSoft | Enterprise AI Agents, System Integration & Digital Transformation`
- Description: `GetUpSoft designs autonomous AI agents, integrated systems and operational intelligence layers for modern enterprises ready to scale.`
- H1: `Architectural Intelligence for the Modern Enterprise`
- OG title: `GetUpSoft | Enterprise AI Agents & System Integration`
- OG description: `Autonomous AI agents, integrated systems and operational intelligence for modern enterprises.`

RD home:

- Title: `GetUpSoft RD | Odoo ERP, Facturación Electrónica e Infraestructura Empresarial`
- Description: `Implementamos Odoo ERP, facturación electrónica DGII, redes, servidores e infraestructura tecnológica para empresas en República Dominicana.`
- H1: `Infraestructura y gestión para el éxito local`
- OG title: `GetUpSoft RD | Odoo ERP, DGII e Infraestructura Empresarial`
- OG description: `Odoo ERP, facturación electrónica, redes, servidores e infraestructura para empresas dominicanas.`

Primary Global keyword clusters:

- Enterprise AI agents.
- Autonomous AI agents for business.
- AI system integration.
- Digital transformation consulting.
- Enterprise automation.
- Operational intelligence platform.
- AI orchestration.
- Business process automation.
- System integration company.

Primary RD keyword clusters:

- Odoo República Dominicana.
- Implementación Odoo RD.
- Odoo Santo Domingo.
- Facturación electrónica DGII.
- e-CF República Dominicana.
- ERP para empresas dominicanas.
- Redes empresariales Santo Domingo.
- Servidores para empresas RD.
- Cableado estructurado RD.
- WiFi empresarial Santo Domingo.

## 8. i18n Strategy

This is a dual-domain, dual-market i18n model. It is not a shallow translation model.

Routing:

| Market | Default | Secondary |
|---|---|---|
| `getupsoft.com` | `/` English | `/es/` Spanish |
| `getupsoft.com.do` | `/` Spanish `es-DO` | `/en/` English |

Content model:

- Maintain content keys by portal, page, section and language.
- Keep visual assets textless when possible.
- When asset text is required, generate separate English and Spanish versions.
- Localize CTAs and examples, not only words.
- Keep RD copy concrete and Dominican-market oriented.

Hreflang:

```html
<link rel="alternate" hreflang="en" href="https://getupsoft.com/" />
<link rel="alternate" hreflang="es" href="https://getupsoft.com/es/" />
<link rel="alternate" hreflang="es-DO" href="https://getupsoft.com.do/" />
<link rel="alternate" hreflang="en" href="https://getupsoft.com.do/en/" />
```

## 9. JSON-LD Recommendations

Global:

- `Organization`
- `WebSite`
- `Service`
- `SoftwareApplication` for Orca, AIHub and GetUpBuilder.
- `FAQPage` on AI Agents, System Integration, Digital Transformation, Contact.
- `BreadcrumbList` on every non-home page.
- `ContactPage` on `/contact`.

RD:

- `Organization`
- `LocalBusiness`
- `WebSite`
- `Service`
- `SoftwareApplication` for Odoo implementation pages when framed as implementation/service.
- `FAQPage` on Odoo ERP, Facturación Electrónica, Infraestructura, Contacto.
- `BreadcrumbList`.
- `ContactPage` on `/contacto`.

## 10. Asset And Animation Direction

Required static and motion assets:

- Hero images and hero 3D loops for both portals.
- Background loops and scroll transition loops.
- Product visuals for Orca, AIHub, GetUpBuilder, Galantes Jewelry and `chefalitas`.
- Odoo ERP, e-CF/DGII, infrastructure, WiFi, rack, inventory and dashboard visuals.
- Open Graph images.
- Favicon and app icon concepts.
- Mobile, tablet and desktop variants.
- Poster frames for every video.
- Reduced-motion static alternatives.

Formats:

- 21:9 hero.
- 16:9 desktop.
- 4:5 social.
- 1:1 social.
- 9:16 mobile/video.
- WebP and AVIF for images.
- MP4 and WebM for short loops.
- SVG only for lightweight icons.

Mandatory toolchain:

- UI, layout and high-fidelity responsive screens must be generated or validated through Google Stitch at `https://stitch.withgoogle.com/`.
- In-browser UI motion and SVG/data-line animations must use Anime.js from `https://animejs.com/`. The implementation uses Anime.js v4 animation, timeline, stagger and SVG animation APIs in `src/animations/`.
- Motion/video assets must be generated in the Google Flow project at `https://labs.google/fx/tools/flow/project/c16e5ae6-a599-4e71-80d5-9d89db4cd31f`.
- Flow exports are wired into the React UI through `src/components/FlowMedia.tsx`, with Anime.js visuals layered as fallback/overlay in the Global and RD hero sections.

The local Stitch MCP bootstrap currently requires `GOOGLE_CLOUD_PROJECT` or `STITCH_API_KEY` before generation can run from the repo. Until credentials are present, `stitch/flow-prompts.md`, `stitch/screens.ts` and this package are the source artifacts to paste into the required Stitch and Flow tools.

Performance rules:

- Do not load motion before critical content.
- Use poster images for all videos.
- Lazy-load non-critical 3D and video.
- Provide static fallback if WebGL or video fails.
- Respect `prefers-reduced-motion`.

## 11. Stitch Prompt Base

Required tool: `https://stitch.withgoogle.com/`

All high-fidelity UI generation for this redesign must be done in Google Stitch. Local files in `stitch/screens.ts` provide the canonical screen prompts, and generated outputs belong in `stitch/output/`.

Use this base for Stitch screens:

```txt
Create a premium enterprise technology interface for GetUpSoft. Use dark graphite, deep navy, glass surfaces, technical gray, controlled cyan/violet/mint accents, Space Grotesk headings, Plus Jakarta Sans body, IBM Plex Mono labels. The UI must feel like an enterprise AI architecture firm, not a generic agency. Build desktop, tablet and mobile variants, reusable components, states, language switcher, semantic layout and conversion-focused CTAs.
```

Global prompt modifier:

```txt
Portal: GetUpSoft Global. Default language: English. Tone: international, strategic, abstract, futuristic, enterprise. Focus: Enterprise AI, autonomous agents, system integration, operational intelligence, digital transformation and automation.
```

RD prompt modifier:

```txt
Portal: GetUpSoft RD. Default language: Spanish. Tone: local, reliable, practical and commercial. Focus: Odoo ERP, DGII, e-CF, electronic invoicing, inventory, accounting, networks, servers and local support in República Dominicana.
```

## 12. Flow Prompts

Required tool/project: `https://labs.google/fx/tools/flow/project/c16e5ae6-a599-4e71-80d5-9d89db4cd31f`

All hero videos, background loops, poster frames, product visuals, case visuals and social/video crops must be generated in that Flow project. Assets should be exported into the implementation asset folder using the filenames from the manifest.

Global hero:

```txt
Create a premium cinematic 3D enterprise intelligence core for GetUpSoft Global. Dark graphite and deep navy environment, glass-like modular cubes, neural nodes, glowing cyan and violet data lines, subtle particles, slow executive camera orbit, shallow depth of field. The visual represents autonomous AI agents, ERP, CRM, BI, automation, infrastructure, data and operations becoming one connected system. No text embedded. Premium, sober, enterprise, elegant, not playful.
```

RD hero:

```txt
Create a premium 3D operational command center for GetUpSoft RD. Show Odoo ERP, inventory, e-CF electronic invoicing, DGII compliance, POS, accounting, warehouse, delivery routes, server racks, WiFi access points and dashboards connected by smooth animated data lines. Dark premium background with practical business feel. Reliable, local, professional, not cartoonish. No text embedded.
```

Product prompts are maintained in `stitch/flow-prompts.md` and should include Orca, AIHub, GetUpBuilder, Galantes Jewelry and `chefalitas`.

## 13. Component Architecture

Recommended frontend structure:

```txt
src/
  app/
    router.tsx
  content/
    global.en.ts
    global.es.ts
    rd.es-DO.ts
    rd.en.ts
  components/
    layout/
      PortalLayout.tsx
      Navbar.tsx
      Footer.tsx
      LanguageSwitcher.tsx
    sections/
      Hero.tsx
      TrustIndicators.tsx
      ProblemSolution.tsx
      ArchitectureDiagram.tsx
      ProductGrid.tsx
      CaseStudyGrid.tsx
      Methodology.tsx
      FAQ.tsx
      CTA.tsx
    ui/
      Button.tsx
      Card.tsx
      Badge.tsx
      Tabs.tsx
      Accordion.tsx
      Input.tsx
      Select.tsx
      Textarea.tsx
      Skeleton.tsx
  seo/
    metadata.ts
    jsonLd.ts
    hreflang.ts
  assets/
    manifest.ts
```

Component rules:

- Components extend native HTML props where practical.
- Interactive elements support keyboard and focus states.
- Content comes from localized content modules, not hard-coded page strings.
- Every image receives localized alt text.
- Every page exposes one H1.

## 14. Accessibility

Minimum: WCAG AA.

Requirements:

- Contrast AA on all text and controls.
- Visible focus states.
- Keyboard navigable nav, menus, tabs, accordions and forms.
- Labels for every form input.
- Alt text for all images and poster frames.
- Avoid color-only status indicators.
- Respect `prefers-reduced-motion`.
- Do not let motion interfere with reading.

## 15. Performance

Targets:

- LCP: below 2.5s on production pages.
- CLS: below 0.1.
- INP: below 200ms.
- Lighthouse Performance: 85+ before launch.

Implementation:

- Inline critical hero copy and nav.
- Defer videos, 3D and analytics.
- Use AVIF/WebP with explicit dimensions.
- Use lazy loading for below-fold media.
- Preload only hero poster and critical font weights.
- Avoid large animation libraries on pages that do not need them.

## 16. Development-Ready Acceptance Criteria

- Both portals render correct default language by host.
- Language switchers route to `/es/` and `/en/` as specified.
- `chefalitas` is spelled exactly that way everywhere.
- No prohibited public cases are present.
- All main pages have title, description, canonical, OG, Twitter card, hreflang and JSON-LD where applicable.
- Sitemap and robots reference both domains.
- All CTAs are present above the fold, mid-page and final section.
- Reduced motion leaves a premium static experience.
- Forms have labels, validation, loading and success/error states.
- Assets have manifest entries, alt text, dimensions and loading priority.
