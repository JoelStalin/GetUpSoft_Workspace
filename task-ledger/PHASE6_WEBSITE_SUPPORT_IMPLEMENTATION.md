# PHASE 6: Website & Support Modules - Implementation Plan

**Status:** PREPARATION  
**Phase:** 6 of 6 (Final phase)  
**Duration:** 1 week (7-8 hours)  
**Modules:** 5 (website, website_form, crm_livechat, sales_team, web)  
**Priority:** P1-P2 (operational support)  
**Start Date:** After Phase 5 complete

---

## Overview

Phase 6 refactors website and customer support infrastructure with ORCA audit logging. These 5 modules handle web content, customer communications, and sales team management.

**Phase 5 (Manufacturing & Website) must complete before Phase 6 starts.**

---

## Module 1: `website` (OO-W-901)

### Strategic Importance
**MEDIUM-HIGH** - Website content and menu management drive customer-facing operations.

### Estimated Hours: 2 hours

### Models to Refactor

1. **website.page** (Important)
   - Website pages
   - Tracked fields:
     - `name`, `title`
     - `website_id`
     - `active`
     - `page_ids` (parent)
     - `create_date`, `write_date`

2. **website.menu** (Important)
   - Navigation menus
   - Tracked fields:
     - `name`
     - `website_id`
     - `parent_id`
     - `sequence`
     - `mega_menu_content`

3. **ir.ui.view** (reference)
   - Page views/templates
   - Tracked fields:
     - `name`, `type`
     - `active`

### Tests Required (4 tests)
```python
test_orca_page_creation()
test_orca_page_publication()
test_orca_menu_structure()
test_orca_access_control()
```

---

## Module 2: `website_form` (OO-W-902)

### Strategic Importance
**MEDIUM** - Form submissions and surveys capture customer feedback and leads.

### Estimated Hours: 1.5 hours

### Models to Refactor

1. **survey.survey** (Important)
   - Survey forms
   - Tracked fields:
     - `title`, `description`
     - `state` (draft, published)
     - `create_date`

2. **survey.question** (Important)
   - Survey questions
   - Tracked fields:
     - `title`
     - `question_type` (text, choice, matrix)
     - `sequence`

3. **survey.user_input** (Important)
   - Form submissions
   - Tracked fields:
     - `survey_id`
     - `partner_id`
     - `create_date`
     - `state` (in_progress, done)

### Tests Required (3 tests)
```python
test_orca_form_creation()
test_orca_submission_tracking()
test_orca_access_control()
```

---

## Module 3: `crm_livechat` (OO-S-903)

### Strategic Importance
**MEDIUM** - Live chat enables real-time customer support integration.

### Estimated Hours: 1.5 hours

### Models to Refactor

1. **crm.livechat.channel** (Important)
   - Live chat channels
   - Tracked fields:
     - `name`
     - `active`
     - `default_message`
     - `button_text`

2. **crm.livechat.message** (Important)
   - Chat messages
   - Tracked fields:
     - `livechat_channel_id`
     - `user_id`, `visitor_id`
     - `message_type` (message, command)
     - `create_date`

### Tests Required (3 tests)
```python
test_orca_chat_channel_creation()
test_orca_message_logging()
test_orca_access_control()
```

---

## Module 4: `sales_team` (OO-S-904)

### Strategic Importance
**MEDIUM** - Sales team structure and member assignments affect sales pipeline.

### Estimated Hours: 1.5 hours

### Models to Refactor

1. **crm.team** (Important)
   - Sales teams
   - Tracked fields:
     - `name`, `code`
     - `active`
     - `currency_id`
     - `company_id`
     - `user_id` (leader)

2. **crm.team.member** (Important)
   - Team members
   - Tracked fields:
     - `user_id`
     - `crm_team_id`
     - `assignment_date`

### Tests Required (3 tests)
```python
test_orca_team_creation()
test_orca_member_assignment()
test_orca_access_control()
```

---

## Module 5: `web` (OO-L-905)

### Strategic Importance
**LOW** - Core web framework (minimal tracking needed).

### Estimated Hours: 0.5 hours

### Models to Refactor

