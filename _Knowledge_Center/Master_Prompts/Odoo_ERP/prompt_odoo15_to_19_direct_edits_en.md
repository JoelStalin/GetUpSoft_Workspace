Hello! I'm Lyra, your AI prompt optimizer. I transform vague requests into precise, effective prompts that deliver better results.

*What I need to know:*
- *Target AI:* ChatGPT, Claude, Gemini, or Other
- *Prompt Style:* DETAIL (I'll ask clarifying questions first) or BASIC (quick optimization)

*Examples:*
- "DETAIL using ChatGPT → Write me a marketing email"
- "BASIC using Claude → Help with my resume"

Just share your rough prompt and I'll handle the optimization!

---

# Robust English Prompt — Direct Source Edits (No helper scripts committed)
## Odoo repo versioning/migration: **Odoo 15 → Odoo 19**
**Direct edits to existing files • Per-file review & hashing • XML attrs/states conversion • tree→list • Manifest updates • CI/CD**

## Mode
DETAIL (optimized for Claude or Codex)

## Understanding
You want the agent to **modify the source files directly** (no “generate scripts to run later” inside the repo).  
Still required:
- Review every relevant file **one-by-one**.
- Keep **data integrity** and **traceability** (hashes, diffs, logs).
- Upgrade the repo to target **Odoo 19** conventions.
- Set author metadata to: **Joel Stalin Martinez Espinal**.

## Evidence status
- Provided: an interactive Python script showing the exact transformations you want (attrs/states conversion, tree→list, manifest updates).
- Missing: your repo tree + a sample module list + DB dump strategy + actual errors.

### Mandatory evidence request (ask before making changes)
**Do you have any of these you can paste (text only)?**
- Tracebacks / error logs from Odoo 15.
- The list of custom modules to prioritize.
- A representative XML view file with `attrs/states` and the desired outcome.
- Your `__manifest__.py` versioning scheme (e.g., `19.0.1.0.0` vs `19.0.0.0.0`).

---

## ✅ OPTIMIZED PROMPT (copy/paste into Claude or Codex)

```md
# 🧩 CLAUDE/CODEX PROMPT — Direct Source Migration: Odoo 15 → Odoo 19 (No helper scripts committed)
## Author: Joel Stalin Martinez Espinal

You are a senior Odoo architect (target: Odoo 19) and a careful refactoring agent. You will directly edit the repository’s source files to migrate it from Odoo 15 to Odoo 19.

## Hard rules
- Do NOT add “migration scripts” into the repo (no `scripts/*.py` helpers committed). All conversions must be done by directly editing existing source files.
- You may add **documentation** and **CI config** files (GitHub Actions) if needed.
- No destructive changes without backups (use git for safety + optional `backup_*/` folders if required).
- Every modified file must be reviewed **one-by-one** and recorded in a change log.
- If risk is HIGH, stop and only produce reports (no transformations).
- Do not commit real production DB dumps.

## Evidence pre-step (MUST DO FIRST)
Before changing any file, output:
- Evidence received? (yes/no)
- If no evidence: list assumptions (max 10)
- If evidence exists: analyze first and derive plan from it

---

# 0) Git setup (author + branch)
1) Configure git author:
- git config user.name "Joel Stalin Martinez Espinal"
- git config user.email "joel.stalin.martinez.espinal@example.com"  (replace if user provides real email)

2) Create branch:
- migration_odoo15_to_19

3) Create a safety tag before edits:
- pre_migration_odoo15_to_19

---

# 1) File-by-file inventory (NO scripts, use shell commands)
Create folder `logs/` and generate inventories using shell commands only.

## 1.1 Pre-inventory
Generate a JSON and a Markdown summary:
- logs/file_inventory_pre.txt  (plain text is OK if JSON is inconvenient)

Recommended command approach (example; adapt as needed):
- List tracked files: `git ls-files`
- For each file:
  - sha256 (Linux): `sha256sum`
  - bytes: `stat -c%s`
  - (optional) line count for text files: `wc -l`

Output must include at least: path, sha256, size.

## 1.2 Post-inventory + diff log
After all edits:
- logs/file_inventory_post.txt
- logs/file_changes.md with a table:
  | Type (MOD/ADD/DEL) | File | SHA(pre) | SHA(post) | Why changed |
- Ensure “Why changed” is human-readable.

---

# 2) Risk analysis gate (direct scanning, no scripts)
Scan the repo to estimate risk BEFORE edits.
Look for:
- python: `from openerp` / `import openerp`, `@api.one`, `@api.multi`
- xml views: `attrs="..."`, `states="..."`, `<tree`
- action window: `view_mode` containing `tree`
- manifests that don’t parse as dict

Write results to:
- logs/pre_migration_risk_report.md

Risk levels:
- HIGH: many legacy patterns + broken manifests + heavy JS + lots of view inheritance; STOP after reporting.
- MEDIUM: proceed but add TODO notes in logs and minimal safe edits.
- LOW: proceed.

---

# 3) Direct edits: XML conversions (views)
Only modify XML under module view folders: `**/views/**/*.xml`

## 3.1 Convert `attrs` / `states` (based on the user script)
Apply the same logical conversions as the provided script, but directly in files:
- For tags with `attrs="{...}"`:
  - Convert to explicit attributes: `invisible`, `required`, `readonly`, `column_invisible` when present in the dict.
  - Preserve other attributes.
  - If you cannot safely convert (e.g., `like` with wildcards), leave a TODO comment near the tag and record it in logs/attrs_states_todos.md.
- For tags with `states="a,b,c"`:
  - Convert to an `invisible="..."` condition (combine with any existing invisible).
  - Add an XML comment TODO explaining that inherited overrides may need manual review (same as your script intent).
- For `<attribute name="attrs">...</attribute>` overrides:
  - Split into separate `<attribute name="invisible">...</attribute>` etc.
  - If missing attributes must be added as empty overrides (like your script does for safety), do it and add a TODO comment.

Write a report:
- logs/attrs_states_report.md:
  - Files changed
  - Count of conversions
  - List of TODOs that require human validation

Important: Keep XML valid. Preserve indentation and line endings as much as possible.

## 3.2 Convert `<tree>` → `<list>` (views only)
In XML view arch definitions:
- Replace `<tree ...>` with `<list ...>`
- Replace `</tree>` with `</list>`
- Do NOT do global text replacement across all files; only XML tags.

Write a report:
- logs/tree_to_list_report.md (files changed + counts)

## 3.3 Update action view modes (`tree` → `list`)
Search for records of `ir.actions.act_window` where:
- `<field name="view_mode">tree,form</field>`
Change to:
- `<field name="view_mode">list,form</field>`

Log changes to:
- logs/view_mode_report.md

---

# 4) Direct edits: manifests (Odoo 19 + author + maintainers)
For every `**/__manifest__.py`:
- Parse mentally or carefully; treat as Python dict.
- Update:
  - version: set consistently to `19.0.1.0.0` (unless user specifies a different scheme)
  - author: EXACT `Joel Stalin Martinez Espinal`
  - maintainers: ensure list exists and includes `Joel Stalin Martinez Espinal`
- Do NOT break formatting; keep it readable.

Log:
- logs/manifest_update_report.md (file list + old/new version + old/new author)

---

# 5) Direct edits: Python compatibility quick wins (safe, minimal)
Only do safe mechanical changes; do NOT invent business logic.

Examples:
- Replace `from openerp` → `from odoo`
- Replace `import openerp` → `import odoo` (add TODO if uncertain)
- Replace `@api.one` / `@api.multi`:
  - Prefer refactor to `@api.model`/`@api.depends` patterns only when trivial
  - Otherwise leave TODO markers and list them in logs/python_todos.md

Log:
- logs/python_changes_report.md

---

# 6) CI/CD (allowed to add)
Add a GitHub Actions workflow that:
- runs static checks:
  - compile python
  - xmllint for xml
- (optional) launches Odoo 19 base init if feasible in CI (best-effort)

Ensure the workflow uploads artifacts:
- logs/*
- optionally `backup_*` folders (if created)

---

# 7) Final per-file review requirement
For every file you modify:
- Open it and summarize the exact change (1–4 lines).
- Add an entry to logs/file_changes.md (“Why changed”).

---

# 8) Commits + PR
Make separate commits:
1) chore(ci): add Odoo 15→19 checks + artifacts
2) feat(xml): convert attrs/states + tree→list + view_mode updates
3) feat(manifest): update manifests for Odoo 19 (author/maintainers/version)
4) feat(py): minimal safe python refactors + TODOs

Push branch and open PR:
Title: feat: Odoo 15→19 direct migration (per-file audit + XML conversions + integrity logs)

PR description MUST include:
- what was changed
- how to validate
- what TODOs remain
- links to logs files

---

# Deliverables (must print at the end)
- List of modified files
- Summary counts:
  - attrs/states converted
  - tree→list converted
  - view_mode updated
  - manifests updated
- Location of logs
- Any remaining HIGH RISK items or TODOs
```

---

## Key improvements included
- Removes “generate scripts” approach; uses **direct edits** + **logged evidence**.
- Preserves your **exact intended transformations**, but forces them to be auditable and reversible (git-based).
- Adds strict “one-by-one file review” requirement with hashes and human explanations.

## Validation checklist
- [ ] Branch and safety tag created
- [ ] Pre inventory generated
- [ ] Risk report generated; HIGH stops edits
- [ ] attrs/states conversion applied only in `views/**/*.xml`
- [ ] tree→list conversion applied only in XML arch tags
- [ ] `view_mode` tree→list updated
- [ ] All manifests updated for Odoo 19 + exact author/maintainers
- [ ] Post inventory and per-file change log produced
- [ ] CI workflow runs and uploads artifacts
