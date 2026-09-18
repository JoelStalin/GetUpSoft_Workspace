# Benchmark: Headless + Odoo API Pattern

## Pattern Compared

1. Browser-to-Odoo direct API.
2. Next.js API routes as thin proxy.
3. Dedicated BFF/API gateway.

## Recommendation

Use a dedicated BFF/API gateway. It provides the best security and operational boundary for EasyCount while allowing the corporate site and product platform to evolve independently.

## Tradeoffs

| Pattern | Upside | Downside |
| --- | --- | --- |
| Browser direct | Fewer moving parts | Exposes Odoo shape and increases security risk. |
| Thin proxy | Fast initial delivery | Tends to leak Odoo coupling into frontend. |
| Dedicated BFF | Strong boundary and resilience | Requires service ownership and monitoring. |

## Applied Blueprint

- Frontend apps call BFF.
- BFF owns OpenAPI v1.
- BFF calls Odoo JSON-2.
- Odoo remains source of truth.
- Infrastructure repo owns DNS, tunnels, env promotion, and observability.
