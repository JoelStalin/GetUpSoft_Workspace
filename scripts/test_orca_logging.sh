#!/bin/bash
#
# V19 ORCA Logging Tests - Verify ORCA logs all transactions
# Purpose: Test that ORCA logging is working for each module
# Usage: ./test_orca_logging.sh [database_name] [config_file]

set -e

DB_NAME="${1:-odoo19_test}"
CONFIG_FILE="${2:-/etc/odoo/odoo.conf}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="test-results"
TEST_LOG="$LOG_DIR/v19_orca_logging_test_${TIMESTAMP}.log"

mkdir -p "$LOG_DIR"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_section() {
    echo -e "${BLUE}[TEST] $1${NC}"
    echo "[TEST] $1" >> "$TEST_LOG"
}

print_pass() {
    echo -e "${GREEN}✅ PASS: $1${NC}"
    echo "✅ PASS: $1" >> "$TEST_LOG"
}

print_fail() {
    echo -e "${RED}❌ FAIL: $1${NC}"
    echo "❌ FAIL: $1" >> "$TEST_LOG"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
    echo "ℹ️  $1" >> "$TEST_LOG"
}

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}V19 ORCA Logging Verification Tests${NC}"
echo -e "${BLUE}============================================${NC}"
echo "Database: $DB_NAME"
echo "Log: $TEST_LOG"
echo ""

# Test 1: Verify ORCA modules are installed
print_section "Test 1: Verify ORCA modules installed"
python3 odoo-bin \
    -d "$DB_NAME" \
    -c "$CONFIG_FILE" \
    --shell << 'EOF' 2>&1 | tee -a "$TEST_LOG"

modules_to_check = [
    'base_orca_integration',
    'account_extended',
    'pos_extended',
    'sale_extended',
    'asset_extended',
    'stock_extended',
    'payment_extended',
    'bank_extended',
    'invoice_extended',
    'l10n_do_accounting',
    'l10n_do_accounting_report',
    'l10n_do_pos',
    'l10n_do_rnc_search'
]

print("\n=== INSTALLED MODULES CHECK ===")
failed = []
for mod_name in modules_to_check:
    mod = env['ir.module.module'].search([('name','=',mod_name)])
    if mod and mod.state == 'installed':
        print(f"✅ {mod_name}: INSTALLED")
    else:
        state = mod.state if mod else "NOT_FOUND"
        print(f"❌ {mod_name}: {state}")
        failed.append(mod_name)

if failed:
    print(f"\n❌ Failed modules: {', '.join(failed)}")
else:
    print(f"\n✅ All {len(modules_to_check)} modules installed successfully")
EOF

# Test 2: Verify ORCA log models exist
print_section "Test 2: Verify ORCA log models in database"
python3 odoo-bin \
    -d "$DB_NAME" \
    -c "$CONFIG_FILE" \
    --shell << 'EOF' 2>&1 | tee -a "$TEST_LOG"

log_models = {
    'base_orca_integration': 'orca.log',
    'account_extended': 'orca.account.move.log',
    'pos_extended': 'orca.pos.order.log',
    'sale_extended': 'orca.sale.order.log',
    'asset_extended': 'orca.account.asset.log',
    'stock_extended': 'orca.stock.move.log',
    'payment_extended': 'orca.account.payment.log',
    'bank_extended': 'orca.account.bank.statement.log',
    'invoice_extended': 'orca.account.move.line.log',
    'l10n_do_accounting': 'orca.l10n.do.accounting.log',
    'l10n_do_accounting_report': 'orca.l10n.do.accounting.report.log',
    'l10n_do_pos': 'orca.l10n.do.pos.log',
    'l10n_do_rnc_search': 'orca.l10n.do.rnc.search.log',
}

print("\n=== ORCA LOG MODELS CHECK ===")
missing = []
for module, model_name in log_models.items():
    model = env['ir.model'].search([('model','=',model_name)])
    if model:
        field_count = len(model.field_id)
        print(f"✅ {model_name}: EXISTS ({field_count} fields)")
    else:
        print(f"❌ {model_name}: NOT_FOUND")
        missing.append(model_name)

if missing:
    print(f"\n❌ Missing models: {', '.join(missing)}")
else:
    print(f"\n✅ All ORCA log models found in database")
EOF

# Test 3: Test account.move ORCA logging
print_section "Test 3: Test account.move ORCA logging (Create hook)"
python3 odoo-bin \
    -d "$DB_NAME" \
    -c "$CONFIG_FILE" \
    --shell << 'EOF' 2>&1 | tee -a "$TEST_LOG"

print("\n=== ACCOUNT MOVE ORCA LOGGING TEST ===")
try:
    # Get test journal
    journal = env['account.journal'].search([('type','=','general')], limit=1)
    if not journal:
        journal = env['account.journal'].create({
            'name': 'Test Journal',
            'code': 'TEST',
            'type': 'general',
            'company_id': env.company.id,
        })

    # Get test partner
    partner = env['res.partner'].search([('is_company','=',True)], limit=1)
    if not partner:
        partner = env['res.partner'].create({'name': 'Test Partner'})

    # Create test invoice
    move = env['account.move'].create({
        'move_type': 'out_invoice',
        'journal_id': journal.id,
        'partner_id': partner.id,
        'invoice_date': '2026-05-28',
    })

    # Check ORCA log was created
    logs = env['orca.account.move.log'].search([
        ('record_id', '=', move.id),
        ('action', '=', 'create')
    ])

    if logs:
        log = logs[0]
        print(f"✅ ORCA log created for account.move ID={move.id}")
        print(f"   - Model: {log.model_name}")
        print(f"   - Action: {log.action}")
        print(f"   - User: {log.user_id.name}")
        print(f"   - After values fields: {len(eval(log.after_values) if log.after_values else {})}")
        print(f"✅ ORCA logging working for account.move")
    else:
        print(f"❌ No ORCA log found for account.move ID={move.id}")
        print(f"   Expected 1 log with action='create'")

