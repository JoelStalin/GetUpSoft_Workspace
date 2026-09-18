# -*- coding: utf-8 -*-
import json
import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

URL = "https://chefalitas.com.do/pos/web?config_id=1&from_backend=True&debug=assets"
LOGIN = "administracion@chefalitas.com.do"
PASSWORD = "chefalitas1234"
OUT_DIR = "tmp"
os.makedirs(OUT_DIR, exist_ok=True)

report = {
    "url": URL,
    "steps": [],
    "errors": [],
    "console": [],
    "final_url": None,
}


def step(name, ok=True, detail=None):
    row = {"name": name, "ok": ok}
    if detail:
        row["detail"] = str(detail)
    report["steps"].append(row)
    print("STEP", json.dumps(row, ensure_ascii=False))


def snap(driver, name):
    path = os.path.join(OUT_DIR, name)
    driver.save_screenshot(path)
    print("SHOT", path)


def first_visible(driver, by, selector):
    for e in driver.find_elements(by, selector):
        try:
            if e.is_displayed() and e.is_enabled():
                return e
        except Exception:
            pass
    return None


def click_first(driver, wait, options, label):
    last_err = None
    for mode, sel in options:
        try:
            if mode == "css":
                elem = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, sel)))
            else:
                elem = wait.until(EC.element_to_be_clickable((By.XPATH, sel)))
            driver.execute_script("arguments[0].click();", elem)
            step(label, True, sel)
            return True
        except Exception as e:
            last_err = e
    step(label, False, last_err)
    return False

opts = Options()
opts.add_argument("--headless=new")
opts.add_argument("--window-size=1700,1100")
opts.set_capability("goog:loggingPrefs", {"browser": "ALL"})


driver = webdriver.Edge(options=opts)
wait = WebDriverWait(driver, 30)

try:
    driver.get(URL)
    time.sleep(3)
    snap(driver, "selenium_user_step_01_initial.png")

    # login if needed
    login_input = first_visible(driver, By.NAME, "login")
    pass_input = first_visible(driver, By.NAME, "password")
    if login_input and pass_input:
        driver.execute_script("arguments[0].value = '';", login_input)
        driver.execute_script("arguments[0].value = '';", pass_input)
        login_input.send_keys(LOGIN)
        pass_input.send_keys(PASSWORD)
        btn = first_visible(driver, By.CSS_SELECTOR, "button[type='submit']")
        if not btn:
            raise RuntimeError("Login button not found")
        driver.execute_script("arguments[0].click();", btn)
        step("login_submit", True, driver.current_url)
        time.sleep(5)
        snap(driver, "selenium_user_step_02_after_login.png")

    # force target url again after login
    driver.get(URL)
    time.sleep(8)
    snap(driver, "selenium_user_step_03_pos_loaded.png")
    step("open_pos_url", True, driver.current_url)

    # maybe floor/table screen
    click_first(driver, wait, [
        ("css", ".floor-map .table"),
        ("css", ".table"),
        ("xpath", "(//*[contains(@class,'table') and not(contains(@class,'header'))])[1]"),
    ], "select_table")
    time.sleep(2)
    snap(driver, "selenium_user_step_04_after_table.png")

    # add one product
    click_first(driver, wait, [
        ("css", ".products-widget .product"),
        ("css", ".product"),
        ("xpath", "(//*[contains(@class,'product')])[1]"),
    ], "add_product")
    time.sleep(2)
    snap(driver, "selenium_user_step_05_after_product.png")

    # payment
    click_first(driver, wait, [
        ("css", ".pay-order-button"),
        ("css", ".button.pay"),
        ("xpath", "//button[contains(.,'Pago') or contains(.,'Pagar') or contains(.,'Pay')]"),
    ], "go_payment")
    time.sleep(2)
    snap(driver, "selenium_user_step_06_payment.png")

    # choose payment method
    click_first(driver, wait, [
        ("css", ".paymentmethods .paymentmethod"),
        ("css", ".paymentmethod"),
        ("xpath", "(//*[contains(@class,'paymentmethod')])[1]"),
    ], "select_payment_method")
    time.sleep(1)

    # validate
    click_first(driver, wait, [
        ("css", ".payment-controls .button.next"),
        ("css", ".button.next"),
        ("xpath", "//button[contains(.,'Validar') or contains(.,'Validate') or contains(.,'Confirm')]"),
    ], "validate_payment")
    time.sleep(6)
    snap(driver, "selenium_user_step_07_after_validate.png")

    # print action if available
    click_first(driver, wait, [
        ("css", ".button.print"),
        ("xpath", "//button[contains(.,'Imprimir') or contains(.,'Print')]"),
    ], "print_receipt_button")
    time.sleep(5)
    snap(driver, "selenium_user_step_08_after_print_click.png")

except Exception as e:
    report["errors"].append(f"{type(e).__name__}: {e}")
    snap(driver, "selenium_user_step_error.png")
finally:
    report["final_url"] = driver.current_url
    page = driver.page_source.lower()
    for marker in ["printing failed", "local agent", "hw proxy", "failed to fetch", "blocked access"]:
        if marker in page:
            report["errors"].append(f"page_contains:{marker}")

    try:
        logs = driver.get_log("browser")
    except Exception:
        logs = []
    for l in logs:
        msg = l.get("message", "")
        if any(k in msg.lower() for k in ["error", "print", "legacy", "proxy", "fetch", "pos_printing_suite"]):
            report["console"].append({"level": l.get("level"), "message": msg})

    with open(os.path.join(OUT_DIR, "selenium_user_report.json"), "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print("FINAL_URL", report["final_url"])
    print("ERROR_COUNT", len(report["errors"]))
    print("CONSOLE_COUNT", len(report["console"]))
    driver.quit()
