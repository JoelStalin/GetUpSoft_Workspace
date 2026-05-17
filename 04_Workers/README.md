# Workers

This folder is the target architecture area for reusable GetUpSoft workers.

Existing workers remain in their current paths until `migration_manifest.md` approves a controlled move.

## Worker categories

- ai_workers
- odoo_workers
- payment_workers
- notification_workers
- scraping_workers
- sync_workers
- document_workers
- reporting_workers
- infrastructure_workers
- printer_workers
- data_migration_workers
- network_workers

## Rules

- Every worker must have a Worker Contract before migration.
- Workers must be reusable when possible.
- Workers must not depend on Client Solutions.
- Client-specific logic should live in Client Solutions or adapters.
- Workers must not contain secrets.
- Workers must expose: trigger, input contract, output contract, retry policy, logging rules, and deployment target.
