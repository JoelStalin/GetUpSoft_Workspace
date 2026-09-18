# Risk Register

| Risk | Impact | Mitigation | Owner |
| --- | --- | --- | --- |
| Cloudflare token lacks zone access | DNS/tunnel automation blocked | Request scoped token with Zone:Read, Zone:DNS:Edit, Account:Cloudflare Tunnel:Edit | DevOps |
| GitHub private branch protection unavailable | Main branch can be pushed directly | Use required PR policy manually or upgrade GitHub plan | CTO |
| Frontend bypasses BFF and calls Odoo directly | Secret exposure and brittle coupling | Enforce ADR-002 and code review checks | Backend |
| Environment variables drift | Incorrect callbacks/CORS in production | Maintain variable matrix and CI validation | DevOps |
| Odoo outage | EasyCount sync failures | Queue/retry and expose status endpoint | Backend |
| Brand confusion between GetUpSoft and EasyCount | Lower trust and weak positioning | Apply brand guide and co-branding rules | Marketing |
