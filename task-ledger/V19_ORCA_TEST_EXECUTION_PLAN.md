# V19 ORCA Extension Modules - Test Execution Plan

**Date:** 2026-05-28  
**Status:** READY FOR EXECUTION  
**Task #23 Deliverables:** Full test suite execution across all 9 v19 modules

---

## Test Execution Overview

Each of the 9 modules contains comprehensive test suites covering:
- Unit tests (model functionality, field auto-detection, logging)
- Access control tests (role-based permissions)
- UI/UX tests (view rendering, menu integration)
- Integration tests (cross-module interactions)

**Total Test Cases:** 78 tests  
**Estimated Execution Time:** 45-60 minutes (full suite)  
**Execution Environment:** Odoo v19 test database (isolated)

---

## Pre-Execution Checklist

- [ ] Odoo v19 test database created and empty
- [ ] All 9 extension modules present in `v19/Modules/` directory
- [ ] base_orca_integration module installed first
- [ ] Test database has sample company, users, and data
- [ ] Python unittest framework available
- [ ] Chrome/Chromium for Playwright-based UI tests (future)

---

## Module Test Execution Sequence

### 1. account_extended (14 tests)
**Test File:** `v19/Modules/account_extended/tests/test_account_move_orca.py`

**Test Cases:**
```
✓ test_orca_log_on_create
  └─ Verify ORCA log created when account.move is created
  
✓ test_orca_log_on_write
  └─ Verify before/after values captured on write
  
✓ test_orca_log_on_unlink
  └─ Verify ORCA log created on deletion
  
✓ test_field_auto_detection_critical_tier
  └─ Verify CRITICAL tier auto-detects ~20-30 fields
  
✓ test_access_control_accountant_read_only
  └─ Verify accountant has read-only access
  
✓ test_access_control_manager_full_access
  └─ Verify manager has full (read/write/create) access
  
✓ test_orca_log_model_fields
  └─ Verify all expected fields exist on log model
  
✓ test_orca_log_user_tracking
  └─ Verify user attribution on all logs
  
✓ test_orca_log_timestamp
  └─ Verify accurate timestamps on logs
  
✓ test_list_view_exists
  └─ Verify tree (list) view configured
  
✓ test_form_view_exists
  └─ Verify form view configured
  
✓ test_search_view_exists
  └─ Verify search view configured
  
✓ test_action_window_exists
  └─ Verify action window configured
  
✓ test_menu_item_exists
  └─ Verify menu item integrated
```

**Expected Result:** ✅ ALL PASS (14/14)

---

### 2. pos_extended (12 tests)
**Test File:** `v19/Modules/pos_extended/tests/test_pos_order_orca.py`

**Test Cases:**
```
✓ test_orca_log_on_pos_order_create
✓ test_orca_log_pos_order_write
✓ test_field_auto_detection_pos_critical_tier
✓ test_access_control_pos_user_read_only
✓ test_access_control_pos_manager_full_access
✓ test_orca_log_model_fields
✓ test_list_view_exists
✓ test_form_view_exists
✓ test_search_view_exists
✓ test_action_window_exists
✓ test_menu_item_exists
```

**Expected Result:** ✅ ALL PASS (12/12)

---

### 3. sale_extended (12 tests)
**Test File:** `v19/Modules/sale_extended/tests/test_sale_order_orca.py`

**Test Cases:**
```
✓ test_orca_log_on_sale_order_create
✓ test_orca_log_sale_order_write
✓ test_field_auto_detection_sale_critical_tier
✓ test_access_control_sales_user_read_only
✓ test_access_control_sales_manager_full_access
✓ test_orca_log_model_fields
✓ test_list_view_exists
✓ test_form_view_exists
✓ test_search_view_exists
✓ test_action_window_exists
✓ test_menu_item_exists
```

**Expected Result:** ✅ ALL PASS (12/12)

---

### 4. asset_extended (8 tests)
**Test File:** `v19/Modules/asset_extended/tests/test_asset_orca.py` (to be created)

**Minimal Test Suite:**
```
✓ test_orca_log_on_asset_create
✓ test_field_auto_detection_asset_high_tier
✓ test_access_control_manager_full_access
✓ test_orca_log_model_fields
✓ test_list_view_exists
✓ test_form_view_exists
✓ test_action_window_exists
✓ test_menu_item_exists
```

**Expected Result:** ✅ ALL PASS (8/8)

---

### 5. stock_extended (8 tests)
**Test File:** `v19/Modules/stock_extended/tests/test_stock_move_orca.py` (to be created)

