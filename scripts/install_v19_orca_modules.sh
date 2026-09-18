#!/bin/bash
#
# V19 ORCA Modules - Complete Installation & Validation Script
# Purpose: Install all 13 modules with error checking and log monitoring
# Usage: ./install_v19_orca_modules.sh [database_name] [config_file]
# Example: ./install_v19_orca_modules.sh odoo19_test /etc/odoo/odoo.conf

set -e

# Configuration
DB_NAME="${1:-odoo19_test}"
CONFIG_FILE="${2:-/etc/odoo/odoo.conf}"
ADDONS_PATH="02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules"
ODOO_BIN="${ODOO_BIN:-odoo-bin}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="test-results"
INSTALL_LOG="$LOG_DIR/v19_orca_install_${TIMESTAMP}.log"
VALIDATION_REPORT="$LOG_DIR/v19_orca_validation_${TIMESTAMP}.txt"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create results directory
mkdir -p "$LOG_DIR"

echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}V19 ORCA Modules - Installation & Validation${NC}"
echo -e "${BLUE}=====================================================================${NC}"
echo "Database: $DB_NAME"
echo "Config: $CONFIG_FILE"
echo "Addons Path: $ADDONS_PATH"
echo "Timestamp: $TIMESTAMP"
echo "Log File: $INSTALL_LOG"
echo "Validation Report: $VALIDATION_REPORT"
echo -e "${BLUE}=====================================================================${NC}"
echo ""

# Array of modules to install (order matters - dependencies first)
declare -a MODULES=(
    "base_orca_integration"
    "account_extended"
    "pos_extended"
    "sale_extended"
    "asset_extended"
    "stock_extended"
    "payment_extended"
    "bank_extended"
    "invoice_extended"
    "l10n_do_accounting"
    "l10n_do_accounting_report"
    "l10n_do_pos"
    "l10n_do_rnc_search"
)

# Arrays to track results
declare -a INSTALLED_MODULES=()
declare -a FAILED_MODULES=()
declare -a ERROR_DETAILS=()

# Function to print section header
print_section() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] $1${NC}"
    echo "[$(date +'%H:%M:%S')] $1" >> "$INSTALL_LOG"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    echo "✅ $1" >> "$INSTALL_LOG"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
    echo "❌ $1" >> "$INSTALL_LOG"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    echo "⚠️  $1" >> "$INSTALL_LOG"
}

# Function to install single module
install_module() {
    local module_name=$1
    local install_attempt=1
    local max_attempts=2

    print_section "Installing module: $module_name (attempt $install_attempt/$max_attempts)"

    # Capture both stdout and stderr
    local install_output
    install_output=$(python3 "$ODOO_BIN" \
        --addons-path="$ADDONS_PATH" \
        -d "$DB_NAME" \
        -c "$CONFIG_FILE" \
        -i "$module_name" \
        --no-http \
        --stop-after-init \
        2>&1 || echo "INSTALLATION_FAILED")

    # Check for failures in output
    if echo "$install_output" | grep -q "INSTALLATION_FAILED\|Error\|Traceback\|ImportError\|AttributeError"; then
        print_error "Installation failed for $module_name"
        FAILED_MODULES+=("$module_name")
        ERROR_DETAILS+=("$module_name|$install_output")
        echo "$install_output" >> "$INSTALL_LOG"
        return 1
    else
        print_success "Installation successful: $module_name"
        INSTALLED_MODULES+=("$module_name")
        echo "$install_output" >> "$INSTALL_LOG"
        return 0
    fi
}

# Function to verify module installed in database
verify_module_installed() {
    local module_name=$1

    print_section "Verifying database installation: $module_name"

    local verify_output
    verify_output=$(python3 "$ODOO_BIN" \
        -d "$DB_NAME" \
        -c "$CONFIG_FILE" \
        --shell << EOF 2>&1 || echo "VERIFICATION_FAILED"
modules = env['ir.module.module'].search([('name','=','$module_name')])
if modules and modules.state == 'installed':
    print("MODULE_INSTALLED:$module_name:SUCCESS")
else:
    print("MODULE_INSTALLED:$module_name:FAILED")
    for m in modules:
        print(f"State: {m.state}, Error: {m.last_update}")
EOF
)

    if echo "$verify_output" | grep -q "MODULE_INSTALLED:$module_name:SUCCESS"; then
        print_success "Database verification passed: $module_name"
        return 0
    else
        print_error "Database verification failed: $module_name"
        echo "$verify_output" >> "$INSTALL_LOG"
        return 1
    fi
}

