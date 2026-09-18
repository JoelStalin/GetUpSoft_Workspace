#!/usr/bin/env python3
"""
Refactor ORCA models in extended modules (v19 Tier 1 extension modules).
Applies the same naming convention: NameOrcaLog -> OrcaNameLog
"""

import re
from pathlib import Path

def refactor_file(filepath):
    """Refactor a single file with ORCA models."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content

        # Class name transformations - all extended module variants
        replacements = [
            (r'\bAccountMoveOrcaLog\b', 'OrcaAccountMoveLog'),
            (r'\bAssetOrcaLog\b', 'OrcaAssetLog'),
            (r'\bAssetAssetOrcaLog\b', 'OrcaAssetLog'),
            (r'\bBankStatementOrcaLog\b', 'OrcaBankStatementLog'),
            (r'\bInvoiceLineOrcaLog\b', 'OrcaInvoiceLineLog'),
            (r'\bPaymentOrcaLog\b', 'OrcaPaymentLog'),
            (r'\bPosOrderOrcaLog\b', 'OrcaPosOrderLog'),
            (r'\bSaleOrderOrcaLog\b', 'OrcaSaleOrderLog'),
            (r'\bStockMoveOrcaLog\b', 'OrcaStockMoveLog'),
            # Test class names
            (r'\bTestAccountMoveOrcaLogging\b', 'TestOrcaAccountMoveLogging'),
            (r'\bTestPosOrderOrcaLogging\b', 'TestOrcaPosOrderLogging'),
            (r'\bTestSaleOrderOrcaLogging\b', 'TestOrcaSaleOrderLogging'),
        ]

        for old_pattern, new_value in replacements:
            content = re.sub(old_pattern, new_value, content)

        # Model name transformations - extended modules use different naming
        model_replacements = [
            # Pattern: module.entity.orca.log -> orca.module.entity.log
            (r"'account\.move\.orca\.log'", "'orca.account.move.log'"),
            (r"'asset\.asset\.orca\.log'", "'orca.asset.log'"),
            (r"'asset\.orca\.log'", "'orca.asset.log'"),
            (r"'bank\.statement\.orca\.log'", "'orca.bank.statement.log'"),
            (r"'bank_statement\.orca\.log'", "'orca.bank.statement.log'"),
            (r"'invoice\.line\.orca\.log'", "'orca.invoice.line.log'"),
            (r"'invoice_line\.orca\.log'", "'orca.invoice.line.log'"),
            (r"'payment\.orca\.log'", "'orca.payment.log'"),
            (r"'pos\.order\.orca\.log'", "'orca.pos.order.log'"),
            (r"'sale\.order\.orca\.log'", "'orca.sale.order.log'"),
            (r"'stock\.move\.orca\.log'", "'orca.stock.move.log'"),
            (r"'stock_move\.orca\.log'", "'orca.stock.move.log'"),
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
    print("REFACTORING EXTENDED MODULES (v19 Tier 1)")
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
            if filepath.is_file():
                if refactor_file(filepath):
                    relative = filepath.relative_to(base_path)
                    print(f"  [OK] {relative}")
                    module_changed += 1
                    total_changed += 1

        if module_changed == 0:
            print(f"  (no changes needed)")
        print()

    print("=" * 70)
    print(f"[DONE] REFACTORING COMPLETE: {total_changed} files modified")
    print("=" * 70)

if __name__ == "__main__":
    main()
