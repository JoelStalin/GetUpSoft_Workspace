#!/usr/bin/env python3
"""
Download OpenML Documentation & Components

Scrapes official OpenML documentation and saves it locally for memory/reference.
Covers tutorials, API docs, benchmarks, and dataset documentation.

FUTURO: Enhancement opportunities
- Extract Python/Java/C code examples
- Build searchable index of functions/classes
- Generate GraphQL schema documentation
- Track OpenML community resources
"""

import os
import json
from pathlib import Path
from datetime import datetime
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time

# Configuration
DOC_OUTPUT_DIR = Path(__file__).parent.parent / ".agents" / "memory" / "openml-documentation"
OPENML_DOCS_URL = "https://docs.openml.org"
OPENML_API_URL = "https://www.openml.org/api/v1"

# Headers to avoid being blocked
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

# Ensure output directory exists
DOC_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def download_documentation_page(url, title, category):
    """Download a documentation page"""
    try:
        print(f"  ⬇️  {title:30} ...", end=" ", flush=True)
        response = requests.get(url, headers=HEADERS, timeout=15)

        if response.status_code == 200:
            category_dir = DOC_OUTPUT_DIR / category
            category_dir.mkdir(exist_ok=True)

            # Save HTML
            filename = category_dir / f"{title.lower().replace(' ', '_')}.html"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(response.text)

            file_size = len(response.text) / 1024  # KB
            print(f"✅ ({file_size:.1f} KB)")

            return {
                'title': title,
                'url': url,
                'file': str(filename.relative_to(DOC_OUTPUT_DIR)),
                'size_kb': round(file_size, 1),
                'category': category
            }
        else:
            print(f"⚠️  (HTTP {response.status_code})")
            return None
    except Exception as e:
        print(f"❌ ({str(e)[:40]})")
        return None

def download_openml_docs():
    """Download OpenML documentation"""

    print("=" * 70)
    print("📚 OpenML Documentation Downloader")
    print("=" * 70)
    print(f"📂 Output directory: {DOC_OUTPUT_DIR}\n")

    downloaded = []
    categories = {}

    # Main documentation pages to download
    docs_to_download = [
        # Getting Started
        ("Getting Started", f"{OPENML_DOCS_URL}/", "getting-started"),
        ("About OpenML", f"{OPENML_DOCS_URL}/about", "getting-started"),
        ("Quick Start", f"{OPENML_DOCS_URL}/quick-start", "getting-started"),

        # Guides & Tutorials
        ("Tutorials", f"{OPENML_DOCS_URL}/guide/", "guides"),
        ("Python Guide", f"{OPENML_DOCS_URL}/guide/python/", "guides"),
        ("R Guide", f"{OPENML_DOCS_URL}/guide/r/", "guides"),
        ("Java Guide", f"{OPENML_DOCS_URL}/guide/java/", "guides"),

        # API Documentation
        ("REST API", f"{OPENML_DOCS_URL}/api/", "api"),
        ("API Reference", f"{OPENML_DOCS_URL}/api/v1/", "api"),
        ("Authentication", f"{OPENML_DOCS_URL}/api/authentication/", "api"),
        ("Data API", f"{OPENML_DOCS_URL}/api/data/", "api"),

        # Python API
        ("Python API", f"{OPENML_DOCS_URL}/python-api/", "python-api"),
        ("Python Classes", f"{OPENML_DOCS_URL}/python-api/classes/", "python-api"),
        ("Python Functions", f"{OPENML_DOCS_URL}/python-api/functions/", "python-api"),

        # Benchmarks
        ("Benchmarks", f"{OPENML_DOCS_URL}/benchmark/", "benchmarks"),
        ("OpenML-CC18", f"{OPENML_DOCS_URL}/benchmark/openml-cc18/", "benchmarks"),
        ("OpenML-C10", f"{OPENML_DOCS_URL}/benchmark/openml-c10/", "benchmarks"),

        # Data & Datasets
        ("Datasets Guide", f"{OPENML_DOCS_URL}/guide/datasets/", "data"),
        ("Upload Datasets", f"{OPENML_DOCS_URL}/guide/upload/", "data"),
        ("Data Format", f"{OPENML_DOCS_URL}/guide/data-format/", "data"),

        # Tasks & Experiments
        ("Tasks", f"{OPENML_DOCS_URL}/guide/tasks/", "experiments"),
        ("Runs & Results", f"{OPENML_DOCS_URL}/guide/runs/", "experiments"),
        ("Flows", f"{OPENML_DOCS_URL}/guide/flows/", "experiments"),

        # Advanced Topics
        ("SSL Certificates", f"{OPENML_DOCS_URL}/guide/ssl/", "advanced"),
        ("Batch Uploads", f"{OPENML_DOCS_URL}/guide/batch-upload/", "advanced"),
        ("Data Formats", f"{OPENML_DOCS_URL}/guide/formats/", "advanced"),
    ]

    print("📚 Downloading OpenML Documentation...\n")

    for title, url, category in docs_to_download:
        if category not in categories:
            print(f"\n📁 {category.upper()}")
            categories[category] = []

        result = download_documentation_page(url, title, category)
        if result:
            downloaded.append(result)
            categories[category].append(result)

        time.sleep(0.3)  # Rate limiting

    # Create index
    print("\n📋 Creating index...")
    index = {
        'downloaded_at': datetime.now().isoformat(),
        'total_files': len(downloaded),
        'total_size_kb': sum(d['size_kb'] for d in downloaded),
        'categories': categories,
        'all_documents': downloaded,
        'base_url': OPENML_DOCS_URL,
        'note': 'Public OpenML documentation for reference and memory. Use locally.'
    }

    index_file = DOC_OUTPUT_DIR / "INDEX.json"
    with open(index_file, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2)

    print("✅ Index created")

    # Create README
    create_readme(categories, downloaded)

    # Print summary
    print("\n" + "=" * 70)
    print("✅ OPENML DOCUMENTATION DOWNLOAD COMPLETE")
    print("=" * 70)

    total_size = sum(d['size_kb'] for d in downloaded)

    print(f"\n📊 Summary:")
    print(f"   Total files:    {len(downloaded)}")
    print(f"   Total size:     {total_size:.1f} KB (~{total_size/1024:.1f} MB)")

    for category in sorted(categories.keys()):
        docs = categories[category]
        size = sum(d['size_kb'] for d in docs)
        print(f"   {category:20} {len(docs):3} files ({size:8.1f} KB)")

    print(f"\n📂 Organized in:")
    for category in sorted(set(d['category'] for d in downloaded)):
        print(f"   • {category}/")

    print(f"\n📍 Location: {DOC_OUTPUT_DIR}")
    print(f"⏰ Timestamp: {index['downloaded_at']}")
    print("=" * 70)

