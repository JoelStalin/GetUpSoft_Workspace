#!/usr/bin/env python3
"""
Comprehensive ORCA model refactoring across all versions and all modules.
Handles dynamic class and model name transformations.
"""

import os
import re
from pathlib import Path

def get_module_name_from_path(filepath):
    """Extract module name from file path."""
    parts = filepath.parts
    for i, part in enumerate(parts):
        if part in ['Modules', 'addons', 'l10n-dominicana', 'l10n-dominicana-pro', 'l10n_do_jm']:
            if i + 1 < len(parts):
                module = parts[i + 1]
                if not module.startswith('v') and module not in ['models', 'views', 'security']:
                    return module
    return None

def extract_class_names(filepath):
    """Extract class names from _orca.py file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find class definitions
        class_pattern = r'class\s+(\w*OrcaLog\w*)\s*\('
        classes = re.findall(class_pattern, content)
        return classes
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return []

def extract_model_names(filepath):
    """Extract model names from _orca.py file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find _name assignments
        model_pattern = r"_name\s*=\s*['\"]([^'\"]*orca[^'\"]*)['\"]"
        models = re.findall(model_pattern, content)
        return models
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return []

def transform_class_name(old_class):
    """Transform class name: AccountMoveOrcaLog → OrcaAccountMoveLog"""
    # Remove the "OrcaLog" suffix to get the base name
    if old_class.endswith('OrcaLog'):
        base = old_class[:-7]  # Remove 'OrcaLog' (7 chars)
        return f"Orca{base}Log"
    elif old_class.endswith('Log'):
        # Already ends with Log but OrcaLog is somewhere in it
        match = re.match(r'(\w+)OrcaLog$', old_class)
        if match:
            base = match.group(1)
            return f"Orca{base}Log"
    return old_class

def transform_model_name(old_model):
    """Transform model name: 'module.orca.log' → 'orca.module.log'"""
    if '.orca.log' not in old_model:
        return old_model

    # Extract parts before 'orca.log'
    parts = old_model.split('.')
    orca_idx = parts.index('orca')

    # Everything before 'orca' becomes the module path after 'orca'
    before_orca = '.'.join(parts[:orca_idx])
    after_orca = '.'.join(parts[orca_idx+1:])

    new_model = f"orca.{before_orca}.{after_orca}"
    return new_model

