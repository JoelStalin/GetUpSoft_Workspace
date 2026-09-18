import json
import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

BASE = "https://chefalitas.com.do"
LOGIN = "selenium.pos@test.local"
PASSWORD = "Selenium#2026!"
POS_URL = f"{BASE}/pos/ui?config_id=2"
OUT_DIR = "tmp"
os.makedirs(OUT_DIR, exist_ok=True)

state = {
    "steps": [],
    "errors": [],
    "console": [],
}


def snap(driver, name):
    path = os.path.join(OUT_DIR, name)
    driver.save_screenshot(path)
    return path


def log_step(name, ok=True, detail=None):
    row = {"step": name, "ok": ok}
    if detail:
        row["detail"] = detail
    state["steps"].append(row)
    print("STEP", json.dumps(row, ensure_ascii=False))


def visible(driver, by, value):
    elems = driver.find_elements(by, value)
    for e in elems:
        try:
            if e.is_displayed() and e.is_enabled():
                return e
        except Exception:
            pass
    return elems[0] if elems else None


def click_any(driver, wait, selectors, label):
    last = None
    for kind, value in selectors:
        try:
            if kind == "css":
                elem = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, value)))
            else:
                elem = wait.until(EC.element_to_be_clickable((By.XPATH, value)))
            driver.execute_script("arguments[0].click();", elem)
            log_step(f"click_{label}", True, value)
            return elem
        except Exception as e:
            last = str(e)
    log_step(f"click_{label}", False, last)
    return None

opts = Options()
opts.add_argument("--headless=new")
opts.add_argument("--window-size=1700,1100")
opts.set_capability("goog:loggingPrefs", {"browser": "ALL"})


driver = webdriver.Edge(options=opts)
wait = WebDriverWait(driver, 30)

try:
    # 1) Login
    driver.get(f"{BASE}/web/login?redirect=/web")
    wait.until(EC.presence_of_element_located((By.NAME, "login")))
    snap(driver, "selenium_pos_step_01_login_page.png")

    login_el = visible(driver, By.NAME, "login")
    pass_el = visible(driver, By.NAME, "password")
    if not login_el or not pass_el:
        raise RuntimeError("No se encontraron campos de login visibles")
    driver.execute_script("arguments[0].value = '';", login_el)
    driver.execute_script("arguments[0].value = '';", pass_el)
    login_el.send_keys(LOGIN)
    pass_el.send_keys(PASSWORD)

    submit = visible(driver, By.CSS_SELECTOR, "button[type='submit']")
    if not submit:
        raise RuntimeError("No se encontró botón submit")
    driver.execute_script("arguments[0].click();", submit)
    time.sleep(3)
    snap(driver, "selenium_pos_step_02_after_login.png")
    log_step("login_submitted", True, driver.current_url)

    # 2) Open POS directly
    driver.get(POS_URL)
    time.sleep(6)
    snap(driver, "selenium_pos_step_03_pos_open.png")
    log_step("open_pos", True, driver.current_url)

    # 3) If floor screen exists, pick a table
    table_clicked = False
    for sel in [
        ("css", ".floor-map .table"),
        ("css", ".table"),
        ("xpath", "//div[contains(@class,'table') and not(contains(@class,'header'))][1]"),
    ]:
        kind, val = sel
        try:
            elem = visible(driver, By.CSS_SELECTOR, val) if kind == "css" else visible(driver, By.XPATH, val)
            if elem:
                driver.execute_script("arguments[0].click();", elem)
                table_clicked = True
                log_step("select_table", True, val)
                time.sleep(2)
                break
        except Exception:
            pass
    if not table_clicked:
        log_step("select_table", False, "no table element found (maybe direct product screen)")
    snap(driver, "selenium_pos_step_04_after_table.png")

    # 4) Add product
    product = click_any(driver, wait, [
        ("css", ".products-widget .product"),
        ("css", ".product"),
        ("xpath", "//article[contains(@class,'product')][1]"),
        ("xpath", "//*[contains(@class,'product-name')][1]"),
    ], "add_product")
    time.sleep(2)
    snap(driver, "selenium_pos_step_05_after_product.png")

    # 5) Go to payment
    pay = click_any(driver, wait, [
        ("css", ".pay-order-button"),
        ("css", ".button.pay"),
        ("xpath", "//button[contains(.,'Pago') or contains(.,'Pay') or contains(.,'Pagar')]"),
    ], "go_payment")
    time.sleep(2)
    snap(driver, "selenium_pos_step_06_payment_screen.png")

    # 6) Select payment method (if needed)
    pm = click_any(driver, wait, [
        ("css", ".paymentmethods .paymentmethod"),
        ("css", ".paymentmethod"),
        ("xpath", "//*[contains(@class,'paymentmethod')][1]"),
    ], "select_payment_method")
    time.sleep(1)

    # 7) Validate payment
    validate = click_any(driver, wait, [
        ("css", ".payment-controls .button.next"),
        ("css", ".button.next"),
        ("xpath", "//button[contains(.,'Validar') or contains(.,'Validate') or contains(.,'Confirm')]"),
    ], "validate_payment")
    time.sleep(5)
    snap(driver, "selenium_pos_step_07_after_validate.png")

    # 8) Trigger print if print button exists
    printed = click_any(driver, wait, [
        ("css", ".button.print"),
        ("xpath", "//button[contains(.,'Imprimir') or contains(.,'Print')]"),
    ], "print_receipt")
    time.sleep(4)
    snap(driver, "selenium_pos_step_08_after_print.png")

    # 9) Collect console logs
    raw_logs = driver.get_log("browser")
    for row in raw_logs:
        msg = row.get("message", "")
        if any(k in msg.lower() for k in ["error", "hw_proxy", "printing", "legacy", "failed", "trace"]):
            state["console"].append({
                "level": row.get("level"),
                "message": msg,
            })

    # 10) Quick page checks
    page = driver.page_source.lower()
    for marker in ["printing failed", "local agent", "hw proxy", "blocked", "failed to fetch"]:
        if marker in page:
            state["errors"].append(f"page_contains:{marker}")

except Exception as e:
    state["errors"].append(f"exception:{type(e).__name__}:{e}")
    snap(driver, "selenium_pos_step_error.png")
finally:
    # Save final report
    report_path = os.path.join(OUT_DIR, "selenium_pos_report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)
    print("REPORT", report_path)
    print("FINAL_URL", driver.current_url)
    print("ERRORS", json.dumps(state["errors"], ensure_ascii=False))
    print("CONSOLE_MATCHES", len(state["console"]))
    driver.quit()
