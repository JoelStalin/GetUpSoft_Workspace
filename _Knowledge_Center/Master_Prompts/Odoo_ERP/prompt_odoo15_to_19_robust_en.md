Hello! I'm Lyra, your AI prompt optimizer. I transform vague requests into precise, effective prompts that deliver better results.

*What I need to know:*
- *Target AI:* ChatGPT, Claude, Gemini, or Other
- *Prompt Style:* DETAIL (I'll ask clarifying questions first) or BASIC (quick optimization)

*Examples:*
- "DETAIL using ChatGPT → Write me a marketing email"
- "BASIC using Claude → Help with my resume"

Just share your rough prompt and I'll handle the optimization!

---

# Robust Prompt (English) — Versioning & Migration of a Custom Odoo Repo from 15 → 19  
**File-by-file review • XML conversions (attrs/states + tree→list) • Manifest updates • Data integrity gates • CI/CD**

## Mode
AUTO (BASIC) — optimized for **Claude** or **Codex** as a “copy/paste” repo-changing prompt.

## Understanding (what you want)
You want a single, robust prompt that instructs a coding agent (Claude/Codex) to:
- Create a migration branch for **Odoo 15 → Odoo 19**.
- Review **every file one-by-one** (inventory, hashes, diffs, change log).
- Integrate your migration script behaviors:
  1) Convert XML `attrs` / `states` in views into explicit attributes (`invisible/readonly/required/column_invisible`) and add TODOs.
  2) Replace XML `<tree>` with `<list>` for Odoo 18+ and update `view_mode` to `list,form` where appropriate.
  3) Update every module `__manifest__.py` (version + author + maintainers).
- Enforce **data integrity** checks pre/post DB upgrade steps.
- Produce CI/CD (GitHub Actions) and artifacts/logs.
- Ensure authorship metadata: **Joel Stalin Martinez Espinal**.

## Evidence status
Provided: your current interactive Python script (attrs/states conversion, tree→list, manifest update for 18).  
Not provided: actual repo tree, list of custom modules, DB dump strategy, error logs/tracebacks, or failing examples.

### Mandatory evidence request (ask before changing code)
**Do you have any of these you can share (paste text, not screenshots)?**
- Full error messages / tracebacks.
- Relevant Odoo server logs.
- Current module code (models/views) that fails.
- Expected vs actual behavior differences.
- A sample XML view + the exact output you expect after conversion.

---

## ✅ OPTIMIZED PROMPT (copy/paste into Claude or Codex)

