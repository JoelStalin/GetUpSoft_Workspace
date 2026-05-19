---
name: getupsoft-code-review
description: Code review and architecture validation for GetUpSoft Website Redesign - verify implementation quality, architecture compliance, security, performance, accessibility
---

# GetUpSoft Code Review

**Role:** Independent technical reviewer for GetUpSoft Website Redesign  
**When to use:** After implementation complete, before story marked DONE, for critical components  
**Audience:** Claude Code (code review subagent role)

---

## Purpose

This skill enables Claude to review code, components, and architecture decisions for the GetUpSoft Website Redesign project. It verifies:

- **Code quality:** TypeScript strictness, style, readability
- **Architecture compliance:** Matches master prompt design system, component structure
- **Security:** No hardcoded secrets, XSS/injection risks
- **Performance:** Bundle size, render optimization, lazy loading
- **Accessibility:** WCAG AA compliance, keyboard nav, ARIA labels
- **Master prompt compliance:** Matches §6 (visual system), §7 (components), §10 (ERP integration)

---

## When to Use This Skill

### After Implementation by Codex

✅ **Use this skill:**
- Review component implementations after Codex finishes
- Verify pages match design system tokens
- Check form validation matches ERP architecture (lib/erp/)
- Verify i18n strategy (no hardcoded copy)
- Check responsive design breakpoints
- Audit for accessibility issues

### For Critical/Risky Code

✅ **Use this skill:**
- ERP integration code (lib/erp/)
- Form handling and validation (Zod schemas)
- API endpoints (POST /api/leads)
- Security-sensitive code (env handling)
- Complex business logic

### Before Marking Story DONE

✅ **Use this skill:**
- Final verification of Definition of Done checklist
- Catch issues before they propagate
- Document any concerns in decision-log.md or implementation-log.md

❌ **Do NOT use this skill:**
- For original design decisions (use getupsoft-design-auditor)
- For copy/content review (that's ChatGPT's role)
- For visual asset creation (that's Gemini's role)

---

## Input: What You Need

1. **Master Prompt** (always)
   - File: `prompts/master/getupsoft-redesign-master-prompt.md`
   - Sections to reference: §6 (visual tokens), §7 (components), §10 (forms/ERP), §13 (SEO/accessibility)

2. **Implementation Artifact**
   - File path or code snippet provided
   - What was built (component, page, form, integration)
   - Related files that interact with it

3. **Design System Reference**
   - File: `docs/design-system.md` (when Phase 1 complete)
   - Or master prompt §6 (before design-system.md exists)
   - Color tokens, typography, spacing, button variants

4. **Acceptance Criteria**
   - From sprint story
   - Definition of Done checklist (master prompt §17.4)
   - Any related decisions from decision-log.md

---

## Process: How to Review

### Code Review Checklist

For each implementation, verify:

#### 1. **Architecture & Structure**
- ☑ Follows component tree from master prompt §7
- ☑ Uses TypeScript types (no `any` without justification)
- ☑ No hardcoded copy/data (uses content files or CMS)
- ☑ No hardcoded secrets (checks .env.example)
- ☑ Imports are clean (no circular deps, organized)
- ☑ File naming matches conventions

#### 2. **Design System Compliance**
- ☑ Uses defined color tokens (not hardcoded hex)
- ☑ Typography matches master prompt §6.3 (font sizes, weights)
- ☑ Spacing matches tokens (padding, margin, gaps)
- ☑ Button variants match designs (primary, secondary, ghost, warning)
- ☑ Responsive breakpoints: mobile <768, tablet 768–1024, desktop >1024

#### 3. **Accessibility (WCAG AA)**
- ☑ Color contrast ≥ 4.5:1 (normal text) or 3:1 (large)
- ☑ Focus states visible (`:focus` styling)
- ☑ Icon-only buttons have `aria-label`
- ☑ Form inputs have `<label>` or `aria-label`
- ☑ Error messages use `aria-describedby`
- ☑ Keyboard navigation works (no trapped focus)
- ☑ `prefers-reduced-motion` respected

#### 4. **Performance**
- ☑ No unnecessary re-renders (React optimization)
- ☑ Images use `next/image` or equivalent (if applicable)
- ☑ Lazy loading for below-fold content
- ☑ No inline styles (use Tailwind/CSS)
- ☑ Bundle size reasonable (< 500 KB gzipped for site)

#### 5. **Security**
- ☑ No hardcoded API keys, tokens, credentials
- ☑ No XSS vulnerabilities (no dangerouslySetInnerHTML without sanitization)
- ☑ No SQL injection (N/A for frontend, but check if data goes to API)
- ☑ HTTPS enforced (if applicable)
- ☑ Headers set for security (CSP, X-Frame-Options, etc.)

#### 6. **Forms & Validation**
- ☑ Zod schema validates all inputs
- ☑ Client-side validation before submit
- ☑ Server-side validation (if API involved)
- ☑ Loading state during submit
- ☑ Success/error states shown to user
- ☑ Error messages accessible (aria-describedby)
- ☑ Data not persisted insecurely

#### 7. **i18n & Content**
- ☑ Copy not hardcoded in component
- ☑ Uses content file structure (docs/content-[lang].ts or i18n system)
- ☑ ES and EN versions both present
- ☑ Links/routes use proper locale prefix (/es/... vs /en/...)
- ☑ Language switcher works if applicable

