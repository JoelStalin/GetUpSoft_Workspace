# n8n-workflows Reference Map

Source repository: `Zie619/n8n-workflows`

Integrated source pack:

- `n8n-workflows-integration.md`

Repository-level facts from the README:

- About 4,343 workflows.
- About 365 integrations.
- 15 organized categories.
- SQLite FTS5 search and export-first browsing.
- AI-BOM warning in the repo highlights the need to review workflow JSON for hardcoded secrets, MCP clients, unauthenticated webhooks, and dangerous tool chains.

## What matters for Orca

The repo is useful as a pattern library, not as a blind import source. For Orca we should reuse:

- Category-based workflow browsing.
- Trigger-to-action graph structure.
- Searchable workflow metadata.
- Security review before execution.
- Exportable JSON as the canonical exchange format.

## Workflows and categories to study first

### Design / Creative

- `Figma`
- `Bannerbear`
- `Editimage`
- `Flow`
- `Converttofile`
- `Form`

Use these as references for:

- visual production requests;
- asset generation;
- static preview creation;
- prompt-to-artifact pipelines.

### Backend / Integration

- `Http`
- `Graphql`
- `Github`
- `Gitlab`
- `Jira`
- `Hubspot`
- `Airtable`
- `Baserow`

Use these as references for:

- API orchestration;
- service-to-service routing;
- CRUD persistence;
- issue tracking;
- CRM sync;
- DB-backed workflows.

### Automation / Orchestration

- `Cron`
- `Executeworkflow`
- `Filter`
- `Code`
- `Error`
- `Debughelper`

Use these as references for:

- branching;
- retries;
- guardrails;
- subworkflow composition;
- failure handling.

### Docs / Knowledge

- `Googledocs`
- `Googledrive`
- `Googlesheets`
- `Googleslides`
- `Converttofile`
- `Form`

Use these as references for:

- brief ingestion;
- memory export;
- source packs;
- NotebookLM-ready bundles;
- stakeholder documentation.

### Sales / Client Ops

- `Calendly`
- `Chargebee`
- `Clickup`
- `Asana`
- `Customerio`
- `Gmail`
- `Googlecalendar`
- `Gmailtool`

Use these as references for:

- lead capture;
- scheduling;
- customer follow-up;
- handoff workflows;
- operational reminders.

## Recommended Orca mapping

### `research-worker`

Study:

- `Http`
- `Googledrive`
- `Googledocs`
- `Github`
- `Jira`

### `architecture-worker`

Study:

- `Executeworkflow`
- `Filter`
- `Code`
- `Error`

### `design-worker`

Study:

- `Figma`
- `Bannerbear`
- `Editimage`
- `Flow`

### `backend-worker`

Study:

- `Http`
- `Graphql`
- `Github`
- `Gitlab`
- `Airtable`

### `frontend-worker`

Study:

- `Form`
- `Converttofile`
- `Googlefonts` if present in repo variants
- `Static asset generation` patterns

### `testing-worker`

Study:

- `Debughelper`
- `Error`
- `Executeworkflow`
- `Code`

### `memory`

Study:

- `Googledocs`
- `Googledrive`
- `Googlesheets`
- `Converttofile`

## Workflows to avoid copying directly

- Any workflow with hardcoded secrets.
- Any unauthenticated webhook with external side effects.
- Any AI-agent chain with code execution and no approval gate.
- Any MCP client that connects to unknown servers.

## Practical use in Orca

Use this repo as the source for:

- node taxonomy;
- edge patterns;
- naming conventions;
- quality gates;
- workflow documentation structure;
- searchable workflow library UX.

Treat it as a curated pattern source alongside:

- `https://github.com/davidhckh/portfolio-2025`
- Orca's own workflow blueprints and memory exports.
