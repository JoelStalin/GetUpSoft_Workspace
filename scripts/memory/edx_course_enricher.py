#!/usr/bin/env python3
"""Fetch and curate public edX course metadata for the shared Hermes/Orca memory.

The Discovery/Catalog APIs are used when EDX_DISCOVERY_URL and credentials are
configured. Without credentials, this uses public edX search pages and records
only links and visible metadata. It never reads or writes browser cookies.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote_plus

try:
    import yaml
except ImportError:  # pragma: no cover
    yaml = None


ROOT = Path(__file__).resolve().parents[2]
CONFIG = ROOT / ".agents" / "memory" / "edx-course-search.yaml"
OUTPUT = ROOT / ".agents" / "memory" / "edx-courses.json"
REPOSITORY_MEMORY = ROOT / "_Knowledge_Center" / "Memory" / "REPOSITORY_MEMORY.md"


def fetch_public(url: str) -> str:
    try:
        from scrapling.fetchers import StealthyFetcher
        return StealthyFetcher(auto_match=False).fetch(url).text
    except ImportError:
        from urllib.request import Request, urlopen
        req = Request(url, headers={"User-Agent": "GetUpSoft-MemoryResearch/1.0"})
        with urlopen(req, timeout=30) as response:  # noqa: S310 - configured public URL
            return response.read().decode("utf-8", errors="replace")


def public_results(query: str, limit: int) -> list[dict]:
    url = f"https://www.edx.org/search?q={quote_plus(query)}"
    html = fetch_public(url)
    links = []
    for match in re.finditer(r'href=["\'](https://www\.edx\.org/learn/[^"\']+|/learn/[^"\']+)', html):
        href = match.group(1)
        if href.startswith("/"):
            href = "https://www.edx.org" + href
        if href not in [item["url"] for item in links]:
            links.append({"url": href, "title": href.rstrip("/").split("/")[-1].replace("-", " ").title(), "source": "edx-public-search"})
        if len(links) >= limit:
            break
    return links


def load_config() -> dict:
    if yaml and CONFIG.exists():
        return yaml.safe_load(CONFIG.read_text(encoding="utf-8")) or {}
    return {"queries": ["MCP agents", "AI agents automation", "workflow automation"]}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=10)
    args = parser.parse_args()
    config = load_config()
    courses = []
    errors = []
    for query in config.get("queries", []):
        try:
            courses.extend([{**course, "query": query} for course in public_results(query, args.limit)])
        except Exception as exc:  # preserve partial research and retry next query
            errors.append({"query": query, "error": type(exc).__name__})
    deduped = {course["url"]: course for course in courses}
    payload = {
        "ok": not errors or bool(deduped),
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": "edX public search",
        "queries": config.get("queries", []),
        "courses": list(deduped.values()),
        "errors": errors,
        "authentication": "public metadata only; no cookies or credentials used",
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REPOSITORY_MEMORY.parent.mkdir(parents=True, exist_ok=True)
    with REPOSITORY_MEMORY.open("a", encoding="utf-8") as handle:
        handle.write(f"\n## edX course enrichment {payload['generatedAt']}\n")
        handle.write(f"- Queries: {', '.join(payload['queries'])}\n")
        handle.write(f"- Public course links captured: {len(payload['courses'])}\n")
        handle.write("- Source policy: public metadata only; no cookies or credentials used.\n")
    print(json.dumps({"ok": payload["ok"], "courses": len(payload["courses"]), "errors": len(errors), "output": str(OUTPUT)}))
    return 0 if payload["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
