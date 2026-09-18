#!/bin/bash
# V19 Phase 1 Module Refactoring Script (Linux/macOS)
# Refactors core financial modules with ORCA audit logging
#
# Usage: ./scripts/v19-phase1-refactor.sh setup
#        ./scripts/v19-phase1-refactor.sh refactor
#        ./scripts/v19-phase1-refactor.sh test
#        ./scripts/v19-phase1-refactor.sh all

ACTION="${1:-info}"
WORKSPACE_PATH="${WORKSPACE_PATH:-.}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Phase 1 Modules
declare -a MODULES=("account" "account_accountant" "account_payment" "account_reports")
declare -a MODULE_IDS=("OO-F-401" "OO-F-402" "OO-F-403" "OO-F-404")
declare -a MODULE_HOURS=(4 3 3.5 2.5)
declare -a MODULE_TESTS=(8 6 6 5)

show_header() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}V19 Phase 1 Module Refactoring Orchestrator${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

show_info() {
    echo -e "${GREEN}📋 V19 Phase 1: Core Financial Modules${NC}"
    echo ""
    echo -e "${YELLOW}Modules to Refactor:${NC}"

    for i in "${!MODULES[@]}"; do
        echo "  [${MODULE_IDS[$i]}] ${MODULES[$i]} - ${MODULE_HOURS[$i]}h"
        echo "    Tests: ${MODULE_TESTS[$i]} test cases"
    done

    echo ""
    echo -e "${CYAN}📊 Phase 1 Summary:${NC}"
    echo "  Total Modules: 4"
    echo "  Total Time: 13 hours"
    echo "  Total Tests: 25 test cases"
    echo "  Estimated Duration: 1-2 sessions"
    echo ""
}

show_setup_instructions() {
    echo -e "${GREEN}🚀 Setup Instructions for Phase 1${NC}"
    echo ""

    echo -e "${YELLOW}1️⃣  Install base_orca_integration module:${NC}"
    echo "   cd \$WORKSPACE_PATH"
    echo "   ./scripts/setup_odoo_orca_modules.sh copy"
    echo ""

    echo -e "${YELLOW}2️⃣  Verify Odoo database connection:${NC}"
    echo "   python3 -c 'import odoo; print(odoo.__version__)'"
    echo ""

    echo -e "${YELLOW}3️⃣  Create refactoring workspace:${NC}"
    echo "   mkdir -p task-ledger/v19-phase1-work"
    echo ""

    echo -e "${YELLOW}4️⃣  Begin with OO-F-401 (account module):${NC}"
    echo "   - Copy account module to local dev environment"
    echo "   - Add OrcaAuditMixin to tracked models"
    echo "   - Create account_orca_log model"
    echo "   - Add 8 test cases"
    echo "   - Update manifest with author: 'getupsoft'"
    echo ""

    echo -e "${YELLOW}5️⃣  Create PR with all 4 modules:${NC}"
    echo "   - Push to feature/orca-v19-phase1-financial"
    echo "   - Reference OO-F-401..404 in commit messages"
    echo "   - Include ORCA integration checklist"
    echo ""
}

show_refactor_checklist() {
    echo -e "${GREEN}📋 Refactoring Checklist (Per Module):${NC}"
    echo ""

    local checklist=(
        "[ ] Copy module to local environment"
        "[ ] Create <module>_orca.py with OrcaLog model"
        "[ ] Apply OrcaAuditMixin to tracked models"
        "[ ] Define _orca_tracked_fields for each model"
        "[ ] Create security/ir.model.access.csv entries"
        "[ ] Create views/<module>_orca_log_views.xml"
        "[ ] Update __manifest__.py (author: 'getupsoft')"
        "[ ] Create tests/test_orca_<module>.py"
        "[ ] Verify manifest syntax"
        "[ ] Test create/write/unlink operations"
        "[ ] Verify logs are created"
        "[ ] Test access control (read-only for accountants)"
        "[ ] Update README with ORCA section"
        "[ ] Add backlog ID to commits (OO-F-40X)"
        "[ ] All tests PASSING"
    )

    for item in "${checklist[@]}"; do
        echo "  $item"
    done
    echo ""
}

show_timeline() {
    echo -e "${GREEN}⏱️  Estimated Timeline:${NC}"
    echo ""
    echo "  Module              | Est. Hours | Tasks"
    echo "  ────────────────────┼────────────┼──────────────"

    for i in "${!MODULES[@]}"; do
        printf "  %-18s | %-10s | Copy, Mixin, Logs, Tests, Security\n" \
            "${MODULES[$i]}" "${MODULE_HOURS[$i]}"
    done

    echo ""
    echo "  Total: 13 hours (~2 sessions)"
    echo ""
}

show_test_template() {
    echo -e "${YELLOW}🧪 Template Test Instructions${NC}"
    echo ""
    echo "Create test file: tests/test_orca_<module>.py"
    echo ""
    echo "Example structure:"
    echo ""
    cat << 'EOF'
import unittest
from odoo.tests import TransactionCase

class TestAccountOrcaLogging(TransactionCase):
    '''Test ORCA audit logging for account module'''

    def setUp(self):
        super().setUp()
        self.account = self.env['account.move']
        self.orca_log = self.env['account.orca.log']

    def test_create_generates_log(self):
        '''Test: Creating move generates ORCA log'''
        move = self.account.create({'state': 'draft'})
        log = self.orca_log.search([('record_id', '=', move.id)])
        self.assertEqual(len(log), 1)
        self.assertEqual(log.action, 'create')

    def test_write_captures_before_after(self):
        '''Test: Write operation captures before/after values'''
        move = self.account.create({'ref': 'OLD'})
        move.write({'ref': 'NEW'})
        log = self.orca_log.search([('record_id', '=', move.id), ('action', '=', 'write')])
        self.assertIn('OLD', log.before_values)
        self.assertIn('NEW', log.after_values)

    def test_unlink_generates_log(self):
        '''Test: Delete operation generates log'''
        move = self.account.create({})
        move.unlink()
        log = self.orca_log.search([('action', '=', 'unlink')])
        self.assertGreater(len(log), 0)

    def test_accountant_read_only(self):
        '''Test: Accountants can only read ORCA logs'''
        accountant = self.env['res.users'].search([('name', '=', 'Accountant')])
        log = self.orca_log.sudo(accountant)
        # Verify read access exists, write access denied

if __name__ == '__main__':
    unittest.main()
EOF

    echo ""
}

# Main logic
show_header

case "$ACTION" in
    info)
        show_info
        show_timeline
        echo -e "${YELLOW}📖 For detailed instructions, see:${NC}"
        echo -e "   ${CYAN}- task-ledger/V19_COMPLETE_MODULE_REFACTORING_BACKLOG.md${NC}"
        echo -e "   ${CYAN}- task-ledger/V19_ODOO_MODULE_SETUP_GUIDE.md${NC}"
        echo ""
        ;;
    setup)
        show_info
        mkdir -p "$WORKSPACE_PATH/task-ledger/v19-phase1-work"
        echo -e "${GREEN}✅ Setup complete!${NC}"
        echo ""
        echo -e "${YELLOW}Next steps:${NC}"
        echo "  1. Run: ./scripts/v19-phase1-refactor.sh refactor"
        echo "  2. Follow the refactoring checklist"
        echo ""
        ;;
    refactor)
        show_refactor_checklist
        show_setup_instructions
        ;;
    test)
        show_test_template
        ;;
    all)
        show_info
        show_setup_instructions
        show_refactor_checklist
        show_timeline
        show_test_template
        ;;
    *)
        echo -e "${RED}Unknown action: $ACTION${NC}"
        echo "Usage: $0 {setup|refactor|test|all|info}"
        exit 1
        ;;
esac

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Ready to begin V19 Phase 1 refactoring${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
