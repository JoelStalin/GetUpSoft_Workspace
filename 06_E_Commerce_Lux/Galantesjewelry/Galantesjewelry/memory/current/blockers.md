# Current Blockers

## No active infrastructure blockers

- Cloudflare tunnel is healthy.
- Web, Odoo, Postgres, and nginx are healthy on the GCP VM.
- `odoo.galantesjewelry.com` routing was repaired on May 2, 2026 by loading nginx `conf.d-active` host rules from the base nginx config and recreating only `galantes_nginx`.
- Public home, shop, admin, and Odoo endpoints respond successfully.
- Google OAuth owner connection was restored on April 28, 2026.
- Google Calendar test event creation was revalidated on `ceo@galantesjewelry.com`.
- The live production build still shows the older `/account` navbar spacing until the local layout fix is redeployed, so the Selenium account-navbar smoke remains red against production for now.

## GetUpSoft + EasyCount transformation blockers

- `GUS-006` is blocked for live Cloudflare provisioning. The local `CF_API_TOKEN` returned HTTP 400 for zone lookup calls, so DNS/tunnel records for `getupsoft.com` and `getupsoft.com.do` were not changed. Required replacement: a Cloudflare token with `Zone:Read`, `Zone:DNS:Edit`, and `Account:Cloudflare Tunnel:Edit` for the GetUpSoft zones.
- The shared host router is now ready for `getupsoft.com`, `www.getupsoft.com`, `admin.getupsoft.com`, and `easycount.getupsoft.com`; internal host-header validation on `ssh.getupsoft.com.do` returned HTTP 200 and the expected Certia titles. The remaining gap for `getupsoft.com` is external DNS visibility from this network, not nginx routing.
- The new automated GetUpSoft portal regression suite now passes for `getupsoft.com.do` and `admin.getupsoft.com.do`, but reports `easycount.getupsoft.com.do` as `blocked` because no public DNS answer is visible from this execution environment yet.
- `GUS-017` is blocked for final secret injection. GitHub repository variables were set for public URLs, but secret values cannot be read from GitHub and no valid final deployment secrets were available to copy safely.
