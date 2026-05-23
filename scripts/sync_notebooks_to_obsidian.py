#!/usr/bin/env python3
"""
Sync Jupyter Notebooks to Obsidian Markdown

Converts notebook metadata and outputs to markdown files
that can be imported into Obsidian for searchable memory.

FUTURO: Add features:
- Two-way sync (Obsidian changes -> Jupyter)
- Real-time sync with watchers
- Selective sync (include/exclude certain notebooks)
- Custom metadata preservation
- Relationship/backlink generation
"""

import json
import os
from pathlib import Path
from datetime import datetime
import subprocess
import sys

def get_notebooks_dir():
    """Get notebooks directory path"""
    script_dir = Path(__file__).parent.parent
    return script_dir / "notebooks"

def get_obsidian_vault():
    """Get Obsidian vault path"""
    workspace_dir = Path(__file__).parent.parent
    return workspace_dir / "obsidian" / "vault" / "Notebooks"

def extract_metadata(notebook_path):
    """Extract metadata from notebook"""
    try:
        with open(notebook_path, 'r', encoding='utf-8') as f:
            nb = json.load(f)

        # Try to extract metadata from first cell
        metadata = {
            'title': notebook_path.stem,
            'created': datetime.now().isoformat(),
            'source': str(notebook_path.relative_to(get_notebooks_dir())),
        }

        # Look for metadata in notebook structure
        if 'metadata' in nb:
            if 'title' in nb['metadata']:
                metadata['title'] = nb['metadata']['title']

        return metadata
    except Exception as e:
        print(f"Error extracting metadata: {e}")
        return None

def convert_notebook_to_markdown(notebook_path, output_path):
    """Convert notebook to markdown using nbconvert"""
    try:
        cmd = [
            'jupyter', 'nbconvert',
            '--to', 'markdown',
            '--output-dir', str(output_path.parent),
            '--output', str(output_path.name),
            str(notebook_path)
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode == 0:
            return True
        else:
            print(f"Error converting {notebook_path}: {result.stderr}")
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False

def add_obsidian_frontmatter(markdown_path, metadata):
    """Add Obsidian frontmatter (YAML) to markdown file"""
    try:
        with open(markdown_path, 'r', encoding='utf-8') as f:
            content = f.read()

        frontmatter = f"""---
title: {metadata.get('title', 'Untitled')}
created: {metadata.get('created', '')}
source: {metadata.get('source', '')}
type: notebook
tags: [jupyter, memory]
---

"""

        with open(markdown_path, 'w', encoding='utf-8') as f:
            f.write(frontmatter + content)

        return True
    except Exception as e:
        print(f"Error adding frontmatter: {e}")
        return False

def sync_notebooks():
    """Sync all notebooks to Obsidian markdown"""

    notebooks_dir = get_notebooks_dir()
    obsidian_vault = get_obsidian_vault()

    print("=" * 60)
    print("Syncing Jupyter Notebooks to Obsidian")
    print("=" * 60)

    # Create Obsidian vault directory if it doesn't exist
    obsidian_vault.mkdir(parents=True, exist_ok=True)

    # Create subdirectories for categories
    categories = ['memory', 'analysis', 'code', 'research']
    for category in categories:
        (obsidian_vault / category).mkdir(exist_ok=True)

    synced_count = 0
    error_count = 0

    # Sync notebooks from each category
    for category in categories:
        category_dir = notebooks_dir / category

        if not category_dir.exists():
            continue

        print(f"\n📁 Processing {category.upper()} notebooks...")

        for notebook_file in category_dir.glob('*.ipynb'):
            print(f"  ⬇️  {notebook_file.name}...", end=" ")

            # Extract metadata
            metadata = extract_metadata(notebook_file)
            if not metadata:
                print("❌ (metadata error)")
                error_count += 1
                continue

            # Convert to markdown
            md_name = notebook_file.stem + '.md'
            md_path = obsidian_vault / category / md_name

            if convert_notebook_to_markdown(notebook_file, md_path):
                # Add Obsidian frontmatter
                if add_obsidian_frontmatter(md_path, metadata):
                    print(f"✅")
                    synced_count += 1
                else:
                    print("⚠️ (frontmatter error)")
                    error_count += 1
            else:
                print("❌")
                error_count += 1

    # Print summary
    print("\n" + "=" * 60)
    print("📋 Sync Summary")
    print("=" * 60)
    print(f"✅ Synced: {synced_count}")
    print(f"❌ Errors: {error_count}")
    print(f"\n📂 Obsidian vault: {obsidian_vault}")
    print(f"\nNotebooks are now searchable in Obsidian!")
    print("=" * 60)

def main():
    """Main entry point"""
    try:
        sync_notebooks()
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
