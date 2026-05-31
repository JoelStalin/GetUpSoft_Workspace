# 🎯 Sprint 3 — Phase 3 Forms & Integration

**Duration:** 2026-05-19 to 2026-05-22 (estimated 3-4 days)  
**Goal:** ERP adapter architecture, form submission, diagnostic forms, mock provider  
**Status:** 🔄 IN PROGRESS (Started 2026-05-19, 5/12 stories DONE, 42%)

---

## Sprint Board

### Phase 3A: ERP Adapter Architecture (US-301 — US-310)

| US | Title | Story | Effort | Owner | Status | Due |
|---|---|---|---|---|---|---|
| **301** | Design IERPProvider interface | Abstract adapter for Odoo, ERPNext, SAP, iSeries | 1h | Claude | ✅ DONE | 2026-05-19 |
| **302** | Implement MockERPProvider | In-memory ERP for testing/dev | 1.5h | Claude | ✅ DONE | 2026-05-19 |
| **303** | Create form submission hook | useERPSubmission for Contact + Diagnostic | 1.5h | Claude | ✅ DONE | 2026-05-19 |
| **304** | Error handling & validation | ValidationError, AuthenticationError, input validation | 1h | Claude | ✅ DONE | 2026-05-19 |
| **305** | Implement Odoo adapter | Real Odoo RPC/REST connection (XML-RPC) | 3h | Claude | ⏳ TODO | 2026-05-21 |

**Subtotal (ERP foundation):** 8 hours

### Phase 3B: Form Components (US-311 — US-320)

| US | Title | Story | Effort | Owner | Status | Due |
|---|---|---|---|---|---|---|
| **311** | Integrate Contact form with ERP | Form submission → Lead + Ticket creation | 1h | Claude | ✅ DONE | 2026-05-19 |
| **312** | Build Diagnostic form page | Comprehensive diagnostic with checkboxes, multi-field | 2.5h | Claude | ✅ DONE | 2026-05-19 |
| **313** | Add form validation schemas | Zod schemas for Contact + Diagnostic | 1h | Claude | ⏳ TODO | 2026-05-21 |
| **314** | Implement email notifications | Send confirmation + admin notifications | 2h | Claude | ⏳ TODO | 2026-05-22 |
| **315** | Create form submission tests | Unit tests for validation + ERP integration | 1.5h | Claude | ⏳ TODO | 2026-05-22 |

**Subtotal (Forms):** 8 hours

### Phase 3C: Integration & Testing (US-321 — US-325)

| US | Title | Story | Effort | Owner | Status | Due |
|---|---|---|---|---|---|---|
| **321** | Create Odoo adapter test suite | Mock + real connection tests | 2h | Claude | ⏳ TODO | 2026-05-22 |
| **322** | Build form error recovery | Retry logic, partial submission save | 1h | Claude | ⏳ TODO | 2026-05-22 |
| **323** | Add lead/ticket dashboard (admin) | View submitted forms, manage tickets | 2.5h | Claude | ⏳ TODO | 2026-05-23 |
| **324** | Implement webhook notifications | Real-time updates via webhooks | 1.5h | Claude | ⏳ TODO | 2026-05-23 |
| **325** | E2E test form submission flow | Test Contact → Diagnostic → Odoo integration | 1.5h | Claude | ⏳ TODO | 2026-05-24 |

**Subtotal (Integration):** 8.5 hours

---

**Phase 3 Total Effort:** 24.5 hours | **Est. Duration:** 3-4 days (6h/day)

---

## Completion Criteria (Phase 3 Gate)

