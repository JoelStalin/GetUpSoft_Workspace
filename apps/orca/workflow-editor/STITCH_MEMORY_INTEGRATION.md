# Stitch Memory Integration

Canonical source:
`C:/Users/yoeli/Documents/GetUpSoft_Workspace/.agents/memory/ui-ux-examples/stitch-getupsoft-portal/README.md`

Use this capture as the UI/UX reference for Orca. Rebuild patterns as React components and local CSS; do not embed Stitch iframes or injected runtime scripts.

## Reference Targets

- `targets/02-iframe-about-srcdoc`: Odoo ERP certified page.
- `targets/03-iframe-about-srcdoc`: Infrastructure and software management page.
- `targets/04-iframe-about-srcdoc`: Odoo ERP Dominican Republic page.
- `targets/05-iframe-about-srcdoc`: Odoo ERP + infrastructure page.
- `targets/06-iframe-about-srcdoc`: AI Agents global page.
- `targets/01-iframe-*`: Stitch editor shell and loaded project runtime.

## Component Patterns To Integrate

- `PortalShell`: app shell, top navigation, dark glass panels, fixed operational chrome.
- `HeroPanel`: compact product headline, eyebrow, primary/secondary actions.
- `MetricDashboard`: KPI rows, live status dots, compact chart/status placeholders.
- `ServiceGrid`: reusable icon cards for ERP, infrastructure, AI, workflow, APIs.
- `ArchitectureMap`: central agent/core node with connected system nodes.
- `DiagnosticCTA`: final action panel for strategy, diagnostics, deployment, or run actions.
- `GlassCard`: shared dark translucent card with thin border and subtle hover glow.
- `ArcNode`: pill-shaped integration node used for ERP, CRM, BI, APIs, and workflow systems.

## Library Signals

Keep these as architectural guidance, not automatic CDN imports:

- React: already native in Orca.
- Tailwind-like utilities: Orca uses Tailwind plus local CSS tokens.
- XYFlow: already native in Orca workflow canvas.
- Monaco Editor: integrate only for code/config editing screens, lazily loaded.
- TipTap/Rich text: already present in dependencies; use for rich prompts/docs when needed.
- Material Symbols: prefer existing `lucide-react` for app buttons; use Material Symbols only when matching captured page iconography is more important.
- Google Fonts: prefer `Space Grotesk`, `Plus Jakarta Sans`, `IBM Plex Mono`, `Space Mono`, and `Inter` from the captured memory.
- Popover/Menu/Select/Checkbox/ToggleGroup: Orca has local equivalents; extend them instead of importing Stitch runtime chunks.
- Markdown/marked: use for agent output previews and documentation panes.
- Google APIs/Firebase/App Engine/GTag: capture signals only; do not add to Orca unless a real product integration needs them.

## Current Orca Integration Status

- Production ORCA intro replicated with Space Mono, tracking animation, vertical exit, and matrix canvas.
- Dark enterprise shell uses Stitch-inspired glass, thin borders, and mint/teal accents.
- Workflow nodes use glass-card styling, glowing status, compact typography, and captured palette cues.
- Toolbar/toggles/status pills use local reusable classes instead of repeated inline styles.
- Component palette has local fallback node inventory and does not depend on backend availability.
- Agent Log/chat now has a single entry point through the bottom quick access bar.
- `03_AI_Automation/loader` was reviewed and adapted as a modern local `resourceLoader` utility for non-blocking resource registration and ordered script loading.
- Web Design mode now lazily loads Stitch reference fonts through `src/utils/resourceLoader.ts`.

## Next Integration Backlog

- Build a real `ArchitectureMap` mode/panel using the AI Agents target structure.
- Add `ServiceGrid` templates to the component palette for agent, API, ERP, CRM, BI, and deployment patterns.
- Add a lazy Monaco-backed node configuration editor for scripts, API bodies, and prompt JSON.
- Add Markdown preview to agent responses and documentation fields.
- Convert remaining repeated inline styles in floating panels to shared `orca-*` classes.
