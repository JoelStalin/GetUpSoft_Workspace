# Web Documentation Archive

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
