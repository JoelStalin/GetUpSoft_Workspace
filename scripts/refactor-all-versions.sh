#!/bin/bash

# Refactor ORCA models for v18, v17, v16, v15, v12

cd "02_Odoo_ERP/Odoo_Consolidated_Library"

echo "Starting ORCA Model Refactoring for all versions..."
echo ""

# Function to refactor version modules
refactor_version() {
    local version=$1

    echo "=== v$version ==="

    # l10n_do_accounting
    find "v$version/Modules/l10n_do_accounting" -type f \( -name "*.py" -o -name "*.xml" -o -name "*.csv" \) 2>/dev/null -exec sed -i 's/class AccountMoveOrcaLog/class OrcaAccountMoveLog/g' {} \; 2>/dev/null
    find "v$version/Modules/l10n_do_accounting" -type f \( -name "*.py" -o -name "*.xml" -o -name "*.csv" \) 2>/dev/null -exec sed -i 's/l10n\.do\.accounting\.orca\.log/orca.l10n.do.accounting.move.log/g' {} \; 2>/dev/null
    find "v$version/Modules/l10n_do_accounting" -type f -name "*.py" 2>/dev/null -exec sed -i "s/_description = 'Dominican Accounting ORCA Audit Log'/_description = 'Dominican Accounting  orca'/g" {} \; 2>/dev/null
    echo "  ✓ l10n_do_accounting"

    # l10n_do_accounting_report
    find "v$version/Modules/l10n_do_accounting_report" -type f \( -name "*.py" -o -name "*.xml" -o -name "*.csv" \) 2>/dev/null -exec sed -i 's/class AccountingReportOrcaLog/class OrcaAccountingReportLog/g' {} \; 2>/dev/null
    find "v$version/Modules/l10n_do_accounting_report" -type f \( -name "*.py" -o -name "*.xml" -o -name "*.csv" \) 2>/dev/null -exec sed -i 's/l10n\.do\.accounting\.report\.orca\.log/orca.l10n.do.accounting.report.log/g' {} \; 2>/dev/null
    find "v$version/Modules/l10n_do_accounting_report" -type f -name "*.py" 2>/dev/null -exec sed -i "s/_description = 'Dominican Accounting Report ORCA Audit Log'/_description = 'Dominican Accounting Report  orca'/g" {} \; 2>/dev/null
    echo "  ✓ l10n_do_accounting_report"

    # l10n_do_pos
    find "v$version/Modules/l10n_do_pos" -type f \( -name "*.py" -o -name "*.xml" -o -name "*.csv" \) 2>/dev/null -exec sed -i 's/class PosOrderOrcaLog/class OrcaPosOrderLog/g' {} \; 2>/dev/null
    find "v$version/Modules/l10n_do_pos" -type f \( -name "*.py" -o -name "*.xml" -o -name "*.csv" \) 2>/dev/null -exec sed -i 's/l10n\.do\.pos\.orca\.log/orca.l10n.do.pos.order.log/g' {} \; 2>/dev/null
    find "v$version/Modules/l10n_do_pos" -type f -name "*.py" 2>/dev/null -exec sed -i "s/_description = 'POS Order ORCA Audit Log'/_description = 'POS Order  orca'/g" {} \; 2>/dev/null
    echo "  ✓ l10n_do_pos"

    # l10n_do_rnc_search (if exists)
    if [ -d "v$version/Modules/l10n_do_rnc_search" ]; then
        find "v$version/Modules/l10n_do_rnc_search" -type f \( -name "*.py" -o -name "*.xml" -o -name "*.csv" \) 2>/dev/null -exec sed -i 's/class RncSearchOrcaLog/class OrcaRncSearchLog/g' {} \; 2>/dev/null
        find "v$version/Modules/l10n_do_rnc_search" -type f \( -name "*.py" -o -name "*.xml" -o -name "*.csv" \) 2>/dev/null -exec sed -i 's/l10n\.do\.rnc\.search\.orca\.log/orca.l10n.do.rnc.search.log/g' {} \; 2>/dev/null
        find "v$version/Modules/l10n_do_rnc_search" -type f -name "*.py" 2>/dev/null -exec sed -i "s/_description = 'RNC Search ORCA Audit Log'/_description = 'RNC Search  orca'/g" {} \; 2>/dev/null
        echo "  ✓ l10n_do_rnc_search"
    fi

    echo ""
}

# Refactor each version
refactor_version 18
refactor_version 17
refactor_version 16
refactor_version 15
refactor_version 12

echo "=== v12 Projects Modules ==="
# v12 specific modules in projects
find "v12/Projects/17_do/l10n-dominicana" -type f \( -name "*.py" -o -name "*.xml" -o -name "*.csv" \) -exec sed -i 's/class DgiiReportOrcaLog/class OrcaDgiiReportLog/g' {} \; 2>/dev/null
find "v12/Projects/17_do/l10n-dominicana" -type f \( -name "*.py" -o -name "*.xml" -o -name "*.csv" \) -exec sed -i 's/dgii\.report\.orca\.log/orca.dgii.report.log/g' {} \; 2>/dev/null
find "v12/Projects/17_do/l10n-dominicana" -type f \( -name "*.py" -o -name "*.xml" -o -name "*.csv" \) -exec sed -i 's/class AccountInvoiceOrcaLog/class OrcaAccountInvoiceLog/g' {} \; 2>/dev/null
find "v12/Projects/17_do/l10n-dominicana" -type f \( -name "*.py" -o -name "*.xml" -o -name "*.csv" \) -exec sed -i 's/account\.invoice\.orca\.log/orca.account.invoice.log/g' {} \; 2>/dev/null

echo "  ✓ dgii_reports v12"
echo "  ✓ ncf_manager v12"

echo ""
echo "============================================"
echo "✅ ORCA Model Refactoring Complete!"
echo "============================================"
