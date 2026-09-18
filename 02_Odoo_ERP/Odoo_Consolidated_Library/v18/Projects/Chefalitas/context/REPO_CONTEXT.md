# Repo Context - Chefalitas

Last updated: 2026-03-25 19:51:18 -04:00
Repository path: `C:\Users\yoeli\Documents\Chefalitas`
Branch: `main`
HEAD: `7d2bc01cb44867a57393d63e71b3d74e939cb645`

## 1) Project Purpose

This repository deploys Odoo 18 for Chefalitas with:
- PostgreSQL 15
- Nginx reverse proxy
- Certbot certificate renewals
- pgAdmin
- Custom addons in `addons/`

Main domain documented in README: `chefalitas.com.do`.

## 2) Top-level Structure

- `.github/` GitHub Actions workflows
- `addons/` custom Odoo addons
- `backups/` backup and restore scripts
- `config/` Odoo config (`odoo.conf`)
- `nginx/` nginx conf, ssl mount, certbot webroot
- `odoo/` Dockerfile and Odoo image customizations
- `postgres-config/` PostgreSQL config files
- `tmp/` local temporary files / test artifacts
- `restart.sh` rebuild/restart helper
- `docker-compose.yml` full stack runtime
- `docker-compose.local-restore.yml` local-only runtime override for restored production data using alternate host ports

Total tracked files discovered via `rg --files`: 179.

## 3) Runtime Architecture (docker-compose)

Services:
- `odoo` image `chefalitas-odoo:18.0` (built from `odoo/Dockerfile`)
- `db` image `postgres:15`
- `nginx` image `nginx:stable`
- `certbot` image `certbot/certbot`
- `pgadmin` image `dpage/pgadmin4`

Network:
- `odoo-net` (bridge)

Persistent volumes:
- `odoo-data`
- `postgres-data`
- `pgadmin-data`

Key mounts:
- `./addons -> /mnt/extra-addons`
- `./config/odoo.conf -> /etc/odoo/odoo.conf`
- `./logs -> /var/log/odoo`
- `./nginx/ssl -> /etc/letsencrypt`

## 4) Odoo Config Highlights (`config/odoo.conf`)

- DB host: `db`
- DB user: `odoo`
- workers: `3`
- proxy mode: `True`
- addons path includes `/mnt/extra-addons`
- CORS enabled globally (`cors = True`, `cors_origins = *`)

## 5) Custom Addons

Current addon directories:
- `l10n_do_accounting`
- `l10n_do_accounting_report`
- `pos_kitchen_core`
- `pos_printing_suite`
- `pos_system`

Manifest snapshot:
- `l10n_do_accounting` v18.0.1.0.0, category Localization
- `l10n_do_accounting_report` v18.0.1.0.0, category Accounting
- `pos_kitchen_core` v18.0.1.0.0, category Point of Sale
- `pos_printing_suite` v18.0.1.0.0, category Sales/Point of Sale
- `pos_system` v1.0.0, category Punto de Venta

Notable addon dependency file:
- `addons/requirements.txt` installs `debugpy`, `werkzeug`, `pycountry`

## 6) CI/CD and Deploy

Workflow file: `.github/workflows/deploy.yml`

Branch behavior:
- `main`: uploads only `addons/` when addon changes are detected, then runs `restart.sh`.
- `main-full`: uploads full project to temp dir, swaps into `~/odoo18`, then runs `restart.sh`.

Remote deploy flow uses SSH/SCP actions (`appleboy/*`) and production secrets:
- `PROD_SSH_HOST`
- `PROD_SSH_USER`
- `PROD_SSH_KEY`

## 7) Operations Runbook

Restart app service:
```bash
cd ~/odoo18
./restart.sh
```

Create backup:
```bash
cd ~/odoo18/backups
./backup_odoo18.sh
```

Restore last backup:
```bash
cd ~/odoo18/backups
./restore_odoo18.sh
```

Start restored local stack with production data on alternate ports:
```powershell
docker compose -p odoo18 -f docker-compose.local-restore.yml up -d
```

Local restored service ports (to avoid conflicts on this workstation):
- Odoo: `http://127.0.0.1:18069/web/login?db=chefalitas`
- Nginx HTTP: `http://127.0.0.1:28080`
- Nginx HTTPS: `https://127.0.0.1:28443`
- PostgreSQL: `127.0.0.1:15432`
- pgAdmin: `http://127.0.0.1:15050`

Local restore snapshot created from production on `2026-03-25 18:56:34 -04:00`:
- Production backup artifacts: `backups/prod_sync_2026-03-25_18-56-34/`
- Local pre-sync safety backup: `backups/local_presync_2026-03-25_18-56-34/`

Close all open POS sessions in production (`chefalitas` SSH alias):
```powershell
$script = @'
sessions = env["pos.session"].search([("state","!=","closed")])
print("before_open", len(sessions))
for s in sessions:
    try:
        s.action_pos_session_closing_control()
        env.cr.commit()
        print(f"closed {s.id} {s.name}")
    except Exception as e:
        env.cr.rollback()
        print(f"error {s.id} {s.name}: {e}")
print("after_open", env["pos.session"].search_count([("state","!=","closed")]))
'@
$script | ssh chefalitas "docker exec -i odoo18-odoo-1 odoo shell -d chefalitas --no-http -c /etc/odoo/odoo.conf"
```

## 8) Current Working Tree State (when context was generated)

Modified files:
- `.gitignore`
- `addons/pos_printing_suite/INSTALLER.md`
- `addons/pos_printing_suite/agent_src/local_printer_agent/installer/wix/Product.wxs`
- `addons/pos_printing_suite/controllers/agent.py`

Context files added in this request:
- `AGENTS.md`
- `context/README.md`
- `context/LONG_TERM_MEMORY.md`
- `context/REPO_CONTEXT.md`
- `context/scripts/add_memory.ps1`

## 9) Resume Checklist for Next Session

1. Read latest rows in `context/LONG_TERM_MEMORY.md`.
2. Check `git status --short`.
3. If working on POS printing installer, inspect:
   - `addons/pos_printing_suite/controllers/agent.py`
   - `addons/pos_printing_suite/INSTALLER.md`
   - `addons/pos_printing_suite/agent_src/local_printer_agent/installer/wix/Product.wxs`
4. If operational task on production, use SSH alias `chefalitas`.

## 10) Latest Printing Findings

- Selenium functional probe on `https://chefalitas.com.do/pos/web?config_id=1` with and without `debug=assets` showed the same runtime blocker:
  - Browser blocked requests from HTTPS origin to `http://127.0.0.1:9060/print` (`loopback` address-space restriction).
- Evidence is stored in:
  - `tmp/probe_debug_legacy_summary.json`
  - `tmp/probe_*.png`
- Legacy stability improvements added in code:
  - explicit POS/self-order JS entrypoints in `pos_printing_suite`
  - legacy asset compatibility key (`point_of_sale.assets`) in module manifest
  - local PDF receiver dev tool:
    - `addons/pos_printing_suite/agent_src/local_printer_agent/tools/legacy_pdf_receiver.py`
