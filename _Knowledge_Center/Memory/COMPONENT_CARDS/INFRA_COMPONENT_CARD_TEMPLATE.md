# Infrastructure Component Card Template

**Template Version:** 1.0
**ISO Reference:** ISO/IEC 12207:2017 §6.3 · ISO/IEC 27001:2022 A.5.9 (Asset Inventory)

---

<!-- INSTRUCTIONS: Copy this template and rename as INFRA_CARD_[COMPONENT_NAME].md -->
<!-- Fill in all sections. NEVER commit real credentials or private IPs. -->

---

# Infrastructure Card: [COMPONENT NAME]

**Card ID:** INFRA-[XXX]
**Date Created:** YYYY-MM-DD
**Last Updated:** YYYY-MM-DD
**Status:** [ ] Planned | [ ] Active | [ ] Degraded | [ ] Deprecated
**Owner:** [Name]
**Domain:** `06_Infrastructure_Networking/`
**Category:** [ ] Networking | [ ] Compute | [ ] Storage | [ ] Security | [ ] CI/CD | [ ] Mail | [ ] DNS | [ ] CDN

---

## 1. Identity

| Field | Value |
|---|---|
| Component Name | [Required] |
| Technology | [e.g., OpenVPN, Cloudflare Zero Trust, Docker, Nginx, Mailcow] |
| Provider | [Self-hosted / Cloudflare / AWS / DigitalOcean / etc.] |
| Current Path | `[config files location in repo]` |
| Target Path | `06_Infrastructure_Networking/[category]/[name]/` |
| Version | [Current version] |
| Config File | [path to main config — never commit secrets] |

---

## 2. Purpose

### What it does
[1-2 sentences describing the infrastructure component's function]

### Services it protects or serves
| Service | How |
|---|---|
| [ORCA/EasyCount/etc.] | [e.g., Sits behind Zero Trust / Routed via Nginx / etc.] |

---

## 3. Network Configuration

> SECURITY NOTE: Do NOT include real IPs, credentials, or private hostnames in this card.
> Use variable references: `$GETUPSOFT_LAN_IP`, `$VPN_SERVER_HOST`, etc.

| Field | Value (use env var references only) |
|---|---|
| Internal hostname | [e.g., `getupsoft-lan` or `$LAN_HOSTNAME`] |
| External domain | [e.g., `orca.getupsoft.com` or `$ORCA_DOMAIN`] |
| Port(s) | [e.g., 443, 8069, 11434] |
| Protocol | [TCP/UDP/HTTPS/SSH] |
| Authentication method | [e.g., Certificate, API key via env, Zero Trust policy] |

---

## 4. Docker Configuration

| Field | Value |
|---|---|
| Docker image | [image:tag] |
| Docker Compose file | `[path]/docker-compose.yml` |
| Volumes | [list volume paths — not production data paths] |
| Networks | [Docker network names] |
| Health check | [command or URL] |

---

## 5. Security Profile

| Item | Status |
|---|---|
| Secrets in env variables only | [ ] Verified |
| Private keys stored outside repo | [ ] Verified |
| Cloudflare Zero Trust protection | [ ] Yes | [ ] No | [ ] N/A |
| Firewall rules documented | [ ] Yes | [ ] No |
| Access control defined | [ ] Yes | [ ] No |
| Last security audit | YYYY-MM-DD |

**Security documentation:**
- Audit report: `[path or N/A]`
- Firewall rules: `[path or N/A]`
- Zero Trust policy: `[Cloudflare dashboard — not in repo]`

---

## 6. Monitoring and Alerts

| Item | Tool | Status |
|---|---|---|
| Uptime monitoring | [Tool or N/A] | [ ] Active |
| Log aggregation | [Tool or N/A] | [ ] Active |
| Alert channel | [email/Slack/N/A] | [ ] Active |

---

## 7. Recovery Procedures

| Scenario | Recovery Steps | Recovery Time |
|---|---|---|
| Service crash | [steps] | [minutes] |
| Configuration corruption | [steps — git restore, redeploy] | [minutes] |
| Certificate expiry | [steps] | [minutes] |

**Recovery documentation:**
- `[path to recovery guide if exists]`

---

## 8. Migration Status

| Field | Value |
|---|---|
| Migration Risk | [ ] Low | [ ] Medium | [ ] High | [ ] Critical |
| Consolidation target | `06_Infrastructure_Networking/[category]/[name]/` |
| Blocking conditions | [What must be done before migrating config files] |

---

## 9. Change Log

| Date | Change | Author |
|---|---|---|
| YYYY-MM-DD | Card created | [Name] |

---

*GetUpSoft Infrastructure Component Card Template v1.0 — ISO/IEC 27001:2022*
