# Deployment Isolation Standard

Server: `ssh.getupsoft.com.do`

This server hosts other projects. GetUpSoft and EasyCount deployments must use dedicated paths, Docker project names, networks, volumes, and localhost-only ports so they do not interfere with existing stacks.

## Remote Paths

| Repository | Remote path |
| --- | --- |
| `getupsoft-web` | `/srv/getupsoft/getupsoft-web` |
| `easycount-platform` | `/srv/getupsoft/easycount-platform` |
| `getupsoft-odoo-integration` | `/srv/getupsoft/getupsoft-odoo-integration` |
| `getupsoft-admin-portals` | `/srv/getupsoft/getupsoft-admin-portals` |
| `getupsoft-infra` | `/srv/getupsoft/getupsoft-infra` |

Do not deploy GetUpSoft/EasyCount into any `galantes*` directory.

## Docker Compose Isolation

| App | Compose project | Network | Localhost port |
| --- | --- | --- | --- |
| GetUpSoft web prod | `getupsoft-web-prod` | `getupsoft-web-prod-net` | `127.0.0.1:3120` |
| GetUpSoft web staging | `getupsoft-web-stg` | `getupsoft-web-stg-net` | `127.0.0.1:3110` |
| EasyCount prod | `easycount-prod` | `easycount-prod-net` | `127.0.0.1:3200` |
| EasyCount staging | `easycount-stg` | `easycount-stg-net` | `127.0.0.1:3210` |
| Odoo integration prod | `getupsoft-odoo-int-prod` | `getupsoft-odoo-int-prod-net` | `127.0.0.1:3300` |
| Odoo integration staging | `getupsoft-odoo-int-stg` | `getupsoft-odoo-int-stg-net` | `127.0.0.1:3310` |
| Admin portals prod | `getupsoft-admin-portals-prod` | `getupsoft-admin-portals-prod-net` | `127.0.0.1:3400` |
| Admin portals staging | `getupsoft-admin-portals-stg` | `getupsoft-admin-portals-stg-net` | `127.0.0.1:3410` |

Rules:

- Do not use `container_name` unless it is globally unique and prefixed with `getupsoft_` or `easycount_`.
- Bind public app ports to `127.0.0.1`, not `0.0.0.0`.
- Use project-scoped named volumes only.
- Run `docker compose -p <project>` for every command.
- Never run `docker compose down --remove-orphans` outside the app's own remote path and project name.

## Reverse Proxy And Cloudflare

Cloudflare/tunnel routing should target localhost ports or an isolated reverse proxy owned by `getupsoft-infra`:

| Hostname | Target |
| --- | --- |
| `getupsoft.com` | `http://127.0.0.1:3120` |
| `getupsoft.com.do` | `http://127.0.0.1:3120` |
| `easycount.getupsoft.com` | `http://127.0.0.1:3200` |
| `easycount.getupsoft.com.do` | `http://127.0.0.1:3200` |
| `admin.getupsoft.com` | `http://127.0.0.1:3400` |
| `admin.getupsoft.com.do` | `http://127.0.0.1:3400` |
| `api.getupsoft.com` | `http://127.0.0.1:3300` |
| `stg.getupsoft.com.do` | staging reverse proxy or `http://127.0.0.1:3110` |

## Current Shared-Host Routing

As of 2026-05-09, the live shared host is already serving the GetUpSoft portals from the existing `server` compose project under `/opt/EasyCounting/deploy/server`.

- Active router file: `/opt/EasyCounting/deploy/server/nginx.conf`
- Active container: `server-nginx-1`
- Verified host-based routes on `127.0.0.1:80`:
  - `getupsoft.com.do` -> `Certia | Plataforma Corporativa`
  - `admin.getupsoft.com.do` -> `Certia | Portal de Administración`
  - `easycount.getupsoft.com.do` -> `Certia | Portal de Clientes`

On 2026-05-09, the shared-host router was extended without recreating the full stack so these additional aliases now resolve correctly inside nginx as well:

- `getupsoft.com`
- `www.getupsoft.com`
- `admin.getupsoft.com`
- `easycount.getupsoft.com`

This was applied by updating only `/opt/EasyCounting/deploy/server/nginx.conf` and reloading only `server-nginx-1`. No unrelated Docker projects were restarted.

## Predeploy Safety Checks

Before deploying to `ssh.getupsoft.com.do`:

- Confirm current Docker projects: `docker compose ls`.
- Confirm chosen localhost ports are free: `ss -ltnp`.
- Confirm target path is under `/srv/getupsoft/`.
- Back up any existing `.env`, `data/`, and app volume references in the target path only.
- Do not stop or prune containers from unrelated projects.

## GitHub Variables

Non-secret variables for all GetUpSoft/EasyCount repos:

- `DEPLOY_SSH_HOST=ssh.getupsoft.com.do`
- `REMOTE_BASE_DIR=/srv/getupsoft`
- `GETUPSOFT_WEB_PROJECT=getupsoft-web-prod`
- `EASYCOUNT_PROJECT=easycount-prod`
- `ODOO_INTEGRATION_PROJECT=getupsoft-odoo-int-prod`
- `ADMIN_PORTALS_PROJECT=getupsoft-admin-portals-prod`

Secret values remain in GitHub secrets or server-side secret stores.