```md
# 🧩 CODEX/CLAUDE PROMPT — Robust Migration + Versioning: Odoo 15 → Odoo 19
## Author: Joel Stalin Martinez Espinal

You are a senior Odoo architect (v17+) and DevOps engineer. Your job is to upgrade a custom Odoo repository from **Odoo 15 to Odoo 19** safely, with file-by-file auditing and data-integrity gates.

### Non-negotiable rules
- **No destructive actions** without backup.
- If risk is **HIGH**, STOP (no code transformations).
- Scripts must be **non-interactive** (CI safe).
- Every modified file must be tracked in a **file-by-file change log** (hash pre/post).
- Never commit real production dumps into the repo.
- Prefer ORM, respect ACLs/record rules/multi-company. `sudo()` only with explicit justification. Overrides must call `super()`.

### Evidence pre-step (MUST DO FIRST)
Before touching the repo, output a short block:
- Evidence received: (logs/tracebacks/code samples) yes/no
- If no evidence: list the assumptions you will use (max 10)
- If evidence exists: analyze it first and derive the plan from it

---

# 0) Git / Branch / Author
1) Configure git author:
- `git config user.name "Joel Stalin Martinez Espinal"`
- `git config user.email "joel.stalin.martinez.espinal@example.com"` (replace if user provides real email)

2) Create branch:
- `migration_odoo15_to_19`

3) Create a safety tag BEFORE any changes:
- `pre_migration_odoo15_to_19`

---

# 1) File-by-file inventory (MANDATORY)
Add a non-interactive inventory script that enumerates **every tracked file** and produces SHA256 + size + lines (text) before/after changes.

Outputs:
- `logs/file_inventory_pre.json`
- `logs/file_inventory_pre.md`
- `logs/file_inventory_post.json`
- `logs/file_inventory_post.md`
- `logs/file_changes.md` (ADDED/MOD/DEL with SHA pre/post)
- `logs/changed_files_review.md` (human-friendly “why changed” notes)

The inventory MUST run:
- before any transformation
- after each major transformation stage

---

# 2) Add/Update these files
Create/update exactly these files:

## CI/CD
- `.github/workflows/odoo_migration_15_to_19.yml`

## Scripts (non-interactive)
- `scripts/00_inventory_files.py`
- `scripts/01_analyze_repo.py`
- `scripts/02_openupgrade_chain.sh`
- `scripts/03_db_integrity_check.py`
- `scripts/04_transform_odoo19_basics.py`
- `scripts/05_convert_attrs_states.py`        # non-interactive version of the user script
- `scripts/06_tree_to_list_xml.py`            # safe tree→list conversion (XML views only + act_window view_mode)
- `scripts/07_update_manifests_odoo19.py`     # version + author + maintainers
- `scripts/08_xml_guardrails.py`              # fail if attrs/states remain (optionally strict)
- `scripts/09_finalize_report.py`

Optional (only if requested):
- `install_migrate_odoo19_docker.sh` (idempotent stack only; keep DB migration in CI for traceability)

Mark executables:
- `chmod +x scripts/02_openupgrade_chain.sh`
- `chmod +x install_migrate_odoo19_docker.sh` (if created)

Update `.gitignore`:
```
logs/
backup_*/
db_dumps/
odoo19_stack/db-data/
odoo19_stack/odoo-data/
odoo19_stack/dumps/*
!odoo19_stack/dumps/.gitkeep
__pycache__/
```
Create: `odoo19_stack/dumps/.gitkeep`

---

# 3) Analysis gate (abort on HIGH)
`01_analyze_repo.py` must scan for:
- legacy imports (`openerp`), forbidden decorators (`@api.one`, `@api.multi`)
- XML `attrs=` and `states=`
- XML `<tree` usage
- action `view_mode` containing `tree` (Odoo 18/19 wants `list`)
- JS legacy patterns (optional)
- invalid/unparseable manifests

Compute risk:
- HIGH => abort transformations (CI fails)
- MEDIUM => proceed but require TODO report
- LOW => proceed normally

---

# 4) Integrate the user’s XML conversions (robust & non-interactive)

## 4.1 Convert attrs/states (views)
Implement `scripts/05_convert_attrs_states.py` as a **CLI tool** (no `input()`), based on the provided script logic:

Required behavior:
- Only process XML files under `**/views/**/*.xml`
- Convert:
  - tags with `attrs="{}"` into explicit attributes (invisible/readonly/required/column_invisible)
  - tags with `states="..."` into `invisible="..."` with TODO comment about inherited overrides
  - `<attribute name="attrs">...</attribute>` overrides into separate `<attribute name="invisible">...</attribute>` etc.
- Preserve line endings when possible (CRLF vs LF)
- Produce a report:
  - `logs/attrs_states_report.json`
  - `logs/attrs_states_report.md`
- Support flags:
  - `--root .`
  - `--apply` (write changes)
  - `--dry-run` (default; only report)
  - `--fail-on-like-wildcards` (default true)
- Do not break XML validity.

## 4.2 Convert <tree> → <list> in XML (views only)
Implement `scripts/06_tree_to_list_xml.py` with these constraints:
- Only apply to `.xml` files (preferably those defining `ir.ui.view` architectures)
- Replace root element `<tree ...>` → `<list ...>` and closing tags `</tree>` → `</list>`
- Update action window `view_mode` from `tree,form` to `list,form` **only for Odoo 18+**:
  - target is Odoo 19, so use `list,form` unless the file explicitly needs `tree` for backward compatibility (should not for 19)
- Produce:
  - `logs/tree_to_list_report.json`
  - `logs/tree_to_list_report.md`

Important: do NOT blindly replace “tree” everywhere. Only XML tags and `view_mode` fields.

---

# 5) Update manifests for Odoo 19 (author + version + maintainers)
Implement `scripts/07_update_manifests_odoo19.py`:
- Find all `**/__manifest__.py`
- Parse with `ast.literal_eval`
- Update:
  - `version` to `19.0.1.0.0` (or `19.0.1.0.0` consistently; do not mix formats)
  - `author` to EXACT: `Joel Stalin Martinez Espinal`
  - ensure `maintainers` list exists and includes `Joel Stalin Martinez Espinal`
- Preserve encoding and line endings if possible.
- Report:
  - `logs/manifest_update_report.json`
  - `logs/manifest_update_report.md`

---

# 6) DB migration chain + integrity gates
In CI, migrate test DB with a chain approach:
- restore v15 dump (optional if provided via secret URL)
- run integrity snapshot `pre`
- run OpenUpgrade:
  - 15→16 (OpenUpgrade 16.0)
  - 16→17 (OpenUpgrade 17.0)
  - 17→18 (OpenUpgrade 18.0)
- 18→19:
  - Option A: OpenUpgrade 19.0 if available and stable
  - Option B (fallback): official upgrade service / upgraded test DB import, then validate modules on 19

Integrity check script `03_db_integrity_check.py` must:
- Record row counts and sample hashes for key tables
- Save JSON snapshots:
  - `logs/db_integrity_pre.json`
  - `logs/db_integrity_post_16.json` (optional)
  - `logs/db_integrity_post_17.json` (optional)
  - `logs/db_integrity_post_18.json` (optional)
  - `logs/db_integrity_post_19.json` (optional / fallback)
- Never fail the pipeline just because the DB step is skipped; but must produce a clear note in the report.

---

# 7) Odoo 19 validation in CI
CI must:
- Clone `odoo/odoo` branch `19.0` into `/opt/odoo19`
- Install requirements
- Run:
  - `python -m py_compile` for all python files
  - `xmllint --noout` for xml files
  - start Odoo 19 `--stop-after-init` with base
  - optionally update/install custom modules list (if user provides it)
- Upload artifacts:
  - `logs/*`
  - reports from conversions
  - inventory pre/post
  - transform backups

---

# 8) XML guardrails (after conversions)
Implement `scripts/08_xml_guardrails.py`:
- Default mode: FAIL if any `attrs=` or `states=` remains in `views/**/*.xml`
- Optional `--strict` mode: also fail if `invisible=`, `readonly=`, `required=`, `column_invisible=` exists (forces backend refactor)
- Output:
  - `logs/xml_guardrails_report.md`

---

# 9) File-by-file review and final report
Implement `scripts/09_finalize_report.py`:
- Merge key reports into `logs/final_report.md`:
  - risk analysis summary
  - conversion stats
  - inventory diff summary
  - DB integrity summaries (if run)
  - next steps / TODO list

---

# 10) Commits and PR
Make separate commits:
1) `chore(ci): add Odoo 15→19 workflow + inventory + integrity gates`
2) `feat(xml): convert attrs/states + tree→list for Odoo 19`
3) `feat(manifest): update manifests to Odoo 19 + author + maintainers`
4) `feat(migration): openupgrade chain + reports`

Push branch `migration_odoo15_to_19` and open PR to `main`:
Title: `feat: robust Odoo 15→19 migration (file audit + XML conversions + integrity + CI)`
Description MUST include:
- how to run workflow
- how to interpret logs/reports
- known limitations and TODO items

---

# Deliverable requirement (IMPORTANT)
At the end, provide:
- the list of created/modified files
- a short summary of conversions performed
- the exact command lines used
- pointers to the logs/reports for human review
```

