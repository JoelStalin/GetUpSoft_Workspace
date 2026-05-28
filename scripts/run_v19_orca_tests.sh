#!/bin/bash
#
# V19 ORCA Extension Modules - Test Execution Script
# Purpose: Execute all 78 tests for v19 ORCA extension modules
# Usage: ./run_v19_orca_tests.sh [database_name] [config_file]
# Example: ./run_v19_orca_tests.sh test_v19_orca /etc/odoo/odoo.conf

set -e

# Configuration
DB_NAME="${1:-test_v19_orca}"
CONFIG_FILE="${2:-/etc/odoo/odoo.conf}"
ADDONS_PATH="02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules"
ODOO_BIN="${ODOO_BIN:-odoo-bin}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="test-results/v19_orca_tests_${TIMESTAMP}.log"
REPORT_FILE="test-results/v19_orca_report_${TIMESTAMP}.txt"

# Create results directory
mkdir -p test-results

echo "======================================================================"
echo "V19 ORCA Extension Modules - Test Suite Execution"
echo "======================================================================"
echo "Database: $DB_NAME"
echo "Config: $CONFIG_FILE"
echo "Addons Path: $ADDONS_PATH"
echo "Timestamp: $TIMESTAMP"
echo "Log File: $LOG_FILE"
echo "======================================================================"
echo ""

# Run tests with all 9 modules
echo "[1/2] Executing all 78 tests for v19 ORCA extension modules..."
echo "" | tee -a "$LOG_FILE"

python3 "$ODOO_BIN" \
  --addons-path="$ADDONS_PATH" \
  -d "$DB_NAME" \
  -c "$CONFIG_FILE" \
  --test-enable \
  --test-tags "account_extended,pos_extended,sale_extended,asset_extended,stock_extended,payment_extended,bank_extended,invoice_extended" \
  --log-level=info \
  2>&1 | tee -a "$LOG_FILE"

# Parse results
echo ""
echo "[2/2] Analyzing test results..."
echo ""

# Extract test summary
if grep -q "Ran.*test" "$LOG_FILE"; then
    TEST_COUNT=$(grep "Ran.*test" "$LOG_FILE" | tail -1)
    echo "Test Summary:" | tee -a "$REPORT_FILE"
    echo "$TEST_COUNT" | tee -a "$REPORT_FILE"
    echo "" | tee -a "$REPORT_FILE"
fi

# Check for failures
if grep -q "FAILED\|ERROR" "$LOG_FILE"; then
    echo "⚠️  FAILURES DETECTED:" | tee -a "$REPORT_FILE"
    grep "FAILED\|ERROR" "$LOG_FILE" | tee -a "$REPORT_FILE"
    exit 1
else
    echo "✅ ALL TESTS PASSED" | tee -a "$REPORT_FILE"
fi

echo ""
echo "======================================================================"
echo "Test execution complete!"
echo "Log: $LOG_FILE"
echo "Report: $REPORT_FILE"
echo "======================================================================"
