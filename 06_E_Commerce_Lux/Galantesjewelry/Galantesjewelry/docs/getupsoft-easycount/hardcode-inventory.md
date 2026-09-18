# Hardcode And Branding Inventory

Scan date: 2026-05-09

## Summary

The current repo still contains about 432 references to Galantes Jewelry, GetUpSoft staging domains, legacy routing, CORS/callback variables, or deployment hostnames across docs, infra, env examples, app code, tests, and workflows.

## High-Priority Areas

| Area | Example files | Action |
| --- | --- | --- |
| Env examples | `.env.example`, `.env.gcp.example`, `.env.prod.example` | Split Galantes, GetUpSoft, and EasyCount variables into documented scopes. |
| GitHub Actions | `.github/workflows/deploy*.yml` | Keep Galantes workflows isolated; create separate workflows in new repos. |
| Cloudflare/Nginx | `infra/cloudflare/*`, `infra/nginx/*` | Do not mix GetUpSoft routes into Galantes production configs. |
| Docs | `docs/deployment*`, `docs/shop-*`, `docs/NETWORK_TOPOLOGY.md` | Mark Galantes docs as legacy/reference for this transformation. |
| Runtime code | `app/`, `lib/`, `components/` | Only rename if this repo becomes an EasyCount codebase; otherwise preserve Galantes behavior. |

## Decision

Do not mass-rebrand this repository. Treat it as the Galantes source repo and use it as the planning/control repo for GetUpSoft + EasyCount until the new repositories receive their own codebases.
