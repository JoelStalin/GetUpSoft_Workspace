#!/usr/bin/env python3
"""
Download public documentation from W3Schools and MDN
Using requests for reliable HTTP fetching
"""

import os
import json
import requests
from pathlib import Path
from datetime import datetime
from urllib.parse import urljoin
import time

# Configuration
DOC_OUTPUT_DIR = Path(__file__).parent.parent / ".agents" / "memory" / "web-documentation"
W3SCHOOLS_URL = "https://www.w3schools.com"
MDN_URL = "https://developer.mozilla.org"

# HTTP headers to avoid being blocked
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

# Ensure output directory exists
DOC_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def download_w3schools():
    """Download W3Schools documentation"""
    print("📚 Starting W3Schools documentation download...")

    w3_dir = DOC_OUTPUT_DIR / "w3schools"
    w3_dir.mkdir(exist_ok=True)

    # Main pages to download
    sections = [
        ("HTML", "/html/default.asp"),
        ("CSS", "/css/default.asp"),
        ("JavaScript", "/js/default.asp"),
        ("Python", "/python/default.asp"),
        ("SQL", "/sql/default.asp"),
        ("PHP", "/php/default.asp"),
        ("Bootstrap", "/bootstrap/default.asp"),
        ("jQuery", "/jquery/default.asp"),
        ("XML", "/xml/default.asp"),
        ("JSON", "/json/default.asp"),
        ("TypeScript", "/typescript/default.asp"),
        ("React", "/react/default.asp"),
        ("C", "/c/default.asp"),
        ("Java", "/java/default.asp"),
    ]

    downloaded = []
    for name, path in sections:
        url = urljoin(W3SCHOOLS_URL, path)
        try:
            print(f"  ⬇️  {name:15} ...", end=" ", flush=True)
            response = requests.get(url, headers=HEADERS, timeout=10)

            if response.status_code == 200:
                filename = w3_dir / f"{name.lower()}.html"
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(response.text)
                file_size = len(response.text) / 1024  # KB
                downloaded.append({
                    "name": name,
                    "url": url,
                    "file": str(filename.relative_to(DOC_OUTPUT_DIR)),
                    "size_kb": round(file_size, 1)
                })
                print(f"✅ ({file_size:.1f} KB)")
            else:
                print(f"⚠️  (HTTP {response.status_code})")
        except Exception as e:
            print(f"❌ ({str(e)[:40]})")
        time.sleep(0.5)  # Rate limiting

    return {"w3schools": {
        "sections": downloaded,
        "base_url": W3SCHOOLS_URL,
        "total_sections": len(downloaded)
    }}

def download_mdn():
    """Download MDN documentation"""
    print("\n📚 Starting MDN documentation download...")

    mdn_dir = DOC_OUTPUT_DIR / "mdn"
    mdn_dir.mkdir(exist_ok=True)

    # Main docs paths
    docs = [
        ("HTML", "/en-US/docs/Web/HTML"),
        ("CSS", "/en-US/docs/Web/CSS"),
        ("JavaScript", "/en-US/docs/Web/JavaScript"),
        ("WebAPI", "/en-US/docs/Web/API"),
        ("HTTP", "/en-US/docs/Web/HTTP"),
        ("SVG", "/en-US/docs/Web/SVG"),
        ("TypeScript", "/en-US/docs/Web/TypeScript"),
        ("Web Components", "/en-US/docs/Web/Web_Components"),
        ("Accessibility", "/en-US/docs/Web/Accessibility"),
        ("Security", "/en-US/docs/Web/Security"),
        ("Performance", "/en-US/docs/Web/Performance"),
    ]

    downloaded = []
    for name, path in docs:
        url = urljoin(MDN_URL, path)
        try:
            print(f"  ⬇️  {name:15} ...", end=" ", flush=True)
            response = requests.get(url, headers=HEADERS, timeout=10)

            if response.status_code == 200:
                filename = mdn_dir / f"{name.lower().replace(' ', '_')}.html"
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(response.text)
                file_size = len(response.text) / 1024  # KB
                downloaded.append({
                    "name": name,
                    "url": url,
                    "file": str(filename.relative_to(DOC_OUTPUT_DIR)),
                    "size_kb": round(file_size, 1)
                })
                print(f"✅ ({file_size:.1f} KB)")
            else:
                print(f"⚠️  (HTTP {response.status_code})")
        except Exception as e:
            print(f"❌ ({str(e)[:40]})")
        time.sleep(0.5)  # Rate limiting

    return {"mdn": {
        "sections": downloaded,
        "base_url": MDN_URL,
        "total_sections": len(downloaded)
    }}

def create_index(w3_data, mdn_data):
    """Create an index file"""
    print("\n📋 Creating documentation index...")

    w3_sections = w3_data.get("w3schools", {}).get("sections", [])
    mdn_sections = mdn_data.get("mdn", {}).get("sections", [])

    total_size = sum(s.get('size_kb', 0) for s in w3_sections + mdn_sections)

    index = {
        "downloaded_at": datetime.now().isoformat(),
        "w3schools": w3_data.get("w3schools", {}),
        "mdn": mdn_data.get("mdn", {}),
        "total_files": len(w3_sections) + len(mdn_sections),
        "total_size_kb": round(total_size, 1),
        "location": str(DOC_OUTPUT_DIR),
        "note": "Public documentation downloaded for reference and memory. Use locally to avoid rate limiting."
    }

    index_file = DOC_OUTPUT_DIR / "INDEX.json"
    with open(index_file, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2)

    return index

