#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORT_PATH="${1:-$ROOT_DIR/task-ledger/phase9-pending-audit-report.md}"

mkdir -p "$(dirname "$REPORT_PATH")"

timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

pass_count=0
fail_count=0
warn_count=0

mark_pass() {
  pass_count=$((pass_count + 1))
}

mark_fail() {
  fail_count=$((fail_count + 1))
}

mark_warn() {
  warn_count=$((warn_count + 1))
}

check_binary() {
  local bin_name="$1"
  if command -v "$bin_name" >/dev/null 2>&1; then
    echo "PASS"
  else
    echo "FAIL"
  fi
}

python_status="FAIL"
if command -v python >/dev/null 2>&1 || command -v python3 >/dev/null 2>&1; then
  python_status="PASS"
fi

if [[ "$python_status" == "PASS" ]]; then
  mark_pass
else
  mark_fail
fi

modules_dir="$ROOT_DIR/02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules"
expected_modules=(
  account_extended
  pos_extended
  sale_extended
  asset_extended
  payment_extended
  bank_extended
  invoice_extended
  base_orca_integration
)

module_presence_lines=""
for module in "${expected_modules[@]}"; do
  if [[ -d "$modules_dir/$module" ]]; then
    module_presence_lines+="- PASS: $module found"
    module_presence_lines+=$'\n'
  else
    module_presence_lines+="- FAIL: $module missing"
    module_presence_lines+=$'\n'
  fi
done

inventory_status="FAIL"
inventory_note=""
if [[ -d "$modules_dir/inventory_extended" ]]; then
  inventory_status="PASS"
  inventory_note="inventory_extended found"
elif [[ -d "$modules_dir/stock_extended" ]]; then
  inventory_status="WARN"
  inventory_note="inventory_extended missing, stock_extended found (naming mismatch)"
else
  inventory_status="FAIL"
  inventory_note="both inventory_extended and stock_extended are missing"
fi

case "$inventory_status" in
  PASS) mark_pass ;;
  WARN) mark_warn ;;
  FAIL) mark_fail ;;
esac

missing_expected=0
for module in "${expected_modules[@]}"; do
  if [[ ! -d "$modules_dir/$module" ]]; then
    missing_expected=$((missing_expected + 1))
  fi
done

if [[ $missing_expected -eq 0 ]]; then
  expected_modules_status="PASS"
  mark_pass
else
  expected_modules_status="FAIL"
  mark_fail
fi

module_tests_lines=""
for module in "${expected_modules[@]}" stock_extended; do
  if [[ -d "$modules_dir/$module" ]]; then
    test_dir="$modules_dir/$module/tests"
    if [[ -d "$test_dir" ]]; then
      test_count=$(grep -R "^[[:space:]]*def test_" "$test_dir" 2>/dev/null | wc -l | tr -d ' ')
      module_tests_lines+="- $module: tests_dir=YES, test_functions=$test_count"
      module_tests_lines+=$'\n'
    else
      module_tests_lines+="- $module: tests_dir=NO, test_functions=0"
      module_tests_lines+=$'\n'
    fi
  fi
done

if [[ -d "$modules_dir/base_orca_integration/tests" ]]; then
  base_tests_status="PASS"
  mark_pass
else
  base_tests_status="WARN"
  mark_warn
fi

todo_fixme_count=$(grep -RInE "TODO|FIXME" "$ROOT_DIR/02_Odoo_ERP/Odoo_Consolidated_Library" --include='*' 2>/dev/null | grep -E '/v1[2-8]/' | wc -l | tr -d ' ')

if [[ "$todo_fixme_count" -eq 0 ]]; then
  todo_status="PASS"
  mark_pass
else
  todo_status="FAIL"
  mark_fail
fi

cat > "$REPORT_PATH" <<EOF
# Phase 9 Pending Audit Report

- Generated at (UTC): $timestamp
- Repository: GetUpSoft_Workspace
- Script: scripts/phase9_pending_audit.sh

## Summary
- PASS checks: $pass_count
- WARN checks: $warn_count
- FAIL checks: $fail_count

## Backlog/Checklist Coverage
- Source plan: task-ledger/phase9-e2e-test-plan.md
- Source plan: task-ledger/V19_ORCA_TEST_EXECUTION_PLAN.md

## Environment Readiness
- Python runtime available: $python_status

## V19 Modules Presence
- Expected modules status: $expected_modules_status
$module_presence_lines- Inventory module mapping: $inventory_status ($inventory_note)

## V19 Test Readiness Snapshot
$module_tests_lines- base_orca_integration tests directory: $base_tests_status

## Phase 9 Quality Gate
- TODO/FIXME count in v12-v18: $todo_fixme_count
- "All v12-v18 modules have zero TODOs/FIXMEs" gate: $todo_status

## Blocking Findings
EOF

if [[ "$python_status" == "FAIL" ]]; then
  cat >> "$REPORT_PATH" <<EOF
- Python runtime is missing, so OO-021/OO-022 scripts cannot run in this environment.
EOF
fi

if [[ "$expected_modules_status" == "FAIL" || "$inventory_status" != "PASS" ]]; then
  cat >> "$REPORT_PATH" <<EOF
- v19 module naming/inventory has mismatch with test plan (inventory_extended vs stock_extended).
EOF
fi

if [[ "$todo_status" == "FAIL" ]]; then
  cat >> "$REPORT_PATH" <<EOF
- TODO/FIXME quality gate is not met.
EOF
fi

cat >> "$REPORT_PATH" <<EOF

## Recommended Next Actions
1. Install Python runtime in the execution environment and re-run OO-021/OO-022 scripts.
2. Align module naming between plan and repository (inventory_extended vs stock_extended) or update plans to match code.
3. Prioritize TODO/FIXME burn-down for v12-v18 scope before Phase 9 closure.
EOF

echo "Report generated at: $REPORT_PATH"
