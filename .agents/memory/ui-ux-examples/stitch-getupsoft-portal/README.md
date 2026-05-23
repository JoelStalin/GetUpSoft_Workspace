# Stitch GetUpSoft Portal UI/UX Memory

Source capture: `03_AI_Automation/hyperframes/captures/interactive-stitch-full-loaded`

This folder is a reusable UI/UX reference memory for agents building or adapting GetUpSoft portal pages. It contains full DOM captures, text, styles, scripts, component inventories, loaded library manifests, and screenshots extracted from a Stitch project.

## How To Use

Start with:

1. `targets-manifest.json` to choose the reference page.
2. `targets/<target>/text.txt` to understand page structure and copy hierarchy.
3. `targets/<target>/document.html` and `targets/<target>/styles.css` for layout and visual implementation details.
4. `targets/<target>/components.json` for a machine-readable component inventory.
5. `LIBRARIES.md` and `libraries-manifest.json` to understand runtime/library signals.

Use these files as design references, not as a blind copy source. Preserve the strongest visual language while rebuilding components cleanly in the target app framework.

## Reference Targets

- `02-iframe`: Odoo ERP premium page, certified/DGII positioning, dark enterprise dashboard style.
- `03-iframe`: Infrastructure and software management page, service portfolio, cases, diagnostics CTA.
- `04-iframe`: Odoo ERP Dominican Republic page, modular services and compliance panel.
- `05-iframe`: Odoo ERP + infrastructure page, metric dashboard, services, sector chips, success stories.
- `06-iframe`: AI Agents global page, agent capability grid and architecture layer.
- `01-iframe`: Stitch project shell/listing; useful for project metadata and available generated pages.

## Design Language

- Premium enterprise SaaS aesthetic.
- Dark technical backgrounds around `#0F1115`, charcoal, navy, and near-black surfaces.
- Mint/teal accents around `#99F6E4`, plus restrained indigo/blue for AI/global pages.
- Thin borders, glass-like panels, subtle glow, and clean data-heavy dashboard patterns.
- Typography intent: Space Grotesk / Google Sans style, compact, technical, high-contrast.
- Icon language: Material Symbols style, simple operational icons, no cartoon illustration.
- Layout: dense but readable; hero + dashboard preview + modular cards + CTA bands.

## Adaptation Rules

- Convert static mockups into real components with props and state.
- Keep repeated service cards, metric rows, navigation, and CTA patterns reusable.
- Use semantic HTML and accessible labels when implementing.
- Preserve responsive behavior: mobile nav, stacked cards, readable dashboards.
- Replace placeholder claims/cases with verified product data when shipping publicly.
- Do not depend on Stitch-specific iframe/runtime code in production.

## Suggested Component Families

- `PortalShell`: header, nav, footer, page container.
- `HeroPanel`: eyebrow, headline, supporting copy, primary/secondary CTAs.
- `MetricDashboard`: KPI rows, status badges, chart placeholders, compliance indicators.
- `ServiceGrid`: reusable icon cards for ERP, invoicing, infrastructure, AI agents.
- `SectorChips`: industry chips for RD/local pages.
- `SuccessCase`: case study card with metrics.
- `ArchitectureMap`: central node plus connected systems for AI pages.
- `DiagnosticCTA`: final conversion section.

## Capture Contents

- `targets/`: per-frame DOM captures and component inventories.
- `discovered-url-resources/`: downloaded resources discovered from captured DOM.
- `full-page-screenshot.png`: screenshot of the loaded Stitch shell.
- `targets-manifest.json`: target/frame index.
- `libraries-manifest.json`: detected libraries and resource URLs.
- `LIBRARIES.md`: human-readable library inventory.
- `CAPTURE_REPORT.md`: capture summary.

## Recommended Agent Workflow

1. Select a target page from `targets-manifest.json`.
2. Read `text.txt` and `components.json` for structure.
3. Inspect `document.html` and `styles.css` only for the selected target.
4. Rebuild in the target framework using local design tokens and reusable components.
5. Add missing real functionality: navigation, forms, data binding, validations, and responsive states.
6. Verify visually against the captured screenshot/HTML and run app tests.
