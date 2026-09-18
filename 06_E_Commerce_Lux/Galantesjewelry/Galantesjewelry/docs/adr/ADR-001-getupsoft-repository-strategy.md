# ADR-001: GetUpSoft Repository Strategy

Date: 2026-05-09
Status: Accepted

## Decision

Use five private GitHub repositories under `JoelStalin`:

| Repository | Purpose |
| --- | --- |
| `getupsoft-web` | Corporate GetUpSoft web presence for `getupsoft.com` and `getupsoft.com.do`. |
| `easycount-platform` | EasyCount product application and product-specific user experience. |
| `getupsoft-odoo-integration` | BFF/API integration service between product apps and Odoo JSON-2. |
| `getupsoft-admin-portals` | Administrative surfaces for GetUpSoft and EasyCount. |
| `getupsoft-infra` | Cloudflare, DNS, CI/CD, environment, observability, and deployment automation. |

## Rationale

This keeps corporate marketing, product code, administrative surfaces, Odoo integration, and infrastructure on clear ownership boundaries while avoiding a single high-risk monorepo. The integration repo owns the stable API boundary so frontends do not call Odoo directly.

## Consequences

- Cross-repo changes must be coordinated through ADRs and versioned API contracts.
- CI/CD and secrets policy must be standardized across repositories.
- `getupsoft-infra` becomes the operational source of truth for DNS/tunnel automation.

## Evidence

Created private GitHub repositories:

- `https://github.com/JoelStalin/getupsoft-web`
- `https://github.com/JoelStalin/easycount-platform`
- `https://github.com/JoelStalin/getupsoft-odoo-integration`
- `https://github.com/JoelStalin/getupsoft-admin-portals`
- `https://github.com/JoelStalin/getupsoft-infra`
