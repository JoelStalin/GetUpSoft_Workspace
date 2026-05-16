from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
from urllib.parse import urlparse
from pathlib import Path

CURRENT_DIR = Path(__file__).resolve().parent
REPO_ROOT = CURRENT_DIR.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from scripts.scrapling_stealth_fetch import fetch_with_scrapling  # noqa: E402
from tests.e2e.getupsoft_portal_targets import DEFAULT_PORTAL_TARGETS, PortalTarget  # noqa: E402


def url_reachable(url: str) -> bool:
    try:
        request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(request, timeout=8) as response:
            return int(getattr(response, "status", 200)) < 500
    except (urllib.error.URLError, TimeoutError, ValueError):
        return False


def select_url(target: PortalTarget) -> tuple[str | None, bool]:
    if url_reachable(target.url):
        return target.url, False
    if target.fallback_url and url_reachable(target.fallback_url):
        return target.fallback_url, True
    return None, False


def inspect_target(target: PortalTarget) -> dict[str, object]:
    selected_url, fallback_used = select_url(target)
    if not selected_url:
        return {
            "key": target.key,
            "url": target.url,
            "checked_url": None,
            "fallback_used": False,
            "expected_title": target.expected_title,
            "actual_title": None,
            "root_selector": target.expected_root_selector,
            "root_count": 0,
            "asset_count": 0,
            "status": "blocked",
            "detail": "No publicly reachable DNS target was available from this execution environment.",
        }
    page = fetch_with_scrapling(selected_url, solve_cloudflare=True, headless=True, network_idle=True)
    title = (page.css("title::text").get() or "").strip()
    root_count = len(page.css(target.expected_root_selector).getall())
    asset_count = len(page.css("script[src], link[rel='stylesheet']").getall())
    body_text = " ".join(part.strip() for part in page.css("body *::text").getall() if part.strip())
    text_ok = True if not target.expected_text else target.expected_text in body_text
    passed = title == target.expected_title and root_count >= 1 and asset_count >= 1 and text_ok
    return {
        "key": target.key,
        "url": target.url,
        "checked_url": selected_url,
        "fallback_used": fallback_used,
        "expected_title": target.expected_title,
        "actual_title": title,
        "expected_text": target.expected_text,
        "text_found": text_ok,
        "root_selector": target.expected_root_selector,
        "root_count": root_count,
        "asset_count": asset_count,
        "status": "pass" if passed else "fail",
    }


def main() -> int:
    try:
        results = [inspect_target(target) for target in DEFAULT_PORTAL_TARGETS]
    except RuntimeError as exc:
        print(json.dumps({"status": "blocked", "detail": str(exc)}, ensure_ascii=False, indent=2))
        return 2
    statuses = {item["status"] for item in results}
    if "fail" in statuses:
        status = "fail"
    elif "blocked" in statuses:
        status = "blocked"
    else:
        status = "pass"
    print(json.dumps({"status": status, "results": results}, ensure_ascii=False, indent=2))
    return 0 if status == "pass" else 2 if status == "blocked" else 1


if __name__ == "__main__":
    raise SystemExit(main())
