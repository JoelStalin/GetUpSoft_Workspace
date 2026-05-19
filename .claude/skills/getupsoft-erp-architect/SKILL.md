---
name: getupsoft-erp-architect
description: ERP & integration architecture for GetUpSoft Website Redesign - verify Odoo as primary ERP, validate integration patterns, ensure lib/erp/ compliance
---

# GetUpSoft ERP Architect

**Role:** ERP Integration Architect and Odoo Solution Architect  
**When to use:** Designing ERP integration, validating lib/erp/, reviewing Odoo decisions, Phase 3 implementation  
**Audience:** Claude Code (ERP domain expert)

---

## Purpose

This skill manages the ERP and integration architecture for GetUpSoft's operational capabilities:

- **Odoo as primary ERP** (no negotiation; per master prompt §3.4, §9.5)
- **ERPNext, IBM iSeries, SAP as integrables** (not primary; connector-based)
- **lib/erp/ abstraction layer** (clean interface for all integrations)
- **E-CF / DGII compliance** (Dominican Republic requirement)
- **Multi-system patterns** (REST, webhooks, ETL, file exchange, message queues)

---

## When to Use

✅ **Use when:**
- Designing form submission flow (contact → CRM, diagnostic → Odoo setup)
- Creating lib/erp/ providers (Odoo real, ERPNext/iSeries/SAP stubs)
- Validating integration patterns (§9.4: seamless integrations)
- Making ERP technology decisions
- Reviewing DGII/e-CF implementation (RD specific)

❌ **Do NOT use for:**
- General application architecture (use orchestrator)
- Component design (use design-auditor)
- Code quality (use code-review)

---

## Input Required

1. **Master Prompt** (§3.4, §9.4-9.5, §10, §14.2)
   - Product capabilities (Odoo principal, others integrables)
   - Integration patterns allowed
   - ERP abstraction architecture

2. **Integration Audit**
   - Which ERP(s) being integrated
   - What data flows
   - Real credentials available? (Odoo yes; others no)
   - Compliance requirements (e-CF/DGII for RD)

3. **lib/erp/ Current State**
   - File: `lib/erp/types.ts`, `providers/`
   - What's implemented vs. stubbed

---

## Key Principles

### Odoo is Primary

✅ **Odoo:** Configured for real integration
- CRM leads from contact forms
- E-CF/DGII billing (RD only)
- ERP implementation (sales, inventory, accounting, CRM, POS)
- Real API credentials in `.env`

### Others are Integrables

✅ **ERPNext, IBM iSeries, SAP:** Supported via connectors, not primary
- Do NOT present as "GetUpSoft-native"
- Do NOT imply deep integration without credentials
- DO show as integration partners
- DO use stub providers with clear error messages

### lib/erp/ Architecture

Must enforce:

```ts
// Types (lib/erp/types.ts)
export type LeadPayload = { name, email, phone?, company?, ... }
export type ERPSystemSummary = { provider, status, capabilities }
export interface ERPClient {
  createLead(payload): Promise<{ id, status }>
  getSystemSummary?(): Promise<ERPSystemSummary>
}

// Providers (lib/erp/providers/)
- odoo.ts → Real implementation (uses ODOO_* env vars)
- erpnext.ts → Stub (clear error messages, no fake success)
- iseries.ts → Stub
- sap.ts → Stub
- mock.ts → Safe default for dev

// Usage
const client = getERPClient(process.env.LEADS_PROVIDER || 'mock')
await client.createLead({ name, email, ... })
```

---

## Process

### Phase 3 (Integration Implementation)

**Sprint:** Phase 3  
**Owner:** Claude orchestrator + Codex implementation

**Steps:**

1. **Create lib/erp/ structure**
   - types.ts (interfaces, types)
   - index.ts (factory function)
   - providers/ directory
   - Each provider file

2. **Implement Odoo provider**
   - Use `ODOO_BASE_URL`, `ODOO_DB`, `ODOO_USERNAME`, `ODOO_API_KEY`
   - Call Odoo CRM API to create lead
   - Handle real auth errors
   - Log all requests (except sensitive data)

3. **Implement stub providers**
   - ERPNext: Return error `"ERPNext not configured"`
   - iSeries: Return error `"IBM iSeries not configured"`
   - SAP: Return error `"SAP not configured"`
   - Each stub MUST fail with clear message (not fake success)

4. **Implement mock provider**
   - Default for development
   - Returns `{ id: "mock-123", status: "success" }`
   - Logs to console (not external service)
   - Always succeeds

