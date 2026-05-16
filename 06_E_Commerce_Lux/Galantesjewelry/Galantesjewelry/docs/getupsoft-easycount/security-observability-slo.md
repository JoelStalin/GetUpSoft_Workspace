# Security, Observability, And SLO Baseline

## Security Baseline

- Server-side BFF is the only Odoo caller.
- All inbound payloads use schema validation.
- Auth, admin, and sync endpoints use rate limits.
- Production errors omit stack traces and secrets.
- CORS and OAuth callbacks are explicit per environment.

## Observability

- Structured logs include request ID, external ID, sync status, and Odoo correlation fields.
- Metrics include request count, latency, Odoo error rate, queue depth, and sync retry count.
- Alerts fire on sustained 5xx, Odoo auth failure, queue backlog, and failed payment/invoice sync.

## Initial SLO

| Capability | Target |
| --- | --- |
| Public web availability | 99.5% monthly |
| BFF availability | 99.5% monthly |
| Odoo sync latency | 95% under 60 seconds when Odoo is healthy |
| Critical sync error response | Alert within 5 minutes |