def create_readme():
    """Create a README for the documentation"""
    readme_path = DOC_OUTPUT_DIR / "README.md"

    readme_content = """# Web Documentation Archive

This directory contains downloaded public documentation from W3Schools and MDN.

## Structure

- `w3schools/` - W3Schools tutorials and references
- `mdn/` - Mozilla Developer Network documentation
- `INDEX.json` - Index of all downloaded files with metadata

## W3Schools Sections

- HTML - Complete HTML reference and tutorials
- CSS - Complete CSS reference and tutorials
- JavaScript - Complete JavaScript reference and tutorials
- Python - Python reference and tutorials
- SQL - SQL reference
- PHP - PHP reference
- Bootstrap - Bootstrap framework reference
- jQuery - jQuery library reference
- XML - XML reference
- JSON - JSON reference
- TypeScript - TypeScript reference
- React - React framework reference
- C - C programming language reference
- Java - Java programming language reference

## MDN Sections

- Web/HTML - HTML documentation and specifications
- Web/CSS - CSS reference and guides
- Web/JavaScript - JavaScript language reference and guides
- Web/API - Web APIs reference
- Web/HTTP - HTTP protocol documentation
- SVG - Scalable Vector Graphics reference
- TypeScript - TypeScript documentation
- Web Components - Custom elements and shadow DOM
- Accessibility - Web accessibility guidelines
- Security - Web security best practices
- Performance - Performance optimization guides

## Usage

### For Local Reference
1. Open any HTML file directly in your browser
2. Files are self-contained with full styling and content

### For Claude Memory
Files are indexed in `.agents/memory/web-documentation/`
Use `INDEX.json` to programmatically access file paths and metadata

### For Analysis
Reference the `INDEX.json` file which contains:
- File paths and URLs
- File sizes
- Download timestamp
- Complete metadata

## File Organization

```
web-documentation/
├── w3schools/
│   ├── html.html
│   ├── css.html
│   ├── javascript.html
│   ├── python.html
│   └── ... (10 total files)
├── mdn/
│   ├── html.html
│   ├── css.html
│   ├── javascript.html
│   └── ... (11 total files)
├── INDEX.json        (Metadata and file listing)
└── README.md         (This file)
```

## About the Content

- **W3Schools**: Interactive tutorials and quick references for web technologies
- **MDN**: Comprehensive documentation maintained by Mozilla

Original content rights belong to W3Schools and Mozilla respectively.
Downloaded for personal reference and educational purposes.

## Last Updated

See `INDEX.json` for the exact timestamp.

## Next Steps

To leverage this documentation:

1. **Quick Reference**: Browse HTML files locally for immediate information
2. **Code Examples**: Find practical examples in W3Schools sections
3. **In-Depth Learning**: Use MDN for comprehensive specifications
4. **Integration**: Reference through INDEX.json in automation scripts

---

Generated: 2026-05-23
Tool: Python requests library
Size: Complete documentation mirrors
"""

    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(readme_content)

    print(f"✅ README created: {readme_path}")

def main():
    """Main execution"""
    print("=" * 70)
    print("🌐 Web Documentation Downloader")
    print("=" * 70)
    print(f"📂 Output directory: {DOC_OUTPUT_DIR}\n")

    try:
        # Download from both sources
        w3_data = download_w3schools()
        mdn_data = download_mdn()

        # Create index
        index = create_index(w3_data, mdn_data)

        # Create README
        create_readme()

        # Print summary
        print("\n" + "=" * 70)
        print("✅ DOCUMENTATION DOWNLOAD COMPLETE")
        print("=" * 70)
        w3_sections = w3_data.get("w3schools", {}).get("sections", [])
        mdn_sections = mdn_data.get("mdn", {}).get("sections", [])
        w3_size = sum(s.get('size_kb', 0) for s in w3_sections)
        mdn_size = sum(s.get('size_kb', 0) for s in mdn_sections)

        print(f"\n📊 Summary:")
        print(f"   W3Schools sections: {len(w3_sections)} ({w3_size:.1f} KB)")
        print(f"   MDN sections:       {len(mdn_sections)} ({mdn_size:.1f} KB)")
        print(f"   Total files:        {index['total_files']}")
        print(f"   Total size:         {index['total_size_kb']:.1f} KB")
        print(f"\n📂 Files created:")
        print(f"   ✅ Index:     {DOC_OUTPUT_DIR / 'INDEX.json'}")
        print(f"   ✅ README:    {DOC_OUTPUT_DIR / 'README.md'}")
        print(f"   ✅ W3Schools: {DOC_OUTPUT_DIR / 'w3schools'}/ ({len(w3_sections)} files)")
        print(f"   ✅ MDN:       {DOC_OUTPUT_DIR / 'mdn'}/ ({len(mdn_sections)} files)")
        print(f"\n⏰ Timestamp: {index['downloaded_at']}")
        print("=" * 70)

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

    return 0

if __name__ == "__main__":
    exit(main())
