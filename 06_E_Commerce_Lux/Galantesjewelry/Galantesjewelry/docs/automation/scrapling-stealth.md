# Scrapling Stealth Automation

Use `scripts/scrapling_stealth_fetch.py` when an approved automation needs to extract public data from a site that blocks simple `requests` or static HTML clients.

## Install

```powershell
pip install "scrapling[fetchers]"
scrapling install
```

## Examples

Extract links as JSON:

```powershell
python scripts/scrapling_stealth_fetch.py "https://example.com" --selector "a::attr(href)"
```

Extract page headings as text:

```powershell
python scripts/scrapling_stealth_fetch.py "https://example.com" --selector "h1::text" --format text
```

Run visibly for debugging:

```powershell
python scripts/scrapling_stealth_fetch.py "https://example.com" --headed
```

## Rules

- Use only on sites where scraping is authorized.
- Prefer official APIs when available.
- Do not store scraped personal data unless the workflow explicitly requires it and has a retention rule.
- For Selenium E2E tests, keep using the repository profile-runtime pattern. Scrapling is for scraping/extraction automation, not for replacing functional Selenium browser QA.
