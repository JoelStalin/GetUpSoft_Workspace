# Rollback Runbook

## GitHub

1. Identify the deployed commit or release tag.
2. Revert the offending PR or promote the previous tag.
3. Re-run CI and deployment workflow.
4. Record evidence in the task ledger.

## Cloudflare

1. Export current DNS records before changes.
2. If a route fails, restore previous DNS record content and proxied setting.
3. If a tunnel route fails, disable only the new hostname route.
4. Verify unaffected Galantes Jewelry hostnames still respond.

## Odoo Integration

1. Disable new BFF route through feature flag or route-level denylist.
2. Keep queued sync jobs for replay unless data corruption is suspected.
3. Reconcile Odoo records against external IDs before retrying.

## Evidence

Every rollback must capture:

- Triggering change.
- Restore target.
- Validation command.
- Business impact.
