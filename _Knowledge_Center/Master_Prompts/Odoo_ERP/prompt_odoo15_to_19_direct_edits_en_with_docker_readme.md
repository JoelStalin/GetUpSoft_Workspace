Hello! I'm Lyra, your AI prompt optimizer. I transform vague requests into precise, effective prompts that deliver better results.

*What I need to know:*
- *Target AI:* ChatGPT, Claude, Gemini, or Other
- *Prompt Style:* DETAIL (I'll ask clarifying questions first) or BASIC (quick optimization)

*Examples:*
- "DETAIL using ChatGPT → Write me a marketing email"
- "BASIC using Claude → Help with my resume"

Just share your rough prompt and I'll handle the optimization!

---

# Robust English Prompt — Direct Source Edits + Docker (Odoo 19) + README Implementation Guide
## Odoo repo versioning/migration: **Odoo 15 → Odoo 19**
**Direct edits to existing sources • Per-file review & hashing • XML attrs/states conversion • tree→list • Manifest updates • Docker stack for Odoo 19 • README guide**

## Mode
DETAIL (optimized for Claude or Codex)

## Understanding
You want the agent to:
- Modify your **existing source files directly** (no helper migration scripts committed).
- Add **Docker configuration for Odoo 19** (compose stack + basic config).
- Add/Update a **README.md** with a clear implementation/deployment guide **after the repo is pushed**.
- Keep per-file traceability (hash pre/post) and produce logs.

## Evidence status
Provided: the interactive Python script that defines desired transformations.  
Missing: repo tree, module list, runtime requirements (wkhtmltopdf, extra python deps), DB dump path, and any errors.

### Mandatory evidence request (ask before changing files)
**Do you have any of these you can paste (text only)?**
- Odoo server tracebacks/logs.
- Exact custom addons paths and module list.
- Any private dependencies (Enterprise, private pip libs, external binaries).
- Target deployment environment (Linux distro, reverse proxy, domain/SSL, ports).

---

## ✅ OPTIMIZED PROMPT (copy/paste into Claude or Codex)

```md
# 🧩 CLAUDE/CODEX PROMPT — Direct Source Migration + Docker: Odoo 15 → Odoo 19
## Author: Joel Stalin Martinez Espinal

You are a senior Odoo architect (target: Odoo 19) and a careful refactoring agent. You will directly edit the repository’s source files to migrate it from Odoo 15 to Odoo 19, and add Docker deployment configuration + a README implementation guide.

## Hard rules
- Do NOT add migration helper scripts into the repo (no `scripts/*.py` that must be executed later). All conversions must be done by directly editing existing source files.
- You MAY add CI files, Docker files, and documentation (README).
- No destructive changes without backup (use git tag + optional `backup_*/` directories if needed).
- Every modified file must be reviewed **one-by-one** and recorded in a change log.
- If risk is HIGH, stop and only produce reports (no transformations).
- Do not commit real production DB dumps.
- Prefer ORM, respect ACLs/record rules/multi-company. `sudo()` only with explicit justification. Overrides must call `super()`.

## Evidence pre-step (MUST DO FIRST)
Before changing any file, output:
- Evidence received? (yes/no)
- If no evidence: list assumptions (max 10)
- If evidence exists: analyze first and derive plan from it

---

# 0) Git setup (author + branch)
1) Configure git author:
- `git config user.name "Joel Stalin Martinez Espinal"`
- `git config user.email "joel.stalin.martinez.espinal@example.com"` (replace if user provides real email)

2) Create branch: `migration_odoo15_to_19`
3) Create safety tag: `pre_migration_odoo15_to_19`

---

# 1) File-by-file inventory (NO scripts, use shell commands)
Create folder `logs/` and generate inventories using shell commands only.

## 1.1 Pre-inventory
Create: `logs/file_inventory_pre.txt` containing at minimum:
- file path
- sha256
- size bytes

Use approach:
- `git ls-files` to get tracked files
- for each: `sha256sum`, `stat -c%s`

## 1.2 Post-inventory + diff log
After all edits:
- `logs/file_inventory_post.txt`
- `logs/file_changes.md` table:
  | Type (MOD/ADD/DEL) | File | SHA(pre) | SHA(post) | Why changed |

Also create:
- `logs/changed_files_review.md` with 1–4 lines per modified file summarizing what changed.

---

# 2) Risk analysis gate (direct scanning, no scripts)
Scan BEFORE edits for:
- python: `from openerp` / `import openerp`, `@api.one`, `@api.multi`
- xml views: `attrs="..."`, `states="..."`, `<tree`
- action windows: `view_mode` containing `tree`
- manifests that don’t parse as dict (broken syntax)

Write to: `logs/pre_migration_risk_report.md`
If HIGH risk: STOP after reporting (no transformations).

---

# 3) Direct edits: XML conversions (views)
Only modify XML under: `**/views/**/*.xml`

## 3.1 Convert `attrs` / `states` to explicit attributes (based on user script logic)
Apply the same logical conversions as the provided script:
- tags with `attrs="{...}"`:
  - convert to explicit `invisible/required/readonly/column_invisible` expressions
  - preserve other attributes
  - if conversion is unsafe (e.g., `like` with wildcards), leave TODO comment + log in `logs/attrs_states_todos.md`
- tags with `states="a,b,c"`:
  - convert to `invisible="..."` condition
  - combine with existing invisible if present
  - add an XML TODO comment about inherited overrides needing review
- `<attribute name="attrs">...</attribute>` overrides:
  - split into separate `<attribute name="invisible">...</attribute>` etc
  - add safe empty overrides when needed (and TODO comment) to avoid hidden future behavior changes

Produce report: `logs/attrs_states_report.md` (files changed, counts, TODOs)

## 3.2 Convert `<tree>` → `<list>` (views only)
In view arch XML:
- `<tree>` → `<list>`
- `</tree>` → `</list>`
Do NOT do global text replacement.

Report: `logs/tree_to_list_report.md`

## 3.3 Update action `view_mode` tree→list (Odoo 19 target)
Find `ir.actions.act_window` records:
- `<field name="view_mode">tree,form</field>` → `<field name="view_mode">list,form</field>`
Also handle `tree,kanban,form` → `list,kanban,form`, etc.

Report: `logs/view_mode_report.md`

---

# 4) Direct edits: manifests (Odoo 19 + author + maintainers)
For every `**/__manifest__.py`:
- Update:
  - `version` to `19.0.1.0.0` (unless user specifies otherwise)
  - `author` EXACT: `Joel Stalin Martinez Espinal`
  - ensure `maintainers` list exists and includes `Joel Stalin Martinez Espinal`
- Keep formatting readable and valid Python dict.

Report: `logs/manifest_update_report.md`

---

# 5) Direct edits: Python compatibility quick wins (safe/minimal)
Mechanical, low-risk changes only:
- `from openerp` → `from odoo`
- `import openerp` → `import odoo` (add TODO if uncertain)
- `@api.one` / `@api.multi`:
  - only refactor when trivial and clearly correct
  - otherwise add TODO + log in `logs/python_todos.md`

Report: `logs/python_changes_report.md`

---

# 6) Add Docker configuration for Odoo 19 (NEW FILES ALLOWED)
Add a Docker Compose setup to run Odoo 19 + Postgres, mounting this repo’s custom addons.

Create files:
- `docker-compose.yml`
- `odoo.conf`
- `.env.example`
- Update `README.md`

## 6.1 docker-compose.yml (recommended minimal)
Create `docker-compose.yml` at repo root:

```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-odoo19}
      POSTGRES_USER: ${POSTGRES_USER:-odoo}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-odoo}
    volumes:
      - odoo19-db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "${POSTGRES_USER:-odoo}"]
      interval: 5s
      timeout: 5s
      retries: 20

  odoo:
    image: odoo:19.0
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "${ODOO_PORT:-8069}:8069"
    environment:
      HOST: db
      USER: ${POSTGRES_USER:-odoo}
      PASSWORD: ${POSTGRES_PASSWORD:-odoo}
    volumes:
      - odoo19-web-data:/var/lib/odoo
      - ./odoo.conf:/etc/odoo/odoo.conf:ro
      - ./custom_addons:/mnt/extra-addons:rw
      # Add more mounts if your repo uses more addon roots:
      # - ./addons:/mnt/extra-addons/addons:rw
      # - ./other_addons:/mnt/extra-addons/other_addons:rw