except Exception as e:
    print(f"❌ Error testing account.move logging: {str(e)}")
    import traceback
    traceback.print_exc()
EOF

# Test 4: Test write hook (state change)
print_section "Test 4: Test account.move write hook (state change)"
python3 odoo-bin \
    -d "$DB_NAME" \
    -c "$CONFIG_FILE" \
    --shell << 'EOF' 2>&1 | tee -a "$TEST_LOG"

print("\n=== ACCOUNT MOVE WRITE HOOK TEST ===")
try:
    # Find existing draft move
    move = env['account.move'].search([
        ('state','=','draft')
    ], limit=1)

    if not move:
        # Create one
        journal = env['account.journal'].search([('type','=','general')], limit=1)
        partner = env['res.partner'].search([('is_company','=',True)], limit=1)
        move = env['account.move'].create({
            'move_type': 'out_invoice',
            'journal_id': journal.id,
            'partner_id': partner.id,
            'invoice_date': '2026-05-28',
        })

    # Clear previous logs
    old_logs = env['orca.account.move.log'].search([
        ('record_id', '=', move.id)
    ])
    old_logs.unlink()

    # Perform write (state change)
    move.write({'state': 'draft'})  # Trigger write hook

    # Check ORCA logs
    logs = env['orca.account.move.log'].search([
        ('record_id', '=', move.id),
        ('action', '=', 'write')
    ])

    if logs:
        print(f"✅ Write hook working for account.move")
        print(f"   - Found {len(logs)} write log(s)")
        for log in logs:
            print(f"   - Log ID: {log.id}, User: {log.user_id.name}")
    else:
        print(f"ℹ️  No write logs (may be normal for same state)")

except Exception as e:
    print(f"❌ Error testing write hook: {str(e)}")
EOF

# Test 5: Test field auto-detection (CRITICAL tier)
print_section "Test 5: Verify field auto-detection for CRITICAL tier modules"
python3 odoo-bin \
    -d "$DB_NAME" \
    -c "$CONFIG_FILE" \
    --shell << 'EOF' 2>&1 | tee -a "$TEST_LOG"

print("\n=== FIELD AUTO-DETECTION TEST ===")
try:
    # Get account.move model
    move_model = env['account.move']

    # Check if mixin is applied
    if hasattr(move_model, '_orca_tier'):
        tier = move_model._orca_tier
        print(f"✅ account.move has ORCA tier: {tier}")
        print(f"   Expected: CRITICAL (for accounting operations)")
    else:
        print(f"❌ account.move missing _orca_tier attribute")

    if hasattr(move_model, '_orca_log_model'):
        log_model = move_model._orca_log_model
        print(f"✅ account.move log model: {log_model}")
    else:
        print(f"❌ account.move missing _orca_log_model attribute")

    # Check POS model
    pos_model = env['pos.order']
    if hasattr(pos_model, '_orca_tier'):
        tier = pos_model._orca_tier
        print(f"✅ pos.order has ORCA tier: {tier}")
    else:
        print(f"ℹ️  pos.order may not have ORCA mixin (check if module installed)")

except Exception as e:
    print(f"❌ Error checking field auto-detection: {str(e)}")
EOF

# Test 6: Check access control on ORCA logs
print_section "Test 6: Verify access control on ORCA logs"
python3 odoo-bin \
    -d "$DB_NAME" \
    -c "$CONFIG_FILE" \
    --shell << 'EOF' 2>&1 | tee -a "$TEST_LOG"

print("\n=== ACCESS CONTROL TEST ===")
try:
    # Check model access records
    access_records = env['ir.model.access'].search([
        ('model_id.model','ilike','orca')
    ])

    print(f"✅ Found {len(access_records)} access control rules for ORCA models")

    # Group by model
    models = set(r.model_id.model for r in access_records)
    print(f"   Models with access rules: {len(models)}")
    for model in sorted(models):
        rules = [r for r in access_records if r.model_id.model == model]
        print(f"   - {model}: {len(rules)} rule(s)")
        for rule in rules:
            perms = f"R:{rule.perm_read} W:{rule.perm_write} C:{rule.perm_create} U:{rule.perm_unlink}"
            print(f"     • {rule.group_id.name}: {perms}")

except Exception as e:
    print(f"❌ Error checking access control: {str(e)}")
EOF

# Test 7: Database tables exist
print_section "Test 7: Verify ORCA tables in database"
psql -U odoo "$DB_NAME" << 'EOF' 2>&1 | tee -a "$TEST_LOG"
\echo
\echo "=== ORCA TABLES IN DATABASE ==="
\dt orca*
\echo
\echo "=== COUNTING ORCA TABLES ==="
SELECT COUNT(*) as orca_table_count
FROM information_schema.tables
WHERE table_schema='public' AND table_name LIKE '%orca%';
EOF

# Final summary
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}============================================${NC}"
echo "Log file: $TEST_LOG"
echo ""
echo -e "${GREEN}Tests completed. Check log above for details.${NC}"
echo ""

if grep -q "❌" "$TEST_LOG"; then
    echo -e "${RED}Some tests FAILED - Check log file${NC}"
    exit 1
else
    echo -e "${GREEN}All tests PASSED${NC}"
    exit 0
fi
