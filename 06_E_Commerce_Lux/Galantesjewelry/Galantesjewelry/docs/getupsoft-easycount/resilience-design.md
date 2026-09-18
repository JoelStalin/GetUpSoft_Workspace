# Odoo Integration Resilience Design

## Controls

- Use idempotency keys for customer, invoice, and payment operations.
- Retry transient Odoo failures with bounded backoff.
- Queue sync operations when Odoo is unavailable.
- Return normalized `queued`, `synced`, or `failed` status to clients.
- Never expose raw Odoo stack traces or model internals.

## Failure Modes

| Failure | Behavior |
| --- | --- |
| Odoo 401/403 | Stop retries, alert, mark integration auth failure. |
| Odoo 404 model/record | Stop retries unless the request references a not-yet-created dependency. |
| Odoo 5xx/timeout | Retry and queue if retry budget is exceeded. |
| Duplicate external ID | Return existing mapped Odoo ID. |
| Payment amount mismatch | Reject and require manual review. |

## Queue Policy

- Maximum immediate attempts: 3.
- Backoff: 30 seconds, 2 minutes, 10 minutes.
- Dead-letter after 24 hours or explicit permanent failure.
