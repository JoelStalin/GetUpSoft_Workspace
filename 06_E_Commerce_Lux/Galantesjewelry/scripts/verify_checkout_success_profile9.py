from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

from selenium.common.exceptions import StaleElementReferenceException, TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.select import Select
from selenium.webdriver.support.ui import WebDriverWait

CURRENT_DIR = Path(__file__).resolve().parent.parent
E2E_DIR = CURRENT_DIR / 'tests' / 'e2e'
if str(E2E_DIR) not in sys.path:
    sys.path.insert(0, str(E2E_DIR))

from profile_runtime import get_driver as get_profile_runtime_driver

BASE_URL = os.getenv('E2E_BASE_URL', 'https://galantesjewelry.com').rstrip('/')
ODOO_API_BASE_URL = os.getenv('ODOO_API_BASE_URL', 'https://odoo.galantesjewelry.com').rstrip('/')
PROFILE_NAME = os.getenv('SELENIUM_PROFILE', 'Profile 9')
HEADLESS = os.getenv('SELENIUM_HEADLESS', '0') == '1'
FALLBACK_PRODUCT = {
    'id': '24',
    'product_id': '24',
    'slug': 'classic-pearl-stud-earrings',
    'name': 'Classic Pearl Stud Earrings',
    'price': 395.0,
    'quantity': 1,
    'image_url': '',
    'availability': 'out_of_stock',
}
CHECKOUT_PRODUCT_SKU = os.getenv('CHECKOUT_PRODUCT_SKU', 'GJ-TEST-001')
CHECKOUT_PRODUCT_ID = int(os.getenv('CHECKOUT_PRODUCT_ID', '28'))

OUTPUT_DIR = CURRENT_DIR / 'tests' / 'e2e' / 'artifacts' / f"checkout-success-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def save_screenshot(driver, name: str) -> str:
    filename = f'{name}.png'
    driver.save_screenshot(str(OUTPUT_DIR / filename))
    return filename


def visible(driver, by: By, value: str):
    candidates = driver.find_elements(by, value)
    return next((element for element in candidates if element.is_displayed()), None)


def visible_button_by_text(driver, text: str):
    xpath = f"//button[normalize-space()='{text}']"
    return visible(driver, By.XPATH, xpath)


def clear_cart_storage(driver) -> None:
    safe_get(driver, f'{BASE_URL}/')
    driver.execute_script("window.localStorage.removeItem('galantes_cart');")
    driver.execute_script("window.sessionStorage.removeItem('galantes_cart');")


def safe_get(driver, url: str) -> None:
    try:
        driver.get(url)
    except TimeoutException:
        # Production pages can keep loading non-critical assets after the DOM is usable.
        pass


def fetch_checkout_product() -> dict[str, object]:
    url = f'{ODOO_API_BASE_URL}/api/products?pageSize=50'
    try:
        with urllib.request.urlopen(url, timeout=30) as response:
            payload = json.loads(response.read().decode('utf-8'))
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError):
        return dict(FALLBACK_PRODUCT)

    products = payload.get('data') or []
    for product in products:
        if int(product.get('id') or 0) != CHECKOUT_PRODUCT_ID:
            continue
        price = float(product.get('price') or 0)
        product_id = int(product.get('id') or 0)
        if product_id > 1 and price > 0:
            return {
                'id': str(product_id),
                'product_id': str(product_id),
                'slug': str(product.get('slug') or f'product-{product_id}'),
                'name': str(product.get('name') or f'Product {product_id}'),
                'price': price,
                'quantity': 1,
                'image_url': product.get('imageUrl') or '',
                'availability': product.get('availability'),
            }

    for product in products:
        if str(product.get('sku') or product.get('default_code') or '') != CHECKOUT_PRODUCT_SKU:
            continue
        price = float(product.get('price') or 0)
        product_id = int(product.get('id') or 0)
        if product_id > 1 and price > 0:
            return {
                'id': str(product_id),
                'product_id': str(product_id),
                'slug': str(product.get('slug') or f'product-{product_id}'),
                'name': str(product.get('name') or f'Product {product_id}'),
                'price': price,
                'quantity': 1,
                'image_url': product.get('imageUrl') or '',
                'availability': product.get('availability'),
            }

    for product in products:
        price = float(product.get('price') or 0)
        product_id = int(product.get('id') or 0)
        if product_id > 1 and price > 0:
            return {
                'id': str(product_id),
                'product_id': str(product_id),
                'slug': str(product.get('slug') or f'product-{product_id}'),
                'name': str(product.get('name') or f'Product {product_id}'),
                'price': price,
                'quantity': 1,
                'image_url': product.get('imageUrl') or '',
                'availability': product.get('availability'),
            }

    return dict(FALLBACK_PRODUCT)


