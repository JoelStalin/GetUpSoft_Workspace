# 06_Infrastructure_Networking — GetUpSoft Workspace

**Domain:** Infrastructure and Networking
**ISO Reference:** ISO/IEC 12207:2017 §6.3 · ISO/IEC 27001:2022 A.5.9

This directory centralizes all infrastructure configuration: Docker, VPN, Nginx, Cloudflare, mail servers, and networking.

## Rules

- NEVER commit real credentials, private keys, or production IPs here
- All sensitive values use environment variables (`.env` files in `.gitignore`)
- Infrastructure changes require pre/post validation (see MIGRATION_PLAN.md)
- Document each component with an INFRA_COMPONENT_CARD

## Contents (Target)

| Directory | Source | Technology | Status |
|---|---|---|---|
| `vpn-cloudflare/` | `infra/vpn/` + `01_Core_Platform/infrastructure/` | OpenVPN + Cloudflare Zero Trust | Pending migration |
| `mail/` | `infra/mail/` + `01_Core_Platform/getupsoft-mail-infra/` | Mailcow | Pending migration (resolve duplication first) |

## Current Fragmented Locations (to be consolidated here)

- `infra/vpn/` — OpenVPN config
- `infra/mail/` — Mailcow Docker config
- `01_Core_Platform/infrastructure/` — OpenVPN + Cloudflare docs
- `01_Core_Platform/getupsoft-mail-infra/` — Mailcow scripts

## Governance

See `00_Workspace_Governance/MIGRATION_PLAN.md` Phase 2 for consolidation plan.
See `_Knowledge_Center/Memory/COMPONENT_CARDS/INFRA_COMPONENT_CARD_TEMPLATE.md` for card template.
