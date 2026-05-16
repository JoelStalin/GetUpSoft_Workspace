from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

CURRENT_DIR = Path(__file__).resolve().parent
REPO_ROOT = CURRENT_DIR.parent.parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from getupsoft_portal_targets import DEFAULT_PORTAL_TARGETS  # noqa: E402
from profile_runtime import get_driver  # noqa: E402

PROFILE_NAME = os.getenv("SELENIUM_PROFILE", "Default")
HEADLESS = os.getenv("SELENIUM_HEADLESS", "0") == "1"


def url_reachable(url: str) -> bool:
    try:
        request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(request, timeout=8) as response:
            return int(getattr(response, "status", 200)) < 500
    except (urllib.error.URLError, TimeoutError, ValueError):
        return False


def select_url(target) -> tuple[str | None, bool]:
    if url_reachable(target.url):
        return target.url, False
    if target.fallback_url and url_reachable(target.fallback_url):
        return target.fallback_url, True
    return None, False


def run_suite() -> dict[str, object]:
    driver, profile_dir = get_driver(PROFILE_NAME, headless=HEADLESS)
    if driver is None:
        return {
            "status": "blocked",
            "detail": "Chrome profile is locked. Close Chrome manually and run again.",
        }

    results: list[dict[str, object]] = []
    try:
        wait = WebDriverWait(driver, 30)
        for target in DEFAULT_PORTAL_TARGETS:
            selected_url, fallback_used = select_url(target)
            if not selected_url:
                results.append(
                    {
                        "key": target.key,
                        "url": target.url,
                        "checked_url": None,
                        "fallback_used": False,
                        "status": "blocked",
                        "detail": "No publicly reachable DNS target was available from this execution environment.",
                    }
                )
                continue
            driver.get(selected_url)
            wait.until(lambda current: current.title.strip() == target.expected_title)
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, target.expected_root_selector)))
            page_text = driver.find_element(By.TAG_NAME, "body").text
            if target.expected_text and target.expected_text not in page_text:
                raise AssertionError(
                    f"Expected marker text not found for {target.key}: {target.expected_text}"
                )
            results.append(
                {
                    "key": target.key,
                    "url": target.url,
                    "checked_url": selected_url,
                    "fallback_used": fallback_used,
                    "title": driver.title.strip(),
                    "expected_text": target.expected_text,
                    "status": "pass",
                }
            )
    except Exception as exc:
        results.append(
            {
                "status": "fail",
                "error": f"{type(exc).__name__}: {exc}",
                "url": getattr(target, "url", None),
            }
        )
        return {
            "status": "fail",
            "profile_dir": str(profile_dir),
            "results": results,
        }
    finally:
        driver.quit()

    statuses = {item["status"] for item in results}
    final_status = "fail" if "fail" in statuses else "blocked" if "blocked" in statuses else "pass"
    return {
        "status": final_status,
        "profile_dir": str(profile_dir),
        "results": results,
    }


def main() -> int:
    report = run_suite()
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["status"] == "pass" else 2 if report["status"] == "blocked" else 1


if __name__ == "__main__":
    raise SystemExit(main())
