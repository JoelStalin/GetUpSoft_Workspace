# PHASE 6 Quick-Start Checklist - Website & Support Modules (Final Phase)

**Status:** READY FOR EXECUTION  
**Duration:** 1 week (7-8 hours total)  
**Start:** Immediately after Phase 5 merges  
**Deadline:** 4-5 working days  
**Depends On:** Phase 5 must be merged to main

---

## Module 1: `website` (OO-W-901) - 2 HOURS

### Models to Track:
1. **website.page**
   - Tracked fields: name, title, website_id, active, page_ids, create_date, write_date

2. **website.menu**
   - Tracked fields: name, website_id, parent_id, sequence, mega_menu_content

3. **ir.ui.view** (reference)
   - Tracked fields: name, type, active

### Tests: 4 minimum

**Commit:** `feat: Refactor website module with ORCA audit logging (OO-W-901)`

---

## Module 2: `website_form` (OO-W-902) - 1.5 HOURS

### Models to Track:
1. **survey.survey**
   - Tracked fields: title, description, state, create_date

2. **survey.question**
   - Tracked fields: title, question_type, sequence

3. **survey.user_input**
   - Tracked fields: survey_id, partner_id, create_date, state

### Tests: 3 minimum

**Commit:** `feat: Refactor website_form module with ORCA audit logging (OO-W-902)`

---

## Module 3: `crm_livechat` (OO-S-903) - 1.5 HOURS

### Models to Track:
1. **crm.livechat.channel**
   - Tracked fields: name, active, default_message, button_text

2. **crm.livechat.message**
   - Tracked fields: livechat_channel_id, user_id, visitor_id, message_type, create_date

### Tests: 3 minimum

**Commit:** `feat: Refactor crm_livechat module with ORCA audit logging (OO-S-903)`

---

## Module 4: `sales_team` (OO-S-904) - 1.5 HOURS

### Models to Track:
1. **crm.team**
   - Tracked fields: name, code, active, currency_id, company_id, user_id

2. **crm.team.member**
   - Tracked fields: user_id, crm_team_id, assignment_date

### Tests: 3 minimum

**Commit:** `feat: Refactor sales_team module with ORCA audit logging (OO-S-904)`

---

## Module 5: `web` (OO-L-905) - 0.5 HOURS

### Models to Track:
- **web.settings** (minimal)
  - Tracked fields: company_id, theme_id, favicon_id

### Tests: 1 minimum

**Commit:** `feat: Refactor web module with ORCA audit logging (OO-L-905)`

---

## Phase 6 Completion Checklist

### Code Review Gate - 10 Points ✅

- [ ] 1. ORCA Integration (5 modules)
- [ ] 2. Tests (15+ passing)
- [ ] 3. Security & Access Control
- [ ] 4. Views & UI
- [ ] 5. Documentation
- [ ] 6. Code Quality
- [ ] 7. Integration Testing (Website → Forms → Support)
- [ ] 8. Performance & Compliance
- [ ] 9. Git Commit
- [ ] 10. Evidence & Sign-off

**MERGE STATUS:** All 10 PASS = APPROVED

---

## Final Phase Completion

### All 43 Modules Complete ✅

After Phase 6 merge:
- ✅ 43 Odoo v19 modules refactored with ORCA
- ✅ 103+ unit tests written and passing
- ✅ Complete end-to-end audit trail
- ✅ All code review gates passed
- ✅ Full ERP system audited

### Next Steps (Optional)

After Phase 6 complete:
1. Plan v17 porting (same 43 modules, v17-specific API adjustments)
2. Plan v16 porting
3. Plan v15 porting
4. Plan v12 legacy adapter
5. Deploy to production with EasyCount integration

---

## Success Metrics

✅ **Phase 6 Success = COMPLETE v19 REFACTORING:**
- 5 modules refactored
- 15+ tests passing
- Website & support fully audited
- Code review gate 10/10 pass
- All commits merged to main
- **ALL 43 MODULES COMPLETE** ✅
- Timeline: 4-5 working days (7-8 hours)

