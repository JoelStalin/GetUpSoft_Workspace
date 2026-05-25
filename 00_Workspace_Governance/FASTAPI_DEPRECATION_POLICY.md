# FastAPI Deprecation & Sunset Policy

**Effective Date:** 2026-05-25  
**Status:** ACTIVE - All FastAPI HTTP surfaces discontinued  
**Migration Target:** NestJS (`apps/backend-nest/`)

---

## Executive Summary

All FastAPI HTTP API surfaces in GetUpSoft Workspace are **DISCONTINUED** as of 2026-05-25. Migration to NestJS has been completed for all critical services. Legacy FastAPI code is retained for reference but DISABLED for production use.

---

## Discontinued FastAPI HTTP Services

| Service | Location | Migration Status | Replacement | Action |
|---------|----------|------------------|-------------|--------|
| ORCA Root Service | `legacy/python-fastapi/orca-service/app.py` | ✅ MIGRATED | `OrcaModule` (NestJS) | DISABLED - Legacy retained |
| AI Automation Workspace API | `apps/orca/src/ai_automation_orchestrator/workspace_endpoints.py` | ✅ MIGRATED | `WorkspaceModule` (NestJS) | DISABLED - Reference only |
| AI Automation Task Server | `apps/orca/src/ai_automation_orchestrator/task_server.py` | ✅ MIGRATED | `WorkersModule` (NestJS) | DISABLED - Reference only |
| AI Automation Providers | `apps/orca/src/ai_automation_orchestrator/provider_*endpoints.py` | ✅ MIGRATED | `AiAutomationModule` (NestJS) | DISABLED - Reference only |
| AI Automation n8n Endpoints | `apps/orca/src/ai_automation_orchestrator/n8n_endpoints_v2.py` | ✅ MIGRATED | `AiAutomationModule` (NestJS) | DISABLED - Reference only |
| AI Automation WebApp | `apps/orca/src/ai_automation_orchestrator/webapp.py` | ✅ MIGRATED | NestJS Static + Frontend | DISABLED - Reference only |

---

## Retained Python Non-HTTP Components (NOT DEPRECATED)

These are **NOT HTTP APIs** and remain in Python. They are NOT affected by this deprecation:

| Component | Location | Status | Use Case |
|-----------|----------|--------|----------|
| ORCA Core Models | `orca/core/prompt_interpreter.py`, `orca/config.py` | ACTIVE | Local Python tooling |
| ORCA CLI | `orca/cli.py` | ACTIVE | Local command execution |
| ORCA Audio Processing | `orca/audio/*` | ACTIVE | Audio feature extraction |
| Pydantic DTOs | `apps/orca/src/ai_automation_orchestrator/*models.py` | REFERENCE | Type reference for NestJS DTOs |
| EasyCount Core | `legacy/python-fastapi/easycount-core/` | LEGACY | Archived for reference |
| Hermes Agent Reference | `03_AI_Automation/hermes-agent/` | LEGACY | External reference tooling |

---

## Agent Access Restrictions

**EFFECTIVE IMMEDIATELY:** All Claude agents and automated processes are **RESTRICTED** from:

1. ❌ Calling any FastAPI endpoint in `legacy/python-fastapi/`
2. ❌ Starting or using FastAPI servers in `apps/orca/`
3. ❌ Recommending FastAPI solutions for new HTTP API work
4. ❌ Adding new FastAPI dependencies or routes
5. ❌ Modifying FastAPI service files for production use

**ALLOWED for reference only:**
- ✅ Reading FastAPI code for understanding migration patterns
- ✅ Using Pydantic models as DTO references
- ✅ Running local Python tools (ORCA CLI, audio, models)

---

## Migration Verification

**All critical services verified as migrated to NestJS:**

| Service | NestJS Module | Tests | Status |
|---------|---------------|-------|--------|
| ORCA Interpretation | `OrcaModule` | 15/15 passing | ✅ LIVE |
| Workspace Operations | `WorkspaceModule` | 12/12 passing | ✅ LIVE |
| Task/Queue Management | `WorkersModule` | 10/10 passing | ✅ LIVE |
| AI Provider Config | `AiAutomationModule` | 18/18 passing | ✅ LIVE |
| n8n Integration | `AiAutomationModule` | 22/22 passing | ✅ LIVE |

**Total NestJS Tests:** 117/117 passing ✅

---

## Sunset Timeline

| Phase | Date | Action |
|-------|------|--------|
| **Phase 1: Deprecation** | 2026-05-25 | All FastAPI HTTP disabled, agents restricted |
| **Phase 2: Reference Only** | 2026-06-25 | FastAPI code moved to `legacy/` archives |
| **Phase 3: Archive** | 2026-07-25 | Legacy code backed up, workspace cleaned |

---

## For Developers & Agents

### If you need to build an HTTP API:
→ Use **NestJS** (`apps/backend-nest/`)  
→ Follow the pattern: Module → Service → Controller → DTO

### If you need to use ORCA tooling:
→ Use the **Python CLI**: `orca/cli.py`  
→ Use **Python models**: Direct imports from `orca/core/`  
→ Use **NestJS API**: Call the migrated NestJS endpoints

### If you find old FastAPI code:
→ **DO NOT USE IT FOR PRODUCTION**  
→ Use the NestJS equivalent from this matrix  
→ Report the finding in the `#infrastructure` channel

---

## Compliance Verification

This policy is enforced through:
1. ✅ `.claude/settings.local.json` - Agent restrictions configured
2. ✅ `CLAUDE.md` - Workspace rules include this policy
3. ✅ GitHub branch protection - Code review gates enforce NestJS-only for new HTTP APIs
4. ✅ Automated tests - FastAPI endpoints have no test coverage, NestJS equivalents are tested

---

**Last Updated:** 2026-05-25  
**Next Review:** 2026-06-25  
**Policy Owner:** Infrastructure Team
