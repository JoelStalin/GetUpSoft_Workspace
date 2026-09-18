#!/usr/bin/env python3
"""
Complete refactoring of extended modules - fix model names and class names.
Handles the mixed state where some have correct class names but wrong model names.
"""

import re
from pathlib import Path

def refactor_extended_file(filepath):
    """Refactor extended module files to use correct ORCA naming."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content

        # Class name transformations - ensure Orca prefix
        class_replacements = [
            (r'\bAccountMoveOrcaLog\b', 'OrcaAccountMoveLog'),
            (r'\bAssetOrcaLog\b', 'OrcaAssetLog'),
            (r'\bAssetAssetOrcaLog\b', 'OrcaAssetLog'),
            (r'\bBankStatementOrcaLog\b', 'OrcaBankStatementLog'),
            (r'\bInvoiceLineOrcaLog\b', 'OrcaInvoiceLineLog'),
            (r'\bPaymentOrcaLog\b', 'OrcaPaymentLog'),
            (r'\bPosOrderOrcaLog\b', 'OrcaPosOrderLog'),
            (r'\bSaleOrderOrcaLog\b', 'OrcaSaleOrderLog'),
            (r'\bStockMoveOrcaLog\b', 'OrcaStockMoveLog'),
        ]

        for old_pattern, new_value in class_replacements:
            content = re.sub(old_pattern, new_value, content)

        # Model name transformations - move orca to front
        # These need to convert 'account.X.orca.log' to 'orca.account.X.log'
        model_replacements = [
            # Already correct (no change needed)
            (r"'orca\.account\.move\.log'", "'orca.account.move.log'"),
            (r"'orca\.pos\.order\.log'", "'orca.pos.order.log'"),
            (r"'orca\.sale\.order\.log'", "'orca.sale.order.log'"),
            (r"'orca\.stock\.move\.log'", "'orca.stock.move.log'"),
            # Need fixing: move orca to front
            (r"'account\.asset\.orca\.log'", "'orca.account.asset.log'"),
            (r"'account\.bank\.statement\.orca\.log'", "'orca.account.bank.statement.log'"),
            (r"'account\.move\.line\.orca\.log'", "'orca.account.move.line.log'"),
            (r"'account\.payment\.orca\.log'", "'orca.account.payment.log'"),
        ]

        for old_pattern, new_value in model_replacements:
            content = re.sub(old_pattern, new_value, content)

        # Write back if changed
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    base_path = Path("02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules")

    print("=" * 70)
    print("COMPLETE REFACTORING OF EXTENDED MODULES")
    print("=" * 70)
    print()

    extended_modules = [
        'account_extended',
        'asset_extended',
        'bank_extended',
        'invoice_extended',
        'payment_extended',
        'pos_extended',
        'sale_extended',
        'stock_extended'
    ]

    total_changed = 0

    for module in extended_modules:
        module_path = base_path / module
        if not module_path.exists():
            continue

        print(f"Processing: {module}")
        module_changed = 0

        # Find all *orca* files
        for filepath in module_path.rglob("*orca*"):
            if filepath.is_file() and filepath.suffix in ['.py', '.xml']:
                if refactor_extended_file(filepath):
                    relative = filepath.relative_to(base_path)
                    print(f"  [OK] {relative}")
                    module_changed += 1
                    total_changed += 1

        if module_changed == 0:
            print(f"  (all files already correct)")
        print()

    print("=" * 70)
    print(f"[DONE] COMPLETE REFACTORING: {total_changed} files modified")
    print("=" * 70)

if __name__ == "__main__":
    main()
