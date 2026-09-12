#!/usr/bin/env python3
"""
Refactor ORCA models across all Odoo versions.
- Rename classes: AccountMoveOrcaLog → OrcaAccountMoveLog
- Rename model names: 'module.orca.log' → 'orca.module.log'
- Update descriptions: Add ' orca' suffix
"""

import os
import re
from pathlib import Path

# Mapping of module paths to (old_class, old_model_pattern, new_class, new_model_pattern)
REFACTORING_MAP = {
    # v19
    "v19/Modules/l10n_do_accounting": {
        "class": ("AccountMoveOrcaLog", "OrcaAccountMoveLog"),
        "model": (r"l10n\.do\.accounting\.orca\.log", "orca.l10n.do.accounting.move.log"),
        "description_old": "Dominican Accounting ORCA Audit Log",
        "description_new": "Dominican Accounting  orca"
    },
    "v19/Modules/l10n_do_accounting_report": {
        "class": ("DgiiReportOrcaLog", "OrcaDgiiReportLog"),
        "model": (r"l10n\.do\.accounting\.report\.orca\.log", "orca.l10n.do.accounting.report.log"),
        "description_old": "Accounting Report ORCA Audit Log",
        "description_new": "Accounting Report  orca"
    },
    "v19/Modules/l10n_do_pos": {
        "class": ("PosOrderOrcaLog", "OrcaPosOrderLog"),
        "model": (r"l10n\.do\.pos\.orca\.log", "orca.l10n.do.pos.order.log"),
        "description_old": "POS Order ORCA Audit Log",
        "description_new": "POS Order  orca"
    },
    "v19/Modules/l10n_do_rnc_search": {
        "class": ("RncSearchOrcaLog", "OrcaRncSearchLog"),
        "model": (r"l10n\.do\.rnc\.search\.orca\.log", "orca.l10n.do.rnc.search.log"),
        "description_old": "RNC Search ORCA Audit Log",
        "description_new": "RNC Search  orca"
    },
}

def refactor_file(filepath, class_map, model_map, desc_old, desc_new):
    """Refactor a single file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content

        # Replace class names
        content = content.replace(f"class {class_map[0]}(", f"class {class_map[1]}(")
        content = content.replace(f"class {class_map[0]} (", f"class {class_map[1]} (")

        # Replace model names
        content = re.sub(model_map[0], model_map[1], content)

        # Replace descriptions
        if desc_old:
            content = content.replace(f"'{desc_old}'", f"'{desc_new}'")
            content = content.replace(f'"{desc_old}"', f'"{desc_new}"')

        # Write back if changed
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def refactor_module(base_path, module_key):
    """Refactor a single module directory."""
    config = REFACTORING_MAP.get(module_key)
    if not config:
        print(f"No mapping for {module_key}")
        return

    full_path = Path("02_Odoo_ERP/Odoo_Consolidated_Library") / module_key
    if not full_path.exists():
        print(f"Module not found: {full_path}")
        return

    class_map = config["class"]
    model_map = config["model"]
    desc_old = config.get("description_old", "")
    desc_new = config.get("description_new", "")

    files_changed = 0

    # Refactor all Python, XML, and CSV files
    for filepath in full_path.rglob("*"):
        if filepath.is_file() and filepath.suffix in ['.py', '.xml', '.csv']:
            if refactor_file(filepath, class_map, model_map, desc_old, desc_new):
                print(f"  ✓ {filepath.relative_to(full_path.parent)}")
                files_changed += 1

    print(f"\n{module_key}: {files_changed} files updated\n")

# Main execution
if __name__ == "__main__":
    os.chdir("C:/Users/yoeli/Documents/GetUpSoft_Workspace")

    print("=" * 60)
    print("ORCA Model Refactoring")
    print("=" * 60)
    print()

    for module_key in sorted(REFACTORING_MAP.keys()):
        print(f"Processing: {module_key}")
        refactor_module("02_Odoo_ERP/Odoo_Consolidated_Library", module_key)

    print("=" * 60)
    print("Refactoring complete!")
    print("=" * 60)