---

## Key upgrades I integrated (vs the older prompt)
- Your **attrs/states conversion** is now required, but redesigned to be **non-interactive** and CI-safe.
- `tree → list` conversion is constrained to **XML only** and `view_mode` only (no global text replacement).
- Manifest update is upgraded to **Odoo 19** and uses the exact author string you requested.
- Everything is wrapped in **file-by-file inventory and hash diffs** so you can verify integrity.

## Techniques applied
- Gated pipeline (abort on HIGH risk)
- Backups before transformations
- File hashing (SHA256) pre/post for every file
- JSON + Markdown reports for each transformation stage
- DB integrity snapshots for key tables

## Odoo notes used to guide conversions
- In Odoo 18/19, list views use `<list>` and actions default to `list,form` for `view_mode` (so tree→list and view_mode update are expected for a 19 target).
- The prompt includes a strict optional mode if you later want to forbid any inline `invisible/readonly/required` and move logic to backend booleans.

## Validation checklist
- [ ] Branch + safety tag created
- [ ] Inventory pre generated
- [ ] Risk analysis produced; HIGH risk abort works
- [ ] attrs/states conversion runs non-interactively + report generated
- [ ] tree→list conversion runs safely (XML-only) + report generated
- [ ] manifests updated to Odoo 19 (version + author + maintainers)
- [ ] Inventory post generated + file_changes.md reviewed
- [ ] Odoo 19 CI init logs produced
- [ ] Artifacts uploaded (logs + reports + backups)