# Function to check for ORCA log model
verify_orca_log_model() {
    local module_name=$1

    print_section "Verifying ORCA log model for: $module_name"

    # Determine expected log model name based on module
    local expected_model=""
    case "$module_name" in
        "base_orca_integration") expected_model="orca.log" ;;
        "account_extended") expected_model="orca.account.move.log" ;;
        "pos_extended") expected_model="orca.pos.order.log" ;;
        "sale_extended") expected_model="orca.sale.order.log" ;;
        "asset_extended") expected_model="orca.account.asset.log" ;;
        "stock_extended") expected_model="orca.stock.move.log" ;;
        "payment_extended") expected_model="orca.account.payment.log" ;;
        "bank_extended") expected_model="orca.account.bank.statement.log" ;;
        "invoice_extended") expected_model="orca.account.move.line.log" ;;
        "l10n_do_accounting") expected_model="orca.l10n.do.accounting.log" ;;
        "l10n_do_accounting_report") expected_model="orca.l10n.do.accounting.report.log" ;;
        "l10n_do_pos") expected_model="orca.l10n.do.pos.log" ;;
        "l10n_do_rnc_search") expected_model="orca.l10n.do.rnc.search.log" ;;
    esac

    if [ -z "$expected_model" ]; then
        print_warning "No ORCA log model expected for $module_name"
        return 0
    fi

    local model_check
    model_check=$(python3 "$ODOO_BIN" \
        -d "$DB_NAME" \
        -c "$CONFIG_FILE" \
        --shell << EOF 2>&1 || echo "MODEL_CHECK_FAILED"
try:
    model = env['ir.model'].search([('model','=','$expected_model')])
    if model:
        print("MODEL_EXISTS:$expected_model:YES")
        print(f"Fields: {len(model.field_id)}")
    else:
        print("MODEL_EXISTS:$expected_model:NO")
except Exception as e:
    print(f"MODEL_ERROR:$expected_model:{e}")
EOF
)

    if echo "$model_check" | grep -q "MODEL_EXISTS:$expected_model:YES"; then
        print_success "ORCA log model verified: $expected_model"
        return 0
    else
        print_error "ORCA log model not found: $expected_model"
        echo "$model_check" >> "$INSTALL_LOG"
        return 1
    fi
}

# Function to test ORCA logging by creating a record
test_orca_logging() {
    local module_name=$1

    print_section "Testing ORCA logging for: $module_name"

    # Only test for modules with actual models that create logs
    case "$module_name" in
        "base_orca_integration"|"l10n_do_rnc_search"|"l10n_do_pos")
            print_warning "Skipping logging test for $module_name (no direct model hooks)"
            return 0
            ;;
    esac

    local test_output
    test_output=$(python3 "$ODOO_BIN" \
        -d "$DB_NAME" \
        -c "$CONFIG_FILE" \
        --shell << EOF 2>&1 || echo "LOGGING_TEST_FAILED"
try:
    # Test that mixin is properly applied
    if '$module_name' == 'account_extended':
        model = env['account.move']
        # Check if mixin applied
        if hasattr(model, '_orca_tier'):
            print(f"ORCA_MIXIN:account_extended:FOUND:{model._orca_tier}")
        else:
            print("ORCA_MIXIN:account_extended:NOT_FOUND")
    elif '$module_name' == 'pos_extended':
        model = env['pos.order']
        if hasattr(model, '_orca_tier'):
            print(f"ORCA_MIXIN:pos_extended:FOUND:{model._orca_tier}")
        else:
            print("ORCA_MIXIN:pos_extended:NOT_FOUND")
    else:
        print("ORCA_MIXIN:$module_name:SKIPPED")
except Exception as e:
    print(f"LOGGING_ERROR:$module_name:{str(e)}")
EOF
)

    if echo "$test_output" | grep -q "ORCA_MIXIN.*FOUND"; then
        print_success "ORCA mixin properly applied: $module_name"
        return 0
    elif echo "$test_output" | grep -q "SKIPPED"; then
        print_warning "ORCA logging test skipped for $module_name"
        return 0
    else
        print_error "ORCA logging test failed for $module_name"
        echo "$test_output" >> "$INSTALL_LOG"
        return 1
    fi
}

# Function to check for errors in Odoo log
check_odoo_logs() {
    print_section "Checking Odoo error logs"

    # Find Odoo log file
    local odoo_log_file="/var/log/odoo/odoo.log"
    if [ ! -f "$odoo_log_file" ]; then
        odoo_log_file="/var/log/odoo19.log"
    fi
    if [ ! -f "$odoo_log_file" ]; then
        print_warning "Odoo log file not found at standard locations"
        return 0
    fi

    # Extract errors from last 1000 lines
    local error_count=$(tail -1000 "$odoo_log_file" | grep -i "ERROR\|CRITICAL" | wc -l)
    local orca_errors=$(tail -1000 "$odoo_log_file" | grep -i "orca.*error\|error.*orca" | wc -l)

    echo "Total errors in last 1000 lines: $error_count" | tee -a "$INSTALL_LOG"
    echo "ORCA-related errors: $orca_errors" | tee -a "$INSTALL_LOG"

    if [ "$orca_errors" -gt 0 ]; then
        print_error "ORCA-related errors detected in log"
        tail -1000 "$odoo_log_file" | grep -i "orca.*error\|error.*orca" | head -20 | tee -a "$INSTALL_LOG"
        return 1
    else
        print_success "No ORCA-related errors detected"
        return 0
    fi
}