def inject_product_into_cart(driver, product: dict[str, object]) -> None:
    safe_get(driver, f'{BASE_URL}/cart')
    driver.execute_script(
        """
        const item = arguments[0];
        window.localStorage.setItem('galantes_cart', JSON.stringify([item]));
        """,
        product,
    )
    driver.refresh()


def ensure_cart_has_items(driver, wait: WebDriverWait, product: dict[str, object]) -> None:
    safe_get(driver, f'{BASE_URL}/cart')
    wait.until(EC.presence_of_element_located((By.TAG_NAME, 'body')))
    if 'Your Cart is Empty' in driver.find_element(By.TAG_NAME, 'body').text:
        driver.execute_script(
            """
            const item = arguments[0];
            window.localStorage.setItem('galantes_cart', JSON.stringify([item]));
            """,
            product,
        )
        driver.refresh()
        wait.until(EC.presence_of_element_located((By.TAG_NAME, 'body')))
    if 'Your Cart is Empty' in driver.find_element(By.TAG_NAME, 'body').text:
        raise AssertionError('Cart is still empty after adding a product.')


def fill_checkout_form(driver, wait: WebDriverWait, stamp: str) -> dict[str, str]:
    safe_get(driver, f'{BASE_URL}/checkout')
    wait.until(EC.presence_of_element_located((By.TAG_NAME, 'body')))

    customer = {
        'name': f'QA Checkout {stamp}',
        'email': f'qa.checkout.{stamp}@example.com',
        'phone': '3055552026',
        'street': '82681 Overseas Highway',
        'street2': 'Suite QA',
        'zip': '33036',
        'city': '',
    }

    def set_field(selector: str, value: str) -> None:
        element = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, selector)))
        driver.execute_script('arguments[0].scrollIntoView({block: "center"});', element)
        element.clear()
        element.send_keys(value)

    set_field("input[placeholder='Full Name']", customer['name'])
    set_field("input[placeholder='Email Address']", customer['email'])
    set_field("input[placeholder='Phone Number']", customer['phone'])
    set_field("[data-testid='checkout-street']", customer['street'])
    set_field("[data-testid='checkout-street2']", customer['street2'])
    set_field("[data-testid='checkout-zip']", customer['zip'])

    input_city = visible(driver, By.CSS_SELECTOR, "[data-testid='checkout-city']")
    if input_city is not None:
        customer['city'] = 'Islamorada'
        input_city.clear()
        input_city.send_keys(customer['city'])
    else:
        raise AssertionError('Shipping city input was not found.')

    return customer


def create_checkout_payment(driver, product: dict[str, object], customer: dict[str, str]) -> dict[str, object]:
    payload = {
        'items': [
            {
                'id': product['id'],
                'slug': product['slug'],
                'name': product['name'],
                'product_id': product['product_id'],
                'price': product['price'],
                'quantity': product['quantity'],
            },
        ],
        'customerData': customer,
    }
    result = driver.execute_async_script(
        """
        const payload = arguments[0];
        const done = arguments[arguments.length - 1];
        fetch('/api/checkout/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload),
        })
          .then(async (response) => {
            const text = await response.text();
            let body = {};
            try { body = JSON.parse(text); } catch (error) { body = { raw: text }; }
            done({ status: response.status, body });
          })
          .catch((error) => done({ status: 0, body: { error: String(error) } }));
        """,
        payload,
    )
    status = int(result.get('status') or 0)
    body = result.get('body') or {}

    if status != 200 or not body.get('clientSecret'):
        raise AssertionError(f'Checkout API did not return a client secret: {body}')

    client_secret = str(body['clientSecret'])
    payment_intent = client_secret.split('_secret_', 1)[0]
    if not payment_intent.startswith('pi_'):
        raise AssertionError(f'Unexpected Stripe client secret format: {client_secret}')

    return {
        'client_secret': client_secret,
        'payment_intent': payment_intent,
        'order_id': body.get('orderId'),
    }