def refactor_file(filepath, class_mappings, model_mappings, description_updates):
    """Refactor a single file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content

        # Replace class names
        for old_class, new_class in class_mappings.items():
            content = re.sub(
                rf'\bclass\s+{re.escape(old_class)}\s*\(',
                f'class {new_class}(',
                content
            )
            content = re.sub(
                rf'\bclass\s+{re.escape(old_class)}\s+\(',
                f'class {new_class} (',
                content
            )

        # Replace model names
        for old_model, new_model in model_mappings.items():
            content = content.replace(f"'{old_model}'", f"'{new_model}'")
            content = content.replace(f'"{old_model}"', f'"{new_model}"')

        # Replace descriptions
        for old_desc, new_desc in description_updates.items():
            content = content.replace(f"'{old_desc}'", f"'{new_desc}'")
            content = content.replace(f'"{old_desc}"', f'"{new_desc}"')

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
    workspace_dir = Path("C:/Users/yoeli/Documents/GetUpSoft_Workspace")
    base_path = workspace_dir / "02_Odoo_ERP/Odoo_Consolidated_Library"

    print("=" * 70)
    print("COMPREHENSIVE ORCA MODEL REFACTORING - ALL MODULES")
    print("=" * 70)
    print()

    # Find all *_orca.py files
    orca_files = sorted(base_path.rglob("*_orca.py"))

    total_files = len(orca_files)
    files_changed = 0

    for filepath in orca_files:
        relative_path = filepath.relative_to(workspace_dir)
        print(f"Processing: {relative_path}")

        # Extract transformations for this file
        class_names = extract_class_names(filepath)
        model_names = extract_model_names(filepath)

        if not class_names and not model_names:
            print(f"  ⚠ No ORCA models found, skipping")
            continue

        # Build transformation mappings
        class_mappings = {}
        model_mappings = {}
        description_updates = {}

        for old_class in class_names:
            new_class = transform_class_name(old_class)
            if old_class != new_class:
                class_mappings[old_class] = new_class
                print(f"  [CLASS] {old_class} => {new_class}")

        for old_model in model_names:
            new_model = transform_model_name(old_model)
            if old_model != new_model:
                model_mappings[old_model] = new_model
                print(f"  [MODEL] {old_model} => {new_model}")

        # Update descriptions with "  orca" suffix
        # Extract description from _description field
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            desc_pattern = r"_description\s*=\s*['\"]([^'\"]*)['\"]"
            matches = re.findall(desc_pattern, content)
            for desc in matches:
                if 'orca' not in desc.lower():
                    new_desc = f"{desc}  orca"
                    description_updates[desc] = new_desc
                    print(f"  [DESC] {desc} => {new_desc}")
        except:
            pass

        # Apply refactoring
        if refactor_file(filepath, class_mappings, model_mappings, description_updates):
            files_changed += 1
            print(f"  [OK] File refactored")
        else:
            print(f"  [OK] No changes needed")

        print()

    print("=" * 70)
    print(f"[DONE] REFACTORING COMPLETE: {files_changed}/{total_files} files modified")
    print("=" * 70)

    # Also refactor all related files (views, security, etc.)
    print()
    print("Refactoring related files (views, security, data, manifests)...")
    print()

    # Find all related directories with ORCA modules
    related_files_changed = refactor_related_files(base_path, orca_files)

    print()
    print("=" * 70)
    print(f"[DONE] ALL REFACTORING COMPLETE: {files_changed + related_files_changed} total files modified")
    print("=" * 70)

def refactor_related_files(base_path, orca_files):
    """Refactor views, security, data, and manifest files in ORCA modules."""
    files_changed = 0
    module_dirs = set()

    # Get all module directories containing ORCA files
    for orca_file in orca_files:
        module_dir = orca_file.parent.parent  # Go up from 'models' dir
        module_dirs.add(module_dir)

    for module_dir in module_dirs:
        # Find all related files
        related_patterns = [
            '*.xml',  # Views, security, data
            '__manifest__.py',
            '__init__.py'
        ]

        for pattern in related_patterns:
            for filepath in module_dir.rglob(pattern):
                if '_orca.py' not in filepath.name:  # Skip the main ORCA file (already handled)
                    if refactor_related_file(filepath, module_dir):
                        files_changed += 1

    return files_changed

def refactor_related_file(filepath, module_dir):
    """Refactor a related file (view, manifest, etc.)."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content

        # Apply general ORCA model name transformations
        # Pattern: l10n.do.accounting.orca.log → orca.l10n.do.accounting.move.log
        replacements = [
            (r'l10n\.do\.accounting\.orca\.log', 'orca.l10n.do.accounting.move.log'),
            (r'l10n\.do\.accounting\.report\.orca\.log', 'orca.l10n.do.accounting.report.log'),
            (r'l10n\.do\.pos\.orca\.log', 'orca.l10n.do.pos.order.log'),
            (r'l10n\.do\.rnc\.search\.orca\.log', 'orca.l10n.do.rnc.search.log'),
            (r'dgii\.report\.orca\.log', 'orca.dgii.report.log'),
            (r'account\.invoice\.orca\.log', 'orca.account.invoice.log'),
            (r'pos\.kitchen\.orca\.log', 'orca.pos.kitchen.log'),
            (r'pos\.printing\.orca\.log', 'orca.pos.printing.log'),
            (r'pos\.system\.orca\.log', 'orca.pos.system.log'),
            (r'pos\.printer\.orca\.log', 'orca.pos.printer.log'),
        ]

        for old_pattern, new_value in replacements:
            content = re.sub(old_pattern, new_value, content)

        # Apply class name transformations
        class_replacements = [
            (r'AccountMoveOrcaLog', 'OrcaAccountMoveLog'),
            (r'AccountingReportOrcaLog', 'OrcaAccountingReportLog'),
            (r'DgiiReportOrcaLog', 'OrcaDgiiReportLog'),
            (r'PosOrderOrcaLog', 'OrcaPosOrderLog'),
            (r'RncSearchOrcaLog', 'OrcaRncSearchLog'),
            (r'PosKitchenOrcaLog', 'OrcaPosKitchenLog'),
            (r'PosPrintingOrcaLog', 'OrcaPosPrintingLog'),
            (r'PosSystemOrcaLog', 'OrcaPosSystemLog'),
            (r'PosPrinterOrcaLog', 'OrcaPosPrinterLog'),
            (r'AccountInvoiceOrcaLog', 'OrcaAccountInvoiceLog'),
        ]

        for old_class, new_class in class_replacements:
            content = re.sub(rf'\b{old_class}\b', new_class, content)

        # Write back if changed
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

if __name__ == "__main__":
    main()
