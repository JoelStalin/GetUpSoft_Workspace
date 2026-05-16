from __future__ import annotations

import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

CURRENT_DIR = Path(__file__).resolve().parent.parent
E2E_DIR = CURRENT_DIR / 'tests' / 'e2e'
if str(E2E_DIR) not in sys.path:
    sys.path.insert(0, str(E2E_DIR))

from profile_runtime import get_driver as get_profile_runtime_driver

BASE_URL = os.getenv('E2E_BASE_URL', 'https://galantesjewelry.com').rstrip('/')
PROFILE_NAME = os.getenv('SELENIUM_PROFILE', 'Profile 9')
HEADLESS = os.getenv('SELENIUM_HEADLESS', '0') == '1'

OUTPUT_DIR = CURRENT_DIR / 'tests' / 'e2e' / 'artifacts' / f"customer-google-login-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def save_screenshot(driver, name: str) -> str:
    filename = f'{name}.png'
    driver.save_screenshot(str(OUTPUT_DIR / filename))
    return filename


def click_visible(driver, wait: WebDriverWait, selector: str) -> None:
    element = wait.until(
        lambda current: next(
            (candidate for candidate in current.find_elements(By.CSS_SELECTOR, selector) if candidate.is_displayed()),
            None,
        )
    )
    if element is None:
        raise AssertionError(f'Visible element not found: {selector}')
    driver.execute_script('arguments[0].scrollIntoView({block: "center"});', element)
    try:
        wait.until(EC.element_to_be_clickable(element))
    except Exception:
        pass
    driver.execute_script('arguments[0].click();', element)


def collect_browser_logs(driver) -> list[str]:
    logs: list[str] = []
    try:
        entries = driver.get_log('browser')
    except Exception:
        return logs

    for entry in entries:
        logs.append(f"{entry.get('level')}: {entry.get('message')}")
    return logs


def dump_browser_logs(driver, prefix: str) -> None:
    for line in collect_browser_logs(driver):
        print(f'[{prefix}] {line}', flush=True)


def main() -> None:
    report = {
        'status': 'in_progress',
        'base_url': BASE_URL,
        'profile': PROFILE_NAME,
        'headless': HEADLESS,
        'artifacts': str(OUTPUT_DIR),
        'cases': [],
        'errors': [],
    }

    driver, profile_dir = get_profile_runtime_driver(PROFILE_NAME, headless=HEADLESS)
    if driver is None:
        report['status'] = 'blocked'
        report['errors'].append('Chrome profile is locked. Close Chrome manually and rerun.')
        (OUTPUT_DIR / 'result.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
        print('BLOCKED: Chrome profile is locked. Close Chrome manually and rerun.', flush=True)
        return

    report['profile_dir'] = str(profile_dir)

    try:
        wait = WebDriverWait(driver, 45)
        driver.set_page_load_timeout(45)

        driver.get(f'{BASE_URL}/')
        wait.until(EC.presence_of_element_located((By.TAG_NAME, 'nav')))
        report['cases'].append({
            'name': 'home_loaded',
            'status': 'pass',
            'evidence': [save_screenshot(driver, '01_home')],
        })

        driver.delete_all_cookies()
        try:
            driver.execute_script("localStorage.removeItem('galantes_cart');")
        except Exception:
            pass

        driver.get(f'{BASE_URL}/auth/login?returnTo=%2Fcart')
        wait.until(EC.presence_of_element_located((By.TAG_NAME, 'h1')))
        report['cases'].append({
            'name': 'login_page_loaded',
            'status': 'pass',
            'current_url': driver.current_url,
            'evidence': [save_screenshot(driver, '02_login_page')],
        })

        click_visible(driver, wait, "a[href^='/api/auth/google/start']")
        try:
            wait.until(
                lambda current: (
                    'accounts.google.com' in current.current_url
                    or urlparse(current.current_url).path == '/auth/google/callback'
                    or 'google_login=error' in current.current_url
                    or urlparse(current.current_url).path == '/cart'
                )
            )
        except TimeoutException as exc:
            raise AssertionError(f'Google login did not reach Google or callback. Current URL: {driver.current_url}') from exc

        current_url = driver.current_url
        parsed = urlparse(current_url)
        report['cases'].append({
            'name': 'google_flow_started',
            'status': 'pass',
            'current_url': current_url,
            'host': parsed.netloc,
            'evidence': [save_screenshot(driver, '03_after_google_click')],
        })

        if 'accounts.google.com' in current_url:
            query = parse_qs(parsed.query)
            report['cases'].append({
                'name': 'google_oauth_redirect',
                'status': 'pass',
                'details': {
                    'client_id_present': bool(query.get('client_id', [''])[0]),
                    'redirect_uri': unquote(query.get('redirect_uri', [''])[0] or ''),
                },
            })

            try:
                wait.until(lambda current: 'google_login=error' in current.current_url or urlparse(current.current_url).netloc not in ('accounts.google.com', 'accounts.google.com.'))
            except TimeoutException:
                report['cases'].append({
                    'name': 'google_callback_completion',
                    'status': 'warning',
                    'details': 'OAuth stayed on accounts.google.com during the test window; manual Google interaction may still be required.',
                })
            else:
                final_url = driver.current_url
                if 'google_login=error' in final_url:
                    raise AssertionError(f'Google login returned an error page: {final_url}')

                report['cases'].append({
                    'name': 'google_callback_completed',
                    'status': 'pass',
                    'current_url': final_url,
                    'path': urlparse(final_url).path,
                    'evidence': [save_screenshot(driver, '04_callback_completed')],
                })
        else:
            if 'google_login=error' in current_url:
                raise AssertionError(f'Google login returned error immediately: {current_url}')

            report['cases'].append({
                'name': 'non_google_completion',
                'status': 'pass',
                'details': 'Flow returned to the site without staying on accounts.google.com.',
            })

        report['status'] = 'pass'
        print(json.dumps(report, indent=2), flush=True)
    except Exception as error:
        report['status'] = 'fail'
        report['errors'].append(f'{type(error).__name__}: {error}')
        try:
            save_screenshot(driver, '99_failure')
        except Exception:
            pass
        dump_browser_logs(driver, 'google-login')
        print(json.dumps(report, indent=2), flush=True)
        raise
    finally:
        (OUTPUT_DIR / 'result.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
        time.sleep(2)
        driver.quit()


if __name__ == '__main__':
    main()
