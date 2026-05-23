# Agent Usage Notes

Use this memory when the task asks for GetUpSoft UI, UX, landing pages, dashboards, portal screens, Odoo ERP pages, DGII/e-CF pages, infrastructure pages, or AI agent product pages.

## Best Starting Points

For Odoo ERP / DGII:
- `targets/02-iframe/document.html`
- `targets/04-iframe/document.html`
- `targets/02-iframe/components.json`

For infrastructure:
- `targets/03-iframe/document.html`
- `targets/05-iframe/document.html`
- `targets/03-iframe/components.json`

For AI agents:
- `targets/06-iframe/document.html`
- `targets/06-iframe/components.json`

For loaded libraries/resources:
- `LIBRARIES.md`
- `libraries-manifest.json`

## Implementation Guidance

Treat the captured HTML as a design specimen. Recompose it into maintainable app code:

- Extract navigation and footer once.
- Convert card grids to data arrays.
- Replace hardcoded repeated copy with content objects or i18n entries.
- Use real routing and form actions.
- Keep dashboards functional: metrics should be props/data, not static text.
- Keep visual density and premium style, but avoid copying Stitch runtime wrappers.

## Quality Bar

Any adaptation should include:

- Desktop and mobile responsive layouts.
- Keyboard-visible focus states.
- Accessible button/link names.
- No overlapping text on narrow screens.
- No raw Stitch iframe dependency.
- Clean separation between visual components and business data.

## Memory Status

This is a local workspace memory artifact. It is not a production source of truth. If product copy, legal claims, client names, or compliance statements are used publicly, verify them before release.