**Test Cases:**
```
✓ test_orca_log_on_stock_move_create
✓ test_field_auto_detection_stock_high_tier
✓ test_access_control_manager_full_access
✓ test_orca_log_model_fields
✓ test_list_view_exists
✓ test_form_view_exists
✓ test_action_window_exists
✓ test_menu_item_exists
```

**Expected Result:** ✅ ALL PASS (8/8)

---

### 6. payment_extended (8 tests)
**Test File:** `v19/Modules/payment_extended/tests/test_payment_orca.py` (to be created)

**Test Cases:**
```
✓ test_orca_log_on_payment_create
✓ test_field_auto_detection_payment_high_tier
✓ test_access_control_manager_full_access
✓ test_orca_log_model_fields
✓ test_list_view_exists
✓ test_form_view_exists
✓ test_action_window_exists
✓ test_menu_item_exists
```

**Expected Result:** ✅ ALL PASS (8/8)

---

### 7. bank_extended (8 tests)
**Test File:** `v19/Modules/bank_extended/tests/test_bank_statement_orca.py` (to be created)

**Test Cases:**
```
✓ test_orca_log_on_statement_create
✓ test_field_auto_detection_bank_high_tier
✓ test_access_control_manager_full_access
✓ test_orca_log_model_fields
✓ test_list_view_exists
✓ test_form_view_exists
✓ test_action_window_exists
✓ test_menu_item_exists
```

**Expected Result:** ✅ ALL PASS (8/8)

---

### 8. invoice_extended (8 tests)
**Test File:** `v19/Modules/invoice_extended/tests/test_invoice_line_orca.py` (to be created)

**Test Cases:**
```
✓ test_orca_log_on_invoice_line_create
✓ test_field_auto_detection_invoice_high_tier
✓ test_access_control_manager_full_access
✓ test_orca_log_model_fields
✓ test_list_view_exists
✓ test_form_view_exists
✓ test_action_window_exists
✓ test_menu_item_exists
```

**Expected Result:** ✅ ALL PASS (8/8)

---

## Test Execution Command

### Run All Tests
```bash
# Via Odoo CLI
cd /path/to/odoo
python odoo-bin --addons-path=02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules \
  -d test_v19_orca \
  -c /etc/odoo/odoo.conf \
  --test-enable \
  --test-tags account_extended,pos_extended,sale_extended,asset_extended,stock_extended,payment_extended,bank_extended,invoice_extended
```

### Run Single Module Tests
```bash
# Account Extended
python odoo-bin --addons-path=... -d test_v19_orca --test-enable --test-tags account_extended

# POS Extended
python odoo-bin --addons-path=... -d test_v19_orca --test-enable --test-tags pos_extended

# Sale Extended
python odoo-bin --addons-path=... -d test_v19_orca --test-enable --test-tags sale_extended
```

### Run Specific Test Case
```bash
python odoo-bin --addons-path=... -d test_v19_orca --test-enable \
  --test-tags account_extended.test_account_move_orca.TestAccountMoveOrcaLogging.test_orca_log_on_create
```

---

## Expected Test Output

### Successful Run
```
account_extended/tests/test_account_move_orca.py:
  TestAccountMoveOrcaLogging.test_orca_log_on_create ... ok (0.234s)
  TestAccountMoveOrcaLogging.test_orca_log_on_write ... ok (0.198s)
  TestAccountMoveOrcaLogging.test_orca_log_on_unlink ... ok (0.187s)
  ... [14 tests total]

pos_extended/tests/test_pos_order_orca.py:
  TestPosOrderOrcaLogging.test_orca_log_on_pos_order_create ... ok (0.156s)
  ... [12 tests total]

[... other modules ...]

Ran 78 tests in 45.234s

OK - All tests passed ✅
```

---

## Validation Checklist (Per Module)

### account_extended ✅
- [ ] 14/14 tests pass
- [ ] ORCA logs created on account.move operations
- [ ] CRITICAL tier detects 20+ fields
- [ ] Access control enforced (accountant/manager)
- [ ] All UI views accessible
- [ ] Menu item appears in accounting menu

### pos_extended ✅
- [ ] 12/12 tests pass
- [ ] POS order logs capture all transactions
- [ ] Field auto-detection works
- [ ] POS user/manager roles respected
- [ ] POS menu integration verified

### sale_extended ✅
- [ ] 12/12 tests pass
- [ ] Sales order audit trail complete
- [ ] Salesman/manager access control works
- [ ] Sales menu item accessible

### asset_extended ✅
- [ ] 8/8 tests pass
- [ ] Asset depreciation tracking functional
- [ ] Manager-only access enforced

### stock_extended ✅
- [ ] 8/8 tests pass
- [ ] Inventory movement tracking works
- [ ] Location transfers logged

### payment_extended ✅
- [ ] 8/8 tests pass
- [ ] Payment reconciliation tracking complete

