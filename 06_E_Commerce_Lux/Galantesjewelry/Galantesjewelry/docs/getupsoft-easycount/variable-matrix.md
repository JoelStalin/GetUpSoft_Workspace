# Environment Variable Matrix

| Variable | Scope | Secret | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | web/product | No | Public canonical URL for each app. |
| `NEXT_PUBLIC_ADMIN_URL` | web/product | No | Public admin URL when applicable. |
| `CORS_ORIGINS` | BFF | No | Comma-separated allowlist per environment. |
| `ODOO_BASE_URL` | BFF | No | Server-to-server Odoo endpoint. |
| `ODOO_DB` | BFF | No | Odoo database name per environment. |
| `ODOO_API_KEY` | BFF | Yes | Bearer/API key, stored only as secret. |
| `CF_API_TOKEN` | infra | Yes | Cloudflare automation token. |
| `CF_ACCOUNT_ID` | infra | Yes | Cloudflare account identifier. |
| `CF_ZONE_ID_GETUPSOFT_COM` | infra | Yes | Zone ID for `getupsoft.com`. |
| `CF_ZONE_ID_GETUPSOFT_COM_DO` | infra | Yes | Zone ID for `getupsoft.com.do`. |
| `GITHUB_TOKEN` | CI | Yes | Repo/workflow automation token where needed. |
| `DEPLOY_SSH_HOST` | infra | No | `ssh.getupsoft.com.do`. |
| `REMOTE_BASE_DIR` | infra | No | `/srv/getupsoft`. |
| `GETUPSOFT_WEB_PROJECT` | infra | No | `getupsoft-web-prod`. |
| `EASYCOUNT_PROJECT` | infra | No | `easycount-prod`. |
| `ODOO_INTEGRATION_PROJECT` | infra | No | `getupsoft-odoo-int-prod`. |
| `ADMIN_PORTALS_PROJECT` | infra | No | `getupsoft-admin-portals-prod`. |

## Rules

- Public variables may be repository variables.
- Secrets must be GitHub Actions secrets or secret-manager entries.
- `.env.example` may contain names and placeholders only.
