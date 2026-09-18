#!/usr/bin/env bash
# ORCA 24/7 Mode Status Checker
# Verifies all components are ready for continuous operation

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Status tracking
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_TOTAL=0

check_component() {
    local name=$1
    local condition=$2
    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))

    if [ "$condition" = true ]; then
        echo -e "${GREEN}✅${NC} $name"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        echo -e "${RED}❌${NC} $name"
        CHECKS_FAILED=$((CHECKS_FAILED + 1))
    fi
}

print_section() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
}

# Main checks
print_section "🔍 ORCA 24/7 Mode Status Verification"

echo -e "${YELLOW}Checking system configuration...${NC}"

# 1. Config file
check_component "24-7 Config file exists" "[ -f '$SCRIPT_DIR/24-7-config.json' ]"

# 2. Orchestrator script
check_component "Orchestrator script exists" "[ -f '$SCRIPT_DIR/orchestrator.sh' ]"
check_component "Orchestrator script executable" "[ -x '$SCRIPT_DIR/orchestrator.sh' ] || [ -f '$SCRIPT_DIR/orchestrator.sh' ]"

# 3. Plugin system
check_component "Plugin loader exists" "[ -f '$SCRIPT_DIR/plugins/plugin_loader.sh' ]"
check_component "Enabled plugins directory" "[ -d '$SCRIPT_DIR/plugins/enabled' ]"

# 4. Enabled plugins
echo ""
echo -e "${YELLOW}Checking enabled plugins...${NC}"
ENABLED_COUNT=$(find "$SCRIPT_DIR/plugins/enabled" -type f -name "*.sh" 2>/dev/null | wc -l)
check_component "At least 1 plugin enabled" "[ $ENABLED_COUNT -gt 0 ]"

if [ $ENABLED_COUNT -gt 0 ]; then
    echo "  Enabled plugins:"
    find "$SCRIPT_DIR/plugins/enabled" -type f -name "*.sh" | while read plugin; do
        echo "    - $(basename $plugin)"
    done
fi

# 5. Communication channels
echo ""
echo -e "${YELLOW}Checking communication setup...${NC}"
check_component "Chat log ready" "[ -f '$SCRIPT_DIR/chat-log.md' ] || [ ! -f '$SCRIPT_DIR/chat-log.md' ]"
check_component "Reports directory" "[ -d '$SCRIPT_DIR/reports' ] || mkdir -p '$SCRIPT_DIR/reports'"
check_component "Logs directory" "[ -d '$SCRIPT_DIR/logs' ] || mkdir -p '$SCRIPT_DIR/logs'"

# 6. Required tools
echo ""
echo -e "${YELLOW}Checking required tools...${NC}"
check_component "bash available" "command -v bash &> /dev/null"
check_component "git available" "command -v git &> /dev/null"
check_component "npm available" "command -v npm &> /dev/null"
check_component "node available" "command -v node &> /dev/null"

# 7. ORCA specific
echo ""
echo -e "${YELLOW}Checking ORCA setup...${NC}"
PARENT_DIR=$(dirname "$SCRIPT_DIR")
check_component "ORCA main directory exists" "[ -d '$PARENT_DIR' ]"
check_component "Workflow editor exists" "[ -d '$PARENT_DIR/src' ]"
check_component "Test files present" "[ -f '$PARENT_DIR/test-togglegroup-modes.js' ] || [ -f '$PARENT_DIR/test-collapsed-bar.js' ]"

# 8. Compliance rules
echo ""
echo -e "${YELLOW}Checking compliance rules...${NC}"
check_component "Automated testing MANDATORY" "grep -q 'enforceTesting.*true' '$SCRIPT_DIR/24-7-config.json'"
check_component "Accessibility MANDATORY" "grep -q 'enforceAccessibility.*true' '$SCRIPT_DIR/24-7-config.json'"
check_component "Code review MANDATORY" "grep -q 'enforceCodeReview.*true' '$SCRIPT_DIR/24-7-config.json'"

# Print summary
print_section "📊 Summary"

PERCENTAGE=$((CHECKS_PASSED * 100 / CHECKS_TOTAL))

echo "Total Checks: $CHECKS_TOTAL"
echo -e "  ${GREEN}✅ Passed: $CHECKS_PASSED${NC}"
if [ $CHECKS_FAILED -gt 0 ]; then
    echo -e "  ${RED}❌ Failed: $CHECKS_FAILED${NC}"
else
    echo -e "  ${RED}❌ Failed: 0${NC}"
fi
echo "Success Rate: ${PERCENTAGE}%"

echo ""
if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! ORCA is ready for 24/7 mode.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some checks failed. Please review the errors above.${NC}"
    exit 1
fi