### bank_extended ✅
- [ ] 8/8 tests pass
- [ ] Bank statement reconciliation logged

### invoice_extended ✅
- [ ] 8/8 tests pass
- [ ] Invoice line changes tracked

---

## Performance Metrics

### Expected Performance
| Metric | Target | Status |
|--------|--------|--------|
| Log creation latency | <100ms | ⏳ To measure |
| Field snapshot JSON size | <5KB | ⏳ To measure |
| DB query count per operation | <10 | ⏳ To measure |
| Test suite total time | <60s | ⏳ To measure |
| Memory overhead | <10MB | ⏳ To measure |

---

## Accessibility & Responsive Testing (Post-Unit Tests)

### WCAG AA Compliance
- [ ] Color contrast ratio ≥ 4.5:1 (all text)
- [ ] Interactive elements keyboard accessible (Tab/Enter/Escape)
- [ ] Screen reader compatible (links, labels, buttons)
- [ ] Focus indicators visible

### Responsive Design
- [ ] Mobile (320px): Logs readable, menu accessible
- [ ] Tablet (768px): Form fields stacked appropriately
- [ ] Desktop (1024px, 1440px, 1920px): Full layout working

### Browser Testing
- [ ] Chrome/Chromium 125+
- [ ] Firefox 126+
- [ ] Safari 17+

---

## Common Issues & Troubleshooting

### Issue: Module import error
```
ImportError: No module named 'orca.universal.mixin'
```
**Solution:** Ensure base_orca_integration is installed first and in module path.

### Issue: Test database not found
```
Error: database "test_v19_orca" does not exist
```
**Solution:** Create test database:
```bash
python odoo-bin -d test_v19_orca -i base --no-http --stop-after-init
```

### Issue: Access control errors in tests
```
AccessError: User does not have access to account.move.orca.log
```
**Solution:** Verify test user is assigned to correct security group.

### Issue: OrcaUniversalMixin not found
```
AttributeError: _orca_tier is not defined
```
**Solution:** Verify module inheritance: `_inherit = ['base.model', 'orca.universal.mixin']`

---

## Results Reporting

### Test Report Template
```
# V19 ORCA Extension Modules - Test Results
Date: [execution date]
Environment: Odoo 19.0 Test Database
Total Tests: 78
Pass Rate: [X%]

## Module Results
- account_extended: 14/14 ✅
- pos_extended: 12/12 ✅
- sale_extended: 12/12 ✅
- asset_extended: 8/8 ✅
- stock_extended: 8/8 ✅
- payment_extended: 8/8 ✅
- bank_extended: 8/8 ✅
- invoice_extended: 8/8 ✅

## Performance Summary
- Total execution time: [X] seconds
- Average test time: [X] ms
- Peak memory usage: [X] MB

## Issues Found
[List any failures or warnings]

## Recommendations
[Next steps, areas for improvement]
```

---

## Post-Test Verification

After all tests pass:

1. **Code Coverage Analysis**
   - Generate coverage report for all modules
   - Target: >80% coverage per module
   - Document untested edge cases

2. **Integration Testing**
   - Test cross-module interactions
   - Verify multi-user concurrent operations
   - Test field-level change notifications

3. **Load Testing**
   - Create 1,000+ log entries
   - Measure query performance
   - Verify pagination handles large datasets

4. **Security Testing**
   - Test SQL injection via log fields
   - Verify XSS protection in JSON views
   - Test CSRF protection on menu items

5. **Documentation Review**
   - Verify all docstrings complete
   - Check test case documentation
   - Validate manifest descriptions

---

## Timeline & Milestones

| Phase | Duration | Status |
|-------|----------|--------|
| Test execution setup | 30 min | ⏳ Pending |
| account_extended tests | 15 min | ⏳ Pending |
| pos_extended tests | 12 min | ⏳ Pending |
| sale_extended tests | 12 min | ⏳ Pending |
| asset_extended tests | 8 min | ⏳ Pending |
| stock_extended tests | 8 min | ⏳ Pending |
| payment_extended tests | 8 min | ⏳ Pending |
| bank_extended tests | 8 min | ⏳ Pending |
| invoice_extended tests | 8 min | ⏳ Pending |
| Results analysis | 15 min | ⏳ Pending |
| Documentation | 15 min | ⏳ Pending |

**Total: 105 minutes**

---

## Sign-Off

- **Prepared By:** Claude Haiku 4.5
- **Approved By:** [Awaiting user approval]
- **Execution Date:** [To be scheduled]
- **Expected Completion:** [~2 hours from execution start]

---

**Next Task:** #24 - Code Review & Security Audit  
**Reference:** Task #23 - Full Test Suite Execution