def fill_stripe_payment_element(driver, wait: WebDriverWait) -> None:
    wait.until(EC.presence_of_element_located((By.ID, 'payment-form')))
    wait.until(EC.presence_of_all_elements_located((By.TAG_NAME, 'iframe')))

    frame_inputs = {
        'card number': '4242424242424242',
        'cardnumber': '4242424242424242',
        'number': '4242424242424242',
        'expiry': '12/34',
        'expiration': '12/34',
        'exp': '12/34',
        'cvc': '123',
        'security code': '123',
        'postal': '33036',
        'zip': '33036',
    }

    matched_fields = 0
    deadline = time.time() + 60
    while matched_fields == 0 and time.time() < deadline:
        iframe_count = len(driver.find_elements(By.TAG_NAME, 'iframe'))
        for index in range(iframe_count):
            try:
                iframe = driver.find_elements(By.TAG_NAME, 'iframe')[index]
                driver.switch_to.frame(iframe)
                inputs = driver.find_elements(By.CSS_SELECTOR, 'input')
                for input_element in inputs:
                    label = ' '.join(filter(None, [
                        input_element.get_attribute('name'),
                        input_element.get_attribute('placeholder'),
                        input_element.get_attribute('aria-label'),
                        input_element.get_attribute('autocomplete'),
                        input_element.get_attribute('id'),
                    ])).strip().lower()
                    for needle, value in frame_inputs.items():
                        if needle in label:
                            input_element.click()
                            input_element.clear()
                            input_element.send_keys(value)
                            matched_fields += 1
                            break
            except StaleElementReferenceException:
                time.sleep(1)
                continue
            finally:
                driver.switch_to.default_content()

        if matched_fields == 0:
            time.sleep(2)

    if matched_fields == 0:
        iframe_debug = []
        for iframe in driver.find_elements(By.TAG_NAME, 'iframe'):
            iframe_debug.append({
                'title': iframe.get_attribute('title'),
                'name': iframe.get_attribute('name'),
                'src': iframe.get_attribute('src'),
                'aria_label': iframe.get_attribute('aria-label'),
            })
        print(f'No Stripe inputs found. iframe_debug={json.dumps(iframe_debug, indent=2)}', flush=True)
        for iframe in driver.find_elements(By.TAG_NAME, 'iframe'):
            title = iframe.get_attribute('title') or ''
            if 'Secure payment input frame' in title:
                driver.switch_to.frame(iframe)
                try:
                    body_text = driver.find_element(By.TAG_NAME, 'body').text
                    print(f'Stripe frame body text: {body_text}', flush=True)
                    print(f'Stripe frame source: {driver.page_source[:4000]}', flush=True)
                finally:
                    driver.switch_to.default_content()
        raise AssertionError('Could not locate any Stripe PaymentElement inputs to fill.')

    # Some Stripe frames lazily mount after first focus; give the UI a moment to settle.
    time.sleep(2)


def select_shipping_rate_in_browser(driver, wait: WebDriverWait) -> str:
    wait.until(lambda current: len(current.find_elements(By.CSS_SELECTOR, "[data-testid^='shipping-rate-']")) > 0)
    rate_cards = driver.find_elements(By.CSS_SELECTOR, "[data-testid^='shipping-rate-']")
    visible_cards = [card for card in rate_cards if card.is_displayed()]
    if not visible_cards:
        raise AssertionError('No visible shipping rates were rendered in the checkout UI.')

    chosen = visible_cards[0]
    rate_label = chosen.get_attribute('data-testid') or 'shipping-rate'
    driver.execute_script('arguments[0].scrollIntoView({block: "center"});', chosen)
    driver.execute_script('arguments[0].click();', chosen)
    time.sleep(1)
    return rate_label


def open_success_page(driver, payment_intent: str, client_secret: str) -> None:
    safe_get(
        driver,
        f"{BASE_URL}/checkout/success?payment_intent={payment_intent}&payment_intent_client_secret={client_secret}",
    )


def wait_for_success(driver, wait: WebDriverWait) -> dict[str, str]:
    end = time.time() + 120
    last_url = ''
    while time.time() < end:
        current_url = driver.current_url
        last_url = current_url
        if urlparse(current_url).path == '/checkout/success':
            body = driver.find_element(By.TAG_NAME, 'body').text
            if 'Checkout confirmation error' in body:
                raise AssertionError(body)

            loading = visible(driver, By.CSS_SELECTOR, "[data-testid='checkout-success-loading']")
            if loading is not None:
                time.sleep(2)
                continue

            heading = visible(driver, By.CSS_SELECTOR, "[data-testid='checkout-success-heading']")
            state = visible(driver, By.CSS_SELECTOR, "[data-testid='checkout-success-state']")
            order_card = visible(driver, By.CSS_SELECTOR, "[data-testid='checkout-success-order']")
            invoice_card = visible(driver, By.CSS_SELECTOR, "[data-testid='checkout-success-invoice']")
            if heading is None and order_card is None and invoice_card is None:
                time.sleep(2)
                continue
            return {
                'url': current_url,
                'heading': heading.text.strip() if heading else '',
                'state': state.text.strip() if state else '',
                'order_text': order_card.text.strip() if order_card else '',
                'invoice_text': invoice_card.text.strip() if invoice_card else '',
            }
        time.sleep(2)

    raise AssertionError(f'Checkout did not redirect to /checkout/success. Last URL: {last_url}')


