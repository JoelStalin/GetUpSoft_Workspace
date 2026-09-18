# Cloudflare Provisioning Report

Date: 2026-05-09

## Intended Records

| Zone | Record | Target |
| --- | --- | --- |
| `getupsoft.com` | `getupsoft.com` | `ssh.getupsoft.com.do` |
| `getupsoft.com` | `www.getupsoft.com` | `ssh.getupsoft.com.do` |
| `getupsoft.com` | `easycount.getupsoft.com` | `ssh.getupsoft.com.do` |
| `getupsoft.com` | `admin.getupsoft.com` | `ssh.getupsoft.com.do` |
| `getupsoft.com` | `api.getupsoft.com` | `ssh.getupsoft.com.do` |
| `getupsoft.com.do` | `getupsoft.com.do` | `ssh.getupsoft.com.do` |
| `getupsoft.com.do` | `www.getupsoft.com.do` | `ssh.getupsoft.com.do` |
| `getupsoft.com.do` | `easycount.getupsoft.com.do` | `ssh.getupsoft.com.do` |
| `getupsoft.com.do` | `admin.getupsoft.com.do` | `ssh.getupsoft.com.do` |
| `getupsoft.com.do` | `stg.getupsoft.com.do` | `ssh.getupsoft.com.do` |
| `getupsoft.com.do` | `odoo-int.getupsoft.com.do` | `ssh.getupsoft.com.do` |

## Deployment Server

All hostnames must route to workloads isolated on `ssh.getupsoft.com.do`. Targets should resolve to the dedicated GetUpSoft/EasyCount localhost ports or an isolated reverse proxy managed by `getupsoft-infra`; they must not route to Galantes containers, `galantes-staging`, or shared compose projects.

## Automation

Use `scripts/provision-getupsoft-cloudflare.ps1` with:

- `CF_API_TOKEN` or secure token input
- `CF_ACCOUNT_ID`
- optional `CF_ZONE_ID_GETUPSOFT_COM`
- optional `CF_ZONE_ID_GETUPSOFT_COM_DO`

## Current Status

The corporate portal is already operating on the GetUpSoft domain footprint. From this workspace, `https://getupsoft.com.do` returned HTTP 200 and served the title `Certia | Plataforma Corporativa`.

The shared host itself is now router-ready for both `.com.do` and `.com` variants even without DNS changes. On 2026-05-09, `/opt/EasyCounting/deploy/server/nginx.conf` on `ssh.getupsoft.com.do` was updated and reloaded so the local reverse proxy now serves:

- `getupsoft.com.do`, `getupsoft.com`, `www.getupsoft.com`
- `admin.getupsoft.com.do`, `admin.getupsoft.com`
- `easycount.getupsoft.com.do`, `easycount.getupsoft.com`

Internal host-header validation against `http://127.0.0.1:80` returned HTTP 200 for all six routes with the expected Certia portal titles.

The local Cloudflare token available in `.env` returned HTTP 400 for zone lookups, including the known existing Galantes zone. Live Cloudflare provisioning is therefore still blocked until a valid token is supplied.

Required token scopes:

- `Zone:Read`
- `Zone:DNS:Edit`
- `Account:Cloudflare Tunnel:Edit`

The token should be limited to the GetUpSoft zones where possible.
