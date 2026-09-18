# ADR-003: Domain Strategy

Date: 2026-05-09
Status: Accepted

## Decision

Use these canonical domains:

| Domain | Role |
| --- | --- |
| `getupsoft.com` | Global corporate GetUpSoft site. |
| `getupsoft.com.do` | Dominican Republic corporate presence. |
| `admin.getupsoft.com` | Global administrative surface. |
| `admin.getupsoft.com.do` | Dominican Republic administrative surface. |
| `easycount.getupsoft.com` | Global EasyCount product experience. |
| `easycount.getupsoft.com.do` | Dominican Republic EasyCount product experience. |

## DNS And Routing

- `www.getupsoft.com` redirects to `getupsoft.com`.
- `www.getupsoft.com.do` redirects to `getupsoft.com.do`.
- `admin.getupsoft.com` routes to the admin portals repo.
- `admin.getupsoft.com.do` routes to the admin portals repo.
- `stg.getupsoft.com.do` is the shared staging entrypoint.
- `api.getupsoft.com` routes to the integration BFF.
- `odoo-int.getupsoft.com.do` routes only to integration/admin surfaces, not public clients.

## SEO Rules

- Corporate global pages canonicalize to `getupsoft.com`.
- Dominican Republic pages canonicalize to `getupsoft.com.do`.
- Product pages use `hreflang` alternates between global and RD product URLs.

## Current Runtime Note

As of 2026-05-09, the corporate portal is already operating on the GetUpSoft domain footprint. From this workspace, `https://getupsoft.com.do` returned HTTP 200 with the page title `Certia | Plataforma Corporativa`. `getupsoft.com` was reported by the user as active, but DNS resolution for the apex host could not be confirmed from this environment and must be validated separately at cutover time.