5. **Integrate with forms**
   - Contact form → `POST /api/leads` → Odoo CRM
   - Diagnostic form → `POST /api/leads` with extra fields
   - All forms validate with Zod before sending

6. **Test locally**
   - Mock provider works (no credentials needed)
   - Stubs fail with proper messages
   - Contact/diagnostic forms submit and show feedback

---

## Validation Checklist

When ERP integration phase complete:

- ☑ Odoo provider implemented (real credentials path)
- ☑ ERPNext provider is stub (not fake success)
- ☑ IBM iSeries provider is stub (not fake success)
- ☑ SAP provider is stub (not fake success)
- ☑ Mock provider is default (safe for dev)
- ☑ lib/erp/types.ts defines clean interface
- ☑ POST /api/leads endpoint exists
- ☑ Contact form submits to API
- ☑ Diagnostic form submits to API
- ☑ All forms validate (Zod)
- ☑ Error messages clear (not cryptic)
- ☑ `.env.example` documents all ERP variables
- ☑ No credentials hardcoded
- ☑ Tests (mocked API calls) pass

---

## E-CF / DGII Compliance (RD Only)

**Requirement:** Dominican Republic electronic billing  

**Scope for this project:**
- Not implementing actual e-CF emission (out of scope per master prompt §4.2)
- But: Show on `/es/erp-facturacion` page that GetUpSoft can help
- Document requirements for future implementation

**Content to include:**
- What is e-CF/DGII
- Why compliance matters (legal requirement RD)
- GetUpSoft's approach (Odoo + specialized module)
- Next steps (contact for implementation)

**No code integration needed** (Phase 5+ scope)

---

## Common Integration Patterns

All documented in master prompt §9.4:

| Pattern | Use Case | Example |
|---|---|---|
| REST API | Query current ERP state | GET inventory from Odoo |
| Webhooks | Real-time events | Odoo sales order created → sync |
| Scheduled sync | Batch operations | Nightly inventory reconciliation |
| ETL/ELT | Complex transformations | iSeries legacy data → Odoo |
| File exchange | Legacy systems | CSV exchange with iSeries |
| Message queues | Decoupled systems | Pub/sub for order processing |

**For this project:** Mostly REST (Odoo) and documentation of patterns

---

## Decision Criteria

When choosing integration approach:

| Decision | Criteria |
|---|---|
| Use Odoo native | If Odoo supports natively (CRM, accounting, POS, etc.) |
| Use connector | If legacy system (iSeries, SAP) and stable connector exists |
| Use ETL | If heavy data transformation needed |
| Use file exchange | If system is old/air-gapped and API unavailable |
| Use message queue | If decoupling is critical (avoid direct sync) |

---

## Output & Documentation

### After Phase 3:

1. **lib/erp/ implementation** (code)
2. **docs/erp-integration.md** (architecture guide)
3. **Postman collection or cURL examples** (for testing)
4. **.env.example updated** (with all ERP variables)
5. **Test results** (in docs/verification-report.md)

### docs/erp-integration.md should include:

```markdown
# ERP Integration Architecture

## Overview
- Odoo as primary ERP for CRM, sales, accounting, POS
- ERPNext, IBM iSeries, SAP available via connectors (not primary)

## lib/erp/
- Types: LeadPayload, ERPSystemSummary, ERPClient
- Providers: odoo (real), erpnext/iseries/sap (stubs), mock (default)
- Usage: getERPClient(provider) → creates client → .createLead(...)

## Environment Variables
[List all ODOO_*, ERPNEXT_*, etc.]

## Testing
[How to test locally with mock provider]

## Limitations
- Odoo needs real credentials (not provided in this phase)
- ERPNext/iSeries/SAP are stubs for demo
- E-CF/DGII compliance documented but not implemented
```

---

## Limits

❌ Do NOT: Implement actual e-CF emission (out of scope)  
❌ Do NOT: Assume real iSeries/SAP credentials available  
❌ Do NOT: Fake success for unavailable providers  
❌ Do NOT: Present stubs as full integration  

✅ DO: Make Odoo path clear for future real implementation  
✅ DO: Document all integration patterns  
✅ DO: Test with mock provider  
✅ DO: Show professional error messages for missing credentials  

---

## Integration with Other Skills

| Skill | Interaction |
|---|---|
| getupsoft-orchestrator | Reports ERP decisions, escalates major changes |
| getupsoft-code-review | Reviews lib/erp/ code quality |
| getupsoft-design-auditor | (No interaction) |

---

_GetUpSoft ERP Architect Skill v1.0 · Created 2026-05-19_
