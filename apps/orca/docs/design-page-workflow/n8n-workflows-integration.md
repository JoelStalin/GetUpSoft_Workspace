# n8n-workflows Integration Manifest

Source repository:

- `https://github.com/Zie619/n8n-workflows`

Purpose:

- Use the repository as a pattern library for n8n workflow structure, category naming, trigger/action chains, and operational guardrails.

Integration mode:

- `reference_only`
- `pattern_mining`
- `no_blind_import`

## What Orca should ingest from this source

- Workflow topology.
- Trigger and node taxonomies.
- Export/import JSON shape.
- Security warnings and failure patterns.
- Search and catalog UX patterns.

## What Orca should not ingest blindly

- Secrets in workflow JSON.
- Unauthenticated webhooks.
- Workflows that connect AI agents to code execution without human approval.
- Unknown MCP clients or external servers without vetting.

## Recommended categories

- `Figma`
- `Form`
- `Http`
- `Cron`
- `Executeworkflow`
- `Github`
- `Googledrive`
- `Googledocs`
- `Googlesheets`
- `Jira`
- `Hubspot`
- `Airtable`
- `Baserow`
- `Bannerbear`
- `Editimage`

## Orca mapping

- `research-worker`: learn workflow metadata and source references.
- `architecture-worker`: learn branching and subworkflow structure.
- `design-worker`: learn visual/presentation workflow patterns.
- `backend-worker`: learn integration and HTTP/API chaining.
- `frontend-worker`: learn document and asset generation outputs.
- `testing-worker`: learn validation, debug, and error-handling patterns.
- `memory`: preserve the lessons as searchable notes.

