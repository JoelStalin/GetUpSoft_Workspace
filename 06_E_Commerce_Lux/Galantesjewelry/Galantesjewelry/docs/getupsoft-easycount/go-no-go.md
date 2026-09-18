# Go/No-Go Checklist

## Phase 1: Foundations

- [ ] Repositories exist and are private.
- [ ] CI workflows exist in every repo.
- [ ] Required variables/secrets are documented.
- [ ] ADRs are approved.
- [x] Corporate portal is live on the current GetUpSoft domain footprint.

## Phase 2: Integration

- [ ] OpenAPI v1 is validated.
- [ ] BFF calls Odoo JSON-2 only from server-side code.
- [ ] Idempotency and error redaction are covered by tests.
- [ ] Odoo unavailable path is handled.

## Phase 3: Environment

- [ ] Cloudflare records point to intended targets.
- [ ] Staging deploy is isolated from production data.
- [ ] Secret rotation path is documented.
- [ ] Smoke tests pass on staging.

## Phase 4: Production

- [ ] Production release has backup and rollback target.
- [ ] Security baseline passes.
- [ ] Observability alerts are active.
- [ ] Business owner signs off.