def verify_cart_is_empty(driver, wait: WebDriverWait) -> None:
    safe_get(driver, f'{BASE_URL}/cart')
    wait.until(EC.presence_of_element_located((By.TAG_NAME, 'body')))
    wait.until(lambda current: 'Your Cart is Empty' in current.find_element(By.TAG_NAME, 'body').text)


def main() -> None:
    stamp = datetime.now().strftime('%Y%m%d%H%M%S')
    report: dict[str, object] = {
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
        print('BLOCKED: Chrome esta abierto con Profile 9. Cierra Chrome manualmente y vuelve a ejecutar.', flush=True)
        return

    report['profile_dir'] = str(profile_dir)

    try:
        wait = WebDriverWait(driver, 45)
        driver.set_page_load_timeout(45)

        clear_cart_storage(driver)
        report['cases'].append({
            'name': 'clear_cart_storage',
            'status': 'pass',
            'details': 'Cleared client-side cart storage before the checkout test.',
        })

        product = fetch_checkout_product()
        inject_product_into_cart(driver, product)
        report['cases'].append({
            'name': 'seed_cart_with_paid_product',
            'status': 'pass',
            'details': f"Injected a paid Odoo product into the frontend cart: {product['name']}",
            'product': product,
        })

        ensure_cart_has_items(driver, wait, product)
        report['cases'].append({
            'name': 'cart_contains_item',
            'status': 'pass',
            'details': 'Cart page reflects the newly added item.',
            'evidence': [save_screenshot(driver, '01_cart_before_checkout')],
        })

        customer = fill_checkout_form(driver, wait, stamp)
        report['cases'].append({
            'name': 'checkout_contact_and_shipping',
            'status': 'pass',
            'details': 'Checkout contact and shipping fields are visible and accept the expected customer data.',
            'customer': customer,
            'evidence': [save_screenshot(driver, '02_checkout_payment_ready')],
        })

        rate_label = select_shipping_rate_in_browser(driver, wait)
        report['cases'].append({
            'name': 'shipping_rate_selected',
            'status': 'pass',
            'details': f'The browser checkout selected a visible shipping rate: {rate_label}.',
            'evidence': [save_screenshot(driver, '02b_shipping_rate_selected')],
        })

        continue_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='checkout-continue']")))
        driver.execute_script('arguments[0].click();', continue_button)
        report['cases'].append({
            'name': 'checkout_continue_clicked',
            'status': 'pass',
            'details': 'The browser checkout flow progressed from shipping selection to the payment form.',
        })

        fill_stripe_payment_element(driver, wait)
        report['cases'].append({
            'name': 'stripe_payment_element_filled',
            'status': 'pass',
            'details': 'The browser payment element accepted test card details in production.',
            'evidence': [save_screenshot(driver, '03_payment_element_filled')],
        })

        submit_button = wait.until(EC.element_to_be_clickable((By.ID, 'submit')))
        driver.execute_script('arguments[0].click();', submit_button)
        report['cases'].append({
            'name': 'stripe_payment_submitted',
            'status': 'pass',
            'details': 'The checkout form submitted the browser payment in production.',
        })

        success = wait_for_success(driver, wait)
        report['cases'].append({
            'name': 'checkout_success_screen',
            'status': 'pass',
            'details': 'The checkout success page shows the order or invoice after the payment succeeded.',
            'success': success,
            'evidence': [save_screenshot(driver, '03_checkout_success')],
        })

        verify_cart_is_empty(driver, wait)
        report['cases'].append({
            'name': 'cart_cleared_after_payment',
            'status': 'pass',
            'details': 'Cart is empty after the successful payment redirect.',
            'evidence': [save_screenshot(driver, '04_cart_empty_after_success')],
        })

        report['status'] = 'pass'
        print('PASS: Checkout success flow verified in production.', flush=True)
    except Exception as error:
        report['status'] = 'fail'
        report['errors'].append(f'{type(error).__name__}: {error}')
        try:
          report['failure_screenshot'] = save_screenshot(driver, '99_failure')
        except Exception:
          pass
        raise
    finally:
        (OUTPUT_DIR / 'result.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
        time.sleep(2)
        driver.quit()


if __name__ == '__main__':
    main()