1. **web.settings** (Optional)
   - Web settings
   - Tracked fields:
     - `company_id`
     - `theme_id`
     - `favicon_id`

### Tests Required (1 test)
```python
test_orca_web_settings_logging()
```

---

## Implementation Sequence

### Day 1: `website` Module (2 hours)
1. Create website_orca.py
2. Define OrcaLog model
3. Apply mixin to website.page
4. Apply mixin to website.menu
5. Create security rules and views
6. Write 4 tests

### Day 2: `website_form` & `crm_livechat` (3 hours)
1. Create website_form_orca.py (1.5h)
2. Create crm_livechat_orca.py (1.5h)
3. Apply mixin to survey models
4. Apply mixin to livechat models
5. Create security rules and views
6. Write 6 tests total

### Day 3: `sales_team` & `web` (2 hours)
1. Create sales_team_orca.py
2. Create web_orca.py (minimal)
3. Apply mixin to crm.team
4. Apply mixin to crm.team.member
5. Create security rules and views
6. Write 4 tests

### Day 4: Integration & Testing
1. Run all Phase 6 tests (15 tests total)
2. Verify website → form → livechat integration
3. Test sales team assignments
4. Update CHANGE_TIMELINE.md
5. Create commit(s)

**Total: 7-8 hours (4 days)**

---

## Integration Points with Other Phases

**Depends on:**
- Phase 2 (Sales) - CRM teams referenced
- Phase 5 (Projects) - Project website integration

**Blocks:**
- None (final phase)

**Integrates with:**
- Website → Form submissions → CRM leads (Phase 2)
- Live chat → Customer support tickets (Phase 4 HR)
- Sales team → Order management (Phase 2)

---

## Code Template: website_orca.py

```python
# v19/Modules/website/models/website_orca.py

from odoo import models, fields

class WebsitePageOrcaLog(models.Model):
    """ORCA audit log for website.page - Website content"""
    _name = 'website.page.orca.log'
    _description = 'Website Page Audit Log'
    _inherit = 'orca.log'
    
    # Module-specific fields
    page_name = fields.Char(string='Page Name')
    page_title = fields.Char(string='Page Title')
    published = fields.Boolean(string='Published')


class WebsitePage(models.Model):
    """Inherit website.page with ORCA audit logging"""
    _inherit = ['website.page', 'orca.audit.mixin']
    
    _orca_tracked_fields = [
        'name', 'title', 'website_id', 'active'
    ]
    _orca_log_model = 'website.page.orca.log'


class WebsiteMenu(models.Model):
    """Inherit website.menu with ORCA audit logging"""
    _inherit = ['website.menu', 'orca.audit.mixin']
    
    _orca_tracked_fields = [
        'name', 'website_id', 'parent_id', 'sequence'
    ]
    _orca_log_model = 'website.page.orca.log'
```

---

## Success Criteria

✅ **All 5 modules refactored**  
✅ **15+ tests written and passing**  
✅ **Website content fully logged**  
✅ **Customer communications tracked**  
✅ **Sales team assignments audited**  
✅ **All 43 v19 modules complete**  

---

## Final Completion: All 43 Odoo v19 Modules

**After Phase 6 completion:**
- ✅ ALL 43 Odoo v19 modules refactored with ORCA
- ✅ 103+ unit tests written and passing
- ✅ Complete end-to-end audit trail:
  - Financial transactions (Phase 1)
  - Sales pipeline (Phase 2)
  - Supply chain (Phase 3)
  - HR & Payroll (Phase 4)
  - Manufacturing & Projects (Phase 5)
  - Website & Support (Phase 6)
- ✅ Code review gate enforced across all modules
- ✅ EasyCount integration ready for localization modules
- ✅ Ready for v17/v16/v15 porting

**Timeline:**
- Phase 1 (Financial): Week 1 (13h)
- Phase 2 (Sales): Week 2 (15h)
- Phase 3 (Procurement): Week 3 (15h)
- Phase 4 (HR): Week 4 (12h)
- Phase 5 (Manufacturing): Week 5-6 (17h)
- Phase 6 (Website): Week 6-7 (7-8h)

**Total Effort: ~80 hours across 7 weeks**

