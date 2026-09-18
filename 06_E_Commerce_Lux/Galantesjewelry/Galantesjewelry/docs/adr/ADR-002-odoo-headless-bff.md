# ADR-002: Odoo Headless Integration Pattern

Date: 2026-05-09
Status: Accepted

## Decision

Use a BFF/API integration layer in `getupsoft-odoo-integration`. Web and product frontends must not call Odoo directly.

## API Boundary

- Frontends call `/api/v1/*` on the BFF.
- The BFF calls Odoo JSON-2 using bearer token authentication.
- The BFF owns validation, idempotency, rate limiting, response normalization, retries, and error redaction.
- Odoo remains the system of record for customers, invoices, payments, appointment records, and accounting state.

## Rationale

The BFF hides Odoo model details from public clients, centralizes security controls, and allows graceful degradation when Odoo is slow or unavailable.

## Consequences

- Product teams depend on OpenAPI contracts rather than Odoo internals.
- Integration failures can be retried or queued without exposing Odoo to the browser.
- More operational ownership is required for the BFF, including observability and SLOs.