Phase 3 is DONE when:
- [ ] All 12 form/integration stories marked DONE (US-301 through US-325)
- [ ] IERPProvider interface working (abstract pattern established)
- [ ] MockERPProvider functional (creates leads, tickets, validates)
- [ ] Contact form integrates with ERP (creates tickets)
- [ ] Diagnostic form integrates with ERP (priority-based tickets)
- [ ] Error handling: validation errors, connection errors caught
- [ ] Form validation: email, required fields, custom rules
- [ ] No hardcoded API keys or credentials
- [ ] `npm run build` succeeds (zero errors)
- [ ] No breaking changes from Phase 1–2
- [ ] Implementation log updated
- [ ] Ready for Odoo integration (Phase 3.5)

---

## Phase 3 Dependencies

✅ **Phase 1 complete** — All design system components available  
✅ **Phase 2 complete** — All pages built, bilingual content ready  
✅ **Unblocked** — Forms built, ERP interface designed  

⏳ **Odoo instance** — Needed for Phase 3.5 (real integration)  
⏳ **Email service** — Needed for Phase 3C (notifications)

---

## Known Risks (Phase 3)

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Odoo API complexity | Medium | Phase 3.5 delayed | Use existing libraries (python-odorpc), reference docs |
| Form field validation edge cases | Low | Some inputs bypass checks | Comprehensive Zod schemas, test matrix |
| Email delivery failures | Low | Users don't get confirmations | Use SendGrid/AWS SES with retry logic |
| MockProvider doesn't match Odoo | Medium | Real integration breaks | Implement Odoo adapter alongside Mock |

---

## Technical Approach: ERP Adapter Pattern

### Architecture Layers

```typescript
IERPProvider (interface)
    ↓
MockERPProvider (in-memory, dev/test)
    ↓
OdooProvider (RPC via python-odorpc)
ERPNextProvider (REST API)
SAPProvider (OData)
IsSeriesProvider (JDBC)
```

### Form Submission Flow

```
User fills form (Contact/Diagnostic)
    ↓
validateForm() — Zod schema
    ↓
submitContact() / submitDiagnostic() — useERPSubmission hook
    ↓
provider.createLead() — Create CRM lead
provider.createTicket() — Create support ticket
    ↓
notify() — Email confirmation
    ↓
Show success + ticket ID
```

### Error Handling

```
ValidationError → Show field errors → Allow retry
ConnectionError → Show "system unavailable" → Queue for retry
AuthenticationError → Show "auth failed" → Escalate to admin
```

---

## Resources & Files

**Created:**
- `src/lib/erp/types.ts` — IERPProvider interface, data models
- `src/lib/erp/mock-provider.ts` — MockERPProvider implementation
- `src/hooks/useERPSubmission.ts` — Form submission hook
- `src/pages/DiagnosticPage.tsx` — Diagnostic form page

**Updated:**
- `src/pages/ContactPage.tsx` — Integrated with ERP submission

**To Create:**
- `src/lib/erp/odoo-provider.ts` — Real Odoo adapter (Phase 3.5)
- `src/lib/validation/schemas.ts` — Zod schemas for forms
- `src/services/email.ts` — Email notification service
- `tests/erp.test.ts` — ERP adapter tests

---

## Daily Standup Template

```markdown
## [Date] Standup

**Stories in progress:** US-XXX, US-YYY  
**Blockers:** (none) or [describe]  
**Completed today:** 
- US-301: [status]
- US-302: [status]

**Next 24h:**
- Build Odoo adapter (US-305)
- Add form validation schemas (US-313)

**Confidence:** 🟢 Green / 🟡 Yellow / 🔴 Red
```

---

## QA Checklist (Per Story, Before Marking DONE)

Every story must pass Definition of Done:

- [ ] Code implemented + tested locally
- [ ] Form validation working (email, required fields)
- [ ] ERP provider creates leads/tickets
- [ ] Error messages display correctly
- [ ] Build: `npm run build` ✅
- [ ] Bilingual (ES/EN) functional
- [ ] No hardcoded secrets
- [ ] Implementation log updated
- [ ] Code review passed

---

_Sprint 3 Board v1.0 · Created 2026-05-19 · Phase 3 Forms & Integration IN PROGRESS_