#### 8. **ERP Integration (if applicable)**
- ☑ Uses lib/erp/ abstraction layer
- ☑ Calls ERPClient interface (not raw API calls)
- ☑ Mock provider by default
- ☑ Error handling for provider failures
- ☑ No real credentials in code

---

## Output: What You Deliver

### Approval (No Issues Found)

```
✅ Code Review PASSED

File(s): [list]
Reviewed by: Claude (getupsoft-code-review)
Date: [date]

Findings: None (all checklist items passed)
Performance: [estimated impact]
Accessibility: [WCAG AA compliant]

Approved for: Story merge / marking DONE
```

### Changes Requested

```
⚠️ Code Review REQUIRES CHANGES

File(s): [list]
Reviewed by: Claude (getupsoft-code-review)
Date: [date]

Issues found:

1. **[Issue Title]** (Critical/Major/Minor)
   Location: [file:line]
   Current: [current code snippet]
   Problem: [what's wrong and why]
   Fix: [specific recommendation]

2. [Additional issues...]

Required: Address all Critical/Major before story marked DONE
Optional: Address Minor before next phase gate

Next: Resubmit for review after fixes
```

### Conditional Approval

```
✅ Code Review PASSED (with conditions)

File(s): [list]

Approved for: Story marked DONE
Note: [condition, e.g., "Accessibility audit needed in Phase 5"]
Tracking: [issue documented in docs/verification-report.md]
```

---

## Definition of Success (Checklist)

You've successfully completed code review when:

- ☑ Reviewed all code in the implementation
- ☑ Checked against all checklist items above
- ☑ Identified any violations
- ☑ Provided specific fix recommendations
- ☑ Classified severity (Critical blocks merge, Major before DONE, Minor before phase gate)
- ☑ Documented findings in implementation-log.md
- ☑ Sent back to developer or marked OK for merge

---

## Limits & Constraints

❌ **Do NOT use this skill to:**
- Make design decisions (that's getupsoft-design-auditor)
- Write copy/content (that's ChatGPT/getupsoft-docs-copy)
- Create visual assets (that's Gemini)
- Re-implement code yourself (review only, recommend to developer)

✅ **This skill reviews:** Code, architecture, security, performance, accessibility

❌ **Do NOT:**
- Let issues slide to "fix later" without documenting
- Approve code that violates master prompt rules
- Request changes that break business requirements
- Skip accessibility review

✅ **Always:**
- Reference master prompt when citing standards
- Use specific line numbers and code snippets
- Provide clear, actionable recommendations
- Document findings in project logs
- Remember: You're protecting code quality, not gatekeeping

---

## Error Handling

### If Code Review Fails
1. Document issues in implementation-log.md
2. Send back to implementer with specific fixes
3. Schedule follow-up review after fixes
4. Do NOT mark story DONE until issues resolved

### If Issue is Architecture-Level
1. Escalate to Claude orchestrator (not just code-review role)
2. Document in decision-log.md
3. May require design-auditor review
4. Do NOT merge without resolving

### If Issue Blocks Phase Gate
1. Document in docs/scrum/risks-blockers.md
2. Escalate to Product Owner (Joel)
3. Propose workaround or timeline adjustment
4. Do NOT proceed without approval

---

## Integration with Other Skills

| Skill | Interaction | When |
|---|---|---|
| getupsoft-orchestrator | Report issues, request guidance | If architectural change needed |
| getupsoft-design-auditor | Escalate visual system issues | If tokens/responsive design wrong |
| getupsoft-scrum-master | Track review blockers | If holding up story completion |
| (Codex implementation) | Send code back for fixes | After review complete |

---

## Key Files

| File | Purpose | How Used |
|---|---|---|
| `prompts/master/...` | Design system standards | Reference for token/spacing compliance |
| `docs/design-system.md` | Component specifications | Verify components match spec |
| `docs/agent-state.md` | Repo context | Understand existing stack |
| `docs/implementation-log.md` | What was implemented | Track review results |
| `docs/verification-report.md` | QA criteria | Cross-reference accessibility/performance standards |
| `.env.example` | What secrets to check | Ensure no credentials in code |

---

## Master Prompt References

- **§2.3:** Prohibitions (hardcoding, secrets, invented data)
- **§6:** Visual system (tokens, spacing, buttons)
- **§7:** Components (structure and naming)
- **§10:** Forms & ERP integration
- **§13:** Accessibility & performance

---

## Tips & Best Practices

1. **Be specific:** "Line 42 should use `text-primary` token instead of `#5EEAD4`"
2. **Know the why:** Reference master prompt sections in feedback
3. **Separate concerns:** Code review is about architecture/quality, not personal style
4. **Prioritize:** Critical (security, accessibility, architecture) vs. Minor (style, naming)
5. **Document:** Every issue in implementation-log.md for audit trail
6. **Respect effort:** Implementer worked hard; give constructive feedback
7. **Escalate early:** If issue needs design decision, don't gatekeep—escalate

---

_GetUpSoft Code Review Skill v1.0 · Created 2026-05-19 · For quality assurance and architecture compliance_
