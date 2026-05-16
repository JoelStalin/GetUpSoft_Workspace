from __future__ import annotations

import os
import sys
from pathlib import Path

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from profile_runtime import get_driver

BASE_URL = os.getenv('ODOO_PUBLIC_URL', 'https://odoo.galantesjewelry.com').rstrip('/')
PROFILE_NAME = os.getenv('SELENIUM_PROFILE', 'Profile 9')
HEADLESS = os.getenv('SELENIUM_HEADLESS', '0') == '1'


def main() -> None:
    driver, profile_dir = get_driver(PROFILE_NAME, headless=HEADLESS)
    if driver is None:
        return

    print(f'Profile path: {profile_dir}')
    try:
        wait = WebDriverWait(driver, 30)
        driver.get(f'{BASE_URL}/web/login')
        wait.until(lambda current: '/web/login' in current.current_url)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "form[action*='/web/login']")))
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='login']")))
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='password']")))
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='csrf_token']")))
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "button[type='submit'], input[type='submit']")))

        print(f'Odoo public login is reachable: {driver.current_url}')
    finally:
        driver.quit()


if __name__ == '__main__':
    main()
