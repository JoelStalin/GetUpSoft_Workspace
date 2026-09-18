# Worker Card Template

**Template Version:** 1.0
**ISO Reference:** ISO/IEC/IEEE 42010:2011 §4.4 · ISO/IEC 25010:2023 §4.8 (Reusability)

---

<!-- INSTRUCTIONS: Copy this template and rename as WORKER_CARD_[WORKER_NAME].md -->
<!-- Workers MUST have explicit input/output contracts. No contract = not a worker. -->

---

# Worker Card: [WORKER NAME]

**Card ID:** WORK-[XXX]
**Date Created:** YYYY-MM-DD
**Last Updated:** YYYY-MM-DD
**Status:** [ ] Draft | [ ] Active | [ ] Deprecated | [ ] Archived
**Owner:** [Name]
**Domain:** `04_Workers/`
**Worker Type:** [ ] Printer | [ ] Social | [ ] Data | [ ] Workflow | [ ] AI Agent | [ ] Other

---

## 1. Identity

| Field | Value |
|---|---|
| Canonical Name | [Required — use this name in code and docs] |
| Current Path | `[current path]` |
| Target Path | `04_Workers/[type]/[name]/` |
| Language/Runtime | [Python 3.11+ / Node.js / etc.] |
| Version | [Semver] |

---

## 2. Purpose

### What this worker does
[1-2 sentences. Focus on the single responsibility.]

### What it does NOT do
[Explicitly list out-of-scope behaviors to prevent misuse]

---

## 3. Worker Contract

This section is MANDATORY. A component without an explicit contract is NOT a worker.

### Input Schema
```json
{
  "field_name": "string — description",
  "field_name_2": "integer — description",
  "idempotency_key": "string — required for deduplication"
}
```

### Output Schema
```json
{
  "status": "success | failure | partial",
  "result": "object — description",
  "error": "string | null",
  "execution_id": "string"
}
```

### Retry Policy
| Field | Value |
|---|---|
| Max retries | [e.g., 3] |
| Retry delay | [e.g., exponential backoff, 2s base] |
| Dead letter handling | [e.g., log to audit, notify operator] |
| Idempotent | [ ] Yes | [ ] No |

---

## 4. Audit and Logging

| Field | Value |
|---|---|
| Logs every execution | [ ] Yes | [ ] No |
| Log location | [file path / database table / stdout] |
| Sensitive data masked | [ ] Yes | [ ] No | [ ] N/A |
| Audit trail required | [ ] Yes | [ ] No |

---

## 5. Consumers

List every product, client solution, or other worker that uses this worker:

| Consumer | Type | How it calls this worker | Version used |
|---|---|---|---|
| [ORCA / EasyCount / etc.] | [Product/Client/Worker] | [HTTP / import / queue] | [Version] |

---

## 6. Dependencies

| Dependency | Type | Version | Critical |
|---|---|---|---|
| [lib/service name] | [Python package / external API / Docker service] | [version] | [ ] Yes | [ ] No |

---

## 7. Deployment

| Item | Value |
|---|---|
| Runs in Docker | [ ] Yes | [ ] No |
| Docker image | [image:tag or N/A] |
| Environment variables | [list required vars or link to .env.example] |
| Port | [port or N/A] |
| Startup command | [command] |

---

## 8. Testing

| Test Type | Tool | Status | Coverage |
|---|---|---|---|
| Unit tests | [pytest/jest] | [ ] Passing | [%] |
| Contract tests | [Tool] | [ ] Passing | [%] |
| Integration tests | [Tool] | [ ] Passing | [%] |

**Test file locations:**
- Unit: `[path]/tests/`
- Contract: `[path]/tests/contract/`

---

## 9. Client-Specific Configuration

<!-- If this worker has any configuration that is client-specific, document it here -->
<!-- If fully generic (no client-specific code), write "None — fully generic" -->

| Client | Config Item | Location |
|---|---|---|
| [Client name or None] | [config] | [file] |

---

## 10. Migration Status

| Field | Value |
|---|---|
| Migration Risk | [ ] Low | [ ] Medium | [ ] High | [ ] Critical |
| Migration Phase | [ ] Phase 0 | [ ] Phase 1 | [ ] Phase 2 | [ ] Complete |
| Blocking Conditions | [What must be resolved] |

---

## 11. Change Log

| Date | Change | Author |
|---|---|---|
| YYYY-MM-DD | Card created | [Name] |

---

*GetUpSoft Worker Card Template v1.0 — ISO/IEC/IEEE 42010:2011*
