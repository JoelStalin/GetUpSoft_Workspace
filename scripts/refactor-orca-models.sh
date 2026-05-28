#!/bin/bash

# Refactor ORCA models - rename classes and model names with prefixes
# Pattern: ClassNameOrcaLog → OrcaClassNameLog
#          'old.model.name.orca.log' → 'orca.old.model.name.log'

cd "02_Odoo_ERP/Odoo_Consolidated_Library"

# Function to refactor a single module
refactor_module() {
    local module_path="$1"
    local old_name="$2"
    local new_name="$3"

    if [ ! -d "$module_path" ]; then
        return
    fi

    # Update Python files
    find "$module_path" -name "*.py" -type f | while read file; do
        sed -i "s/class ${old_name}Log/class Orca${new_name}Log/g" "$file"
        sed -i "s/_name = '${old_name,,}.*.orca.log'/_name = 'orca.${old_name,,}.${new_name,,}.log'/g" "$file"
        sed -i "s/_orca_log_model = '${old_name,,}.*.orca.log'/_orca_log_model = 'orca.${old_name,,}.${new_name,,}.log'/g" "$file"
    done

    # Update XML files
    find "$module_path" -name "*.xml" -type f | while read file; do
        sed -i "s/${old_name,,}\..*\.orca\.log/orca.${old_name,,}.${new_name,,}.log/g" "$file"
    done

    # Update CSV files
    find "$module_path" -name "*.csv" -type f | while read file; do
        sed -i "s/${old_name,,}\..*\.orca\.log/orca.${old_name,,}.${new_name,,}.log/g" "$file"
    done

    echo "Refactored: $module_path"
}

# Refactor v19 modules
refactor_module "v19/Modules/l10n_do_accounting" "l10n_do_accounting" "account_move"
refactor_module "v19/Modules/l10n_do_accounting_report" "l10n_do_accounting_report" "report"
refactor_module "v19/Modules/l10n_do_pos" "l10n_do_pos" "pos_order"
refactor_module "v19/Modules/l10n_do_rnc_search" "l10n_do_rnc_search" "rnc_search"

# Refactor v18 modules
refactor_module "v18/Modules/l10n_do_accounting" "l10n_do_accounting" "account_move"
refactor_module "v18/Modules/l10n_do_accounting_report" "l10n_do_accounting_report" "report"
refactor_module "v18/Modules/l10n_do_pos" "l10n_do_pos" "pos_order"
refactor_module "v18/Modules/l10n_do_rnc_search" "l10n_do_rnc_search" "rnc_search"

echo "Refactoring complete!"
