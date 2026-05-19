from __future__ import annotations

import json
import os
import sys
import time
from dataclasses import dataclass
from pathlib import Path

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from profile_runtime import get_driver  # noqa: E402

GLOBAL_BASE_URL = os.getenv("GLOBAL_BASE_URL", "https://getupsoft.com").rstrip("/")
RD_BASE_URL = os.getenv("RD_BASE_URL", "https://getupsoft.com.do").rstrip("/")
PROFILE_NAME = os.getenv("SELENIUM_PROFILE", "Default")
HEADLESS = os.getenv("SELENIUM_HEADLESS", "0") == "1"
ARTIFACT_ROOT = Path(os.getenv("SELENIUM_ARTIFACT_DIR", CURRENT_DIR / "artifacts"))


@dataclass(frozen=True)
class PageTarget:
    key: str
    url: str
    expected_text: str
    click_selector: str | None = None
    expected_after_click: str | None = None


TARGETS = [
    PageTarget("global_home", f"{GLOBAL_BASE_URL}/", "Architectural Intelligence", "a[href='/contact']", "/contact"),
    PageTarget("global_ai_agents", f"{GLOBAL_BASE_URL}/ai-agents", "Enterprise AI Agents"),
    PageTarget("global_integration", f"{GLOBAL_BASE_URL}/system-integration", "System Integration"),
    PageTarget("global_products", f"{GLOBAL_BASE_URL}/products", "Products & Cases"),
    PageTarget("global_contact", f"{GLOBAL_BASE_URL}/contact", "Contact"),
    PageTarget("rd_home", f"{RD_BASE_URL}/", "Infraestructura y gestión", "a[href='/contacto']", "/contacto"),
    PageTarget("rd_odoo", f"{RD_BASE_URL}/odoo-erp", "Odoo ERP"),
    PageTarget("rd_facturacion", f"{RD_BASE_URL}/facturacion-electronica", "Facturación Electrónica"),
    PageTarget("rd_infraestructura", f"{RD_BASE_URL}/infraestructura", "Infraestructura Tecnológica"),
    PageTarget("rd_contacto", f"{RD_BASE_URL}/contacto", "Contacto"),
]


def check(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def broken_images(driver) -> list[dict[str, object]]:
    return driver.execute_script(
        """
        return Array.from(document.images)
          .filter((img) => !img.complete || img.naturalWidth === 0)
          .map((img) => ({src: img.currentSrc || img.src, alt: img.alt || '', width: img.naturalWidth}));
        """
    )


def browser_errors(driver) -> list[str]:
    ignored = ("favicon", "googleapis", "gstatic")
    errors: list[str] = []
    for entry in driver.get_log("browser"):
        message = entry.get("message", "")
        if entry.get("level") in {"SEVERE", "ERROR"} and not any(token in message for token in ignored):
            errors.append(message)
    return errors


def run_suite() -> dict[str, object]:
    run_id = time.strftime("%Y%m%d-%H%M%S")
    artifact_dir = ARTIFACT_ROOT / run_id
    artifact_dir.mkdir(parents=True, exist_ok=True)

    driver, profile_dir = get_driver(PROFILE_NAME, headless=HEADLESS)
    if driver is None:
        return {"status": "blocked", "detail": "Chrome profile locked", "artifact_dir": str(artifact_dir)}

    wait = WebDriverWait(driver, 30)
    results: list[dict[str, object]] = []

    try:
        for target in TARGETS:
            driver.get(target.url)
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "#root")))
            wait.until(lambda d: target.expected_text in d.find_element(By.TAG_NAME, "body").text)

            image_failures = broken_images(driver)
            console_errors = browser_errors(driver)

            check(not image_failures, f"Broken images on {target.key}: {image_failures}")
            check(not console_errors, f"Console errors on {target.key}: {console_errors}")

            screenshot = artifact_dir / f"{target.key}.png"
            driver.save_screenshot(str(screenshot))

            click_result = None
            if target.click_selector and target.expected_after_click:
                driver.find_element(By.CSS_SELECTOR, target.click_selector).click()
                wait.until(lambda d: target.expected_after_click in d.current_url)
                click_result = driver.current_url

            results.append(
                {
                    "key": target.key,
                    "url": target.url,
                    "title": driver.title,
                    "screenshot": str(screenshot),
                    "click_result": click_result,
                    "status": "pass",
                }
            )
    except Exception as exc:
        failure_key = getattr(locals().get("target", None), "key", "unknown")
        try:
            driver.save_screenshot(str(artifact_dir / f"{failure_key}_failure.png"))
            (artifact_dir / f"{failure_key}_failure.html").write_text(driver.page_source, encoding="utf-8")
        except Exception:
            pass
        results.append({"status": "fail", "error": f"{type(exc).__name__}: {exc}", "url": driver.current_url})
        return {"status": "fail", "profile_dir": str(profile_dir), "artifact_dir": str(artifact_dir), "results": results}
    finally:
        driver.quit()

    return {"status": "pass", "profile_dir": str(profile_dir), "artifact_dir": str(artifact_dir), "results": results}


def main() -> int:
    report = run_suite()
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["status"] == "pass" else 2 if report["status"] == "blocked" else 1


if __name__ == "__main__":
    raise SystemExit(main())