volumes:
  odoo19-db-data:
  odoo19-web-data:
```

If your repo does not have `custom_addons/`, detect the correct folder (common: `addons/`, `custom_addons/`, `extra-addons/`) and update compose accordingly.

## 6.2 odoo.conf (basic)
Create `odoo.conf`:

```ini
[options]
admin_passwd = ${ODOO_ADMIN_PASSWD}
db_host = db
db_port = 5432
db_user = ${POSTGRES_USER}
db_password = ${POSTGRES_PASSWORD}
addons_path = /usr/lib/python3/dist-packages/odoo/addons,/mnt/extra-addons
without_demo = True
proxy_mode = True
limit_time_cpu = 600
limit_time_real = 1200
```

Note: if env interpolation is not supported in your config file runtime, instruct the user to place real values into `odoo.conf` or pass them via command/entrypoint; document this in README.

## 6.3 .env.example
Create `.env.example` (do not create `.env` with secrets):
```
POSTGRES_DB=odoo19
POSTGRES_USER=odoo
POSTGRES_PASSWORD=change_me
ODOO_PORT=8069
ODOO_ADMIN_PASSWD=change_me_admin
```

Update `.gitignore` to include `.env`.

---

# 7) README.md — Implementation guide (especially “after pushing”)
Create/Update README.md including:

## 7.1 Quick start (local)
1) `cp .env.example .env`
2) edit `.env` (set strong passwords)
3) `docker compose up -d`
4) open http://localhost:8069

## 7.2 Install / Update modules
- how to set addons path
- how to install modules (Apps UI)
- optional: command snippet to update modules:
  - `docker compose exec odoo odoo -d <db> -u <module> --stop-after-init`

## 7.3 After pushing to GitHub
- enable GitHub Actions
- add secrets (if CI uses them)
- run workflows
- download artifacts
- review:
  - logs/file_changes.md
  - logs/attrs_states_report.md + TODOs
  - logs/manifest_update_report.md
  - CI logs

## 7.4 Production notes
- use external Postgres
- backups
- reverse proxy / SSL
- do not use default passwords

---

# 8) Commits + PR
Separate commits:
1) `chore(docker): add Odoo 19 docker compose + env example + odoo.conf`
2) `docs(readme): add implementation guide (local + after push)`
3) `feat(xml): attrs/states conversion + tree→list + view_mode updates`
4) `feat(manifest): update manifests to Odoo 19 (author/maintainers/version)`
5) `feat(py): minimal safe python refactors + TODO logs`

Push branch and open PR:
Title: `feat: Odoo 15→19 migration + Docker Odoo19 + README guide`

PR must include:
- summary of changes
- how to run docker
- where to find logs/reports
- list of TODOs requiring human validation

---

# Deliverables (must output at end)
- List of modified/created files
- Counts of conversions (attrs/states, tree→list, view_mode)
- Manifests updated count
- Where to find logs
- Any remaining high-risk items / TODOs
```

---

## Checklist
- [ ] Pre/post inventories generated with hashes
- [ ] One-by-one file change notes written
- [ ] XML conversions applied only in `views/**/*.xml`
- [ ] tree→list + view_mode updated correctly
- [ ] manifests updated (author/version/maintainers)
- [ ] Docker compose stack added for Odoo 19 + .env.example + odoo.conf
- [ ] README includes “After pushing to GitHub” section