def create_readme(categories, downloaded):
    """Create README for OpenML documentation"""
    readme_path = DOC_OUTPUT_DIR / "README.md"

    categories_list = "\n".join([
        f"- **{cat.replace('-', ' ').title()}** ({len(docs)} files)\n" +
        "\n".join([f"  - {doc['title']}" for doc in docs])
        for cat, docs in sorted(categories.items())
    ])

    readme_content = f"""# OpenML Documentation Archive

This directory contains downloaded public documentation from OpenML.org.

## Contents

### Documentation Sections

{categories_list}

## Quick Start

### For Local Reference
1. Open HTML files directly in your browser
2. All documentation is self-contained
3. No internet required after download

### For Search & Integration
Use `INDEX.json` to programmatically access:
- File locations and URLs
- File sizes and categories
- Download timestamp
- Complete metadata

## OpenML Overview

OpenML is an open, collaborative platform for machine learning research:
- **Datasets:** Repository of datasets for benchmarking
- **Tasks:** Standardized machine learning tasks
- **Flows:** Pipeline definitions and workflows
- **Runs:** Experiment execution and results
- **API:** REST and Python interfaces
- **Community:** Shared benchmarks and evaluations

## Documentation Categories

1. **Getting Started** - Introduction and quick start guides
2. **Guides** - Language-specific guides (Python, R, Java)
3. **API** - REST API and authentication documentation
4. **Python API** - Python library reference and examples
5. **Benchmarks** - OpenML benchmark definitions and results
6. **Data** - Dataset management and upload procedures
7. **Experiments** - Tasks, runs, and result tracking
8. **Advanced** - SSL, batch uploads, data formats

## Usage

### Python Example
```python
import openml

# Fetch a dataset
dataset = openml.datasets.get_dataset(61)
X, y, categorical_indicator, attribute_names = dataset.get_data()

# List datasets
datasets = openml.datasets.list_datasets()

# Run an experiment
task = openml.tasks.get_task(119)
run = openml.runs.create_run(flow_id=123, task=task)
```

### R Example
```r
library(OpenML)

# Get a dataset
data <- getOMLDataSet(data.id = 61)

# List datasets
datasets <- listOMLDatasets()

# Create a run
run <- runTaskMLC(task.id = 119)
```

## API Quick Reference

### REST Endpoints
```
GET  /data/<data_id>                  - Get dataset
GET  /task/<task_id>                  - Get task
GET  /flow/<flow_id>                  - Get flow
GET  /run/<run_id>                    - Get run result
POST /run                             - Submit new run
```

### Python API
```python
openml.datasets.get_dataset(id)
openml.tasks.get_task(id)
openml.flows.get_flow(id)
openml.runs.create_run(flow_id, task)
openml.evaluations.list_evaluations(task_id)
```

## Integration with Claude Memory

Files are indexed in `.agents/memory/openml-documentation/`

Use `INDEX.json` for:
- Programmatic access to documentation
- Building knowledge graphs
- Creating documentation indices
- Cross-referencing with other memory systems

## File Organization

```
openml-documentation/
├── getting-started/
│   ├── getting_started.html
│   ├── about_openml.html
│   └── quick_start.html
├── guides/
│   ├── tutorials.html
│   ├── python_guide.html
│   ├── r_guide.html
│   └── java_guide.html
├── api/
│   ├── rest_api.html
│   ├── api_reference.html
│   ├── authentication.html
│   └── data_api.html
├── python-api/
├── benchmarks/
├── data/
├── experiments/
├── advanced/
├── INDEX.json     (Metadata and file listing)
└── README.md      (This file)
```

## References

- **Official Website:** https://www.openml.org
- **Documentation:** https://docs.openml.org
- **API Docs:** https://www.openml.org/api/v1
- **Python Package:** https://github.com/openml/openml-python
- **GitHub:** https://github.com/openml

## Last Updated

See `INDEX.json` for exact timestamp.

## Notes

- All documentation is public and freely available
- OpenML is open-source (Apache 2.0 license)
- Community-driven research platform
- Active development and updates

---

Generated: {datetime.now().isoformat()}
Tool: Python requests + BeautifulSoup
Size: Complete documentation mirror
"""

    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(readme_content)

    print("✅ README created")

def main():
    """Main entry point"""
    try:
        download_openml_docs()
        print("\n✅ OpenML documentation successfully archived!")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
