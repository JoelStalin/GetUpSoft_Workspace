from __future__ import annotations

import os
import sys
import time
from pathlib import Path

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

BASE_URL = os.getenv("E2E_BASE_URL", "https://galantesjewelry.com").rstrip("/")
PROFILE_NAME = os.getenv("SELENIUM_PROFILE", "Profile 9")
HEADLESS = os.getenv("SELENIUM_HEADLESS", "0") == "1"

CURRENT_DIR = Path(__file__).resolve().parent.parent
E2E_DIR = CURRENT_DIR / "tests" / "e2e"
if str(E2E_DIR) not in sys.path:
    sys.path.insert(0, str(E2E_DIR))

from profile_runtime import get_driver as get_profile_runtime_driver


def get_driver():
    driver, _ = get_profile_runtime_driver(PROFILE_NAME, headless=HEADLESS)
    return driver


def wait_for_product_cards(driver, wait: WebDriverWait, min_cards: int = 3) -> int:
    def predicate(current) -> bool:
        cards = current.find_elements(By.CSS_SELECTOR, 'a[href^="/shop/"] img[src^="/api/products/image?id="]')
        return len(cards) >= min_cards

    wait.until(predicate)
    return len(driver.find_elements(By.CSS_SELECTOR, 'a[href^="/shop/"] img[src^="/api/products/image?id="]'))


def main() -> None:
    driver = get_driver()
    if not driver:
        print("BLOCKED: Chrome profile is locked. Close Chrome manually and rerun.")
        return

    try:
        wait = WebDriverWait(driver, 40)

        print("--- Verifying home product catalog ---")
        driver.get(f"{BASE_URL}/")
        wait_for_product_cards(driver, wait, min_cards=3)
        body_text = driver.find_element(By.TAG_NAME, "body").text
        if "Products are loading" in body_text:
            raise AssertionError("Home page still shows the loading placeholder for featured products.")
        if "Live product collection from Odoo" not in body_text:
            raise AssertionError("Home page does not show the Odoo catalog section.")
        print("[OK] Home shows live Odoo product cards.")

        print("--- Verifying shop catalog ---")
        driver.get(f"{BASE_URL}/shop")
        wait_for_product_cards(driver, wait, min_cards=3)
        shop_text = driver.find_element(By.TAG_NAME, "body").text
        if "Products are loading" in shop_text:
            raise AssertionError("Shop page still shows the loading placeholder.")
        if "Featured Jewelry" not in shop_text and "Shop Jewelry" not in shop_text:
            print("[WARNING] Shop heading changed; continuing because product cards are visible.")
        print("[OK] Shop shows live Odoo product cards.")

        print("PASS: Production product catalog verified.")
    finally:
        time.sleep(2)
        driver.quit()


if __name__ == "__main__":
    main()