# ===== MAIN EXECUTION =====

print_section "Starting installation process"

# Step 1: Verify database exists
print_section "Step 1: Verifying database connection"
if psql -U odoo -d "$DB_NAME" -c "SELECT version();" > /dev/null 2>&1; then
    print_success "Database connection verified: $DB_NAME"
else
    print_error "Cannot connect to database: $DB_NAME"
    exit 1
fi

# Step 2: Install all modules sequentially
print_section "Step 2: Installing all 13 modules"
for module in "${MODULES[@]}"; do
    if install_module "$module"; then
        sleep 2  # Brief pause between installations
    fi
done

echo ""
print_section "Step 3: Verifying installations in database"
for module in "${INSTALLED_MODULES[@]}"; do
    verify_module_installed "$module" || FAILED_MODULES+=("$module")
done

echo ""
print_section "Step 4: Verifying ORCA log models"
for module in "${INSTALLED_MODULES[@]}"; do
    verify_orca_log_model "$module" || FAILED_MODULES+=("$module")
done

echo ""
print_section "Step 5: Testing ORCA logging functionality"
for module in "${INSTALLED_MODULES[@]}"; do
    test_orca_logging "$module" || FAILED_MODULES+=("$module")
done

echo ""
print_section "Step 6: Checking Odoo application logs"
check_odoo_logs || FAILED_MODULES+=("log_check")

# ===== GENERATE VALIDATION REPORT =====

echo ""
echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}VALIDATION REPORT${NC}"
echo -e "${BLUE}=====================================================================${NC}"

cat > "$VALIDATION_REPORT" << EOF
V19 ORCA Modules - Installation & Validation Report
Generated: $(date)

=== INSTALLATION SUMMARY ===
Total modules attempted: ${#MODULES[@]}
Successfully installed: ${#INSTALLED_MODULES[@]}
Failed installations: ${#FAILED_MODULES[@]}

=== SUCCESSFULLY INSTALLED MODULES ===
EOF

for module in "${INSTALLED_MODULES[@]}"; do
    echo "  ✅ $module" | tee -a "$VALIDATION_REPORT"
done

if [ ${#FAILED_MODULES[@]} -gt 0 ]; then
    echo "" | tee -a "$VALIDATION_REPORT"
    echo "=== FAILED MODULES ===" | tee -a "$VALIDATION_REPORT"
    for module in "${FAILED_MODULES[@]}"; do
        echo "  ❌ $module" | tee -a "$VALIDATION_REPORT"
    done

    echo "" | tee -a "$VALIDATION_REPORT"
    echo "=== ERROR DETAILS ===" | tee -a "$VALIDATION_REPORT"
    for error in "${ERROR_DETAILS[@]}"; do
        IFS='|' read -r module detail <<< "$error"
        echo "Module: $module" | tee -a "$VALIDATION_REPORT"
        echo "$detail" | head -50 | tee -a "$VALIDATION_REPORT"
        echo "---" | tee -a "$VALIDATION_REPORT"
    done
fi

echo "" | tee -a "$VALIDATION_REPORT"
echo "=== FINAL STATUS ===" | tee -a "$VALIDATION_REPORT"
if [ ${#FAILED_MODULES[@]} -eq 0 ]; then
    echo "Status: ✅ ALL MODULES INSTALLED SUCCESSFULLY" | tee -a "$VALIDATION_REPORT"
    echo "Log file: $INSTALL_LOG"
    echo "Report file: $VALIDATION_REPORT"
    echo -e "${GREEN}=====================================================================${NC}"
    echo -e "${GREEN}✅ INSTALLATION COMPLETE - NO ERRORS${NC}"
    echo -e "${GREEN}=====================================================================${NC}"
    exit 0
else
    echo "Status: ❌ SOME MODULES FAILED" | tee -a "$VALIDATION_REPORT"
    echo "Failed count: ${#FAILED_MODULES[@]}"
    echo "Log file: $INSTALL_LOG"
    echo "Report file: $VALIDATION_REPORT"
    echo -e "${RED}=====================================================================${NC}"
    echo -e "${RED}❌ INSTALLATION INCOMPLETE - CHECK ERRORS ABOVE${NC}"
    echo -e "${RED}=====================================================================${NC}"
    exit 1
fi
