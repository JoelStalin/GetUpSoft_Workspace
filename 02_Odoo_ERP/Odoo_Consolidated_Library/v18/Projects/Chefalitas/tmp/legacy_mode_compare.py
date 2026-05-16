# -*- coding: utf-8 -*-
import base64
import glob
import json
import os
import re
import threading
import time
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

try:
    from PIL import Image
except Exception:
    Image = None

BASE = "https://chefalitas.com.do"
AUTH = {
    "jsonrpc": "2.0",
    "method": "call",
    "params": {"db": "chefalitas", "login": "administracion@chefalitas.com.do", "password": "chefalitas1234"},
    "id": 1,
}
URLS = [
    ("nodebug", BASE + "/pos/web?config_id=1"),
    ("debug", BASE + "/pos/web?config_id=1&debug=assets"),
]
OUT = "tmp"
JOBS = os.path.join(OUT, "print_jobs")
os.makedirs(JOBS, exist_ok=True)

receiver_events = []


def now_tag():
    return datetime.now().strftime("%Y%m%d_%H%M%S_%f")


def strip_data_url(value):
    if not isinstance(value, str):
        return ""
    m = re.match(r"^data:[^;]+;base64,(.*)$", value, flags=re.I | re.S)
    return m.group(1) if m else value


def save_pdf(data_b64):
    raw = base64.b64decode(strip_data_url(data_b64), validate=False)
    path = os.path.join(JOBS, f"job_{now_tag()}.pdf")
    with open(path, "wb") as f:
        f.write(raw)
    return path


def save_image_or_pdf(data_b64):
    raw = base64.b64decode(strip_data_url(data_b64), validate=False)
    png_path = os.path.join(JOBS, f"job_{now_tag()}.png")
    with open(png_path, "wb") as f:
        f.write(raw)
    out = {"image": png_path}
    if Image:
        try:
            img = Image.open(png_path).convert("RGB")
            pdf_path = png_path[:-4] + ".pdf"
            img.save(pdf_path, "PDF", resolution=203)
            out["pdf"] = pdf_path
        except Exception as e:
            out["pdf_error"] = str(e)
    return out


class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Private-Network", "true")

    def _json(self, code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self._cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            return self._json(200, {"status": "ok"})
        if self.path == "/printers":
            return self._json(200, {"printers": ["PDF"]})
        return self._json(404, {"error": "not found"})

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length else b""
        try:
            data = json.loads(raw.decode("utf-8") or "{}")
        except Exception:
            return self._json(400, {"error": "invalid json"})

        event = {"path": self.path, "ts": now_tag()}
        receiver_events.append(event)

        if self.path == "/print":
            ptype = str(data.get("type") or "").lower()
            payload = data.get("data")
            if not payload:
                return self._json(400, {"error": "data required"})
            saved = save_pdf(payload) if ptype == "pdf" else save_image_or_pdf(payload)
            event["saved"] = saved
            return self._json(200, {"ok": True, "saved": saved, "type": ptype or "image"})

        if self.path == "/hw_proxy/default_printer_action":
            body = data.get("data", data)
            action = body.get("action")
            if action == "cashbox":
                event["action"] = "cashbox"
                return self._json(200, {"result": True})
            if action == "print_receipt":
                payload = body.get("receipt")
                if payload:
                    saved = save_image_or_pdf(payload)
                    event["saved"] = saved
                    return self._json(200, {"result": True, "saved": saved})
            return self._json(400, {"error": "unsupported action", "action": action})

        return self._json(404, {"error": "not found"})


def first_visible(elements):
    for e in elements:
        try:
            if e.is_displayed() and e.is_enabled():
                return e
        except Exception:
            pass
    return elements[0] if elements else None


def click_one(driver, wait, choices, name, result):
    last = None
    for mode, selector in choices:
        try:
            if mode == "css":
                elem = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
            else:
                elem = wait.until(EC.element_to_be_clickable((By.XPATH, selector)))
            driver.execute_script("arguments[0].click();", elem)
            result["steps"].append({"name": name, "ok": True, "selector": selector})
            return True
        except Exception as e:
            last = str(e)
    result["steps"].append({"name": name, "ok": False, "error": last})
    return False


def run_mode(tag, url, session_id):
    result = {"mode": tag, "url": url, "steps": [], "errors": [], "console": [], "final_url": None}
    before_count = len(glob.glob(os.path.join(JOBS, "job_*")))

    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--window-size=1700,1100")
    opts.set_capability("goog:loggingPrefs", {"browser": "ALL"})

    driver = webdriver.Edge(options=opts)
    wait = WebDriverWait(driver, 25)

    try:
        driver.get(BASE)
        driver.add_cookie({"name": "session_id", "value": session_id, "path": "/"})
        driver.get(url)
        time.sleep(8)

        driver.save_screenshot(os.path.join(OUT, f"legacy_{tag}_01_loaded.png"))
        result["final_url"] = driver.current_url

        if "web/login" in driver.current_url:
            result["errors"].append("redirected_to_login")
            return result

        click_one(driver, wait, [
            ("css", ".floor-map .table"),
            ("css", ".table"),
            ("xpath", "(//*[contains(@class,'table')])[1]"),
        ], "select_table", result)
        time.sleep(2)
        driver.save_screenshot(os.path.join(OUT, f"legacy_{tag}_02_table.png"))

        click_one(driver, wait, [
            ("css", ".products-widget .product"),
            ("css", ".product"),
            ("xpath", "(//*[contains(@class,'product')])[1]"),
        ], "add_product", result)
        time.sleep(2)
        driver.save_screenshot(os.path.join(OUT, f"legacy_{tag}_03_product.png"))

        click_one(driver, wait, [
            ("css", ".pay-order-button"),
            ("css", ".button.pay"),
            ("xpath", "//button[contains(.,'Pago') or contains(.,'Pagar') or contains(.,'Pay')]"),
        ], "go_payment", result)
        time.sleep(2)
        driver.save_screenshot(os.path.join(OUT, f"legacy_{tag}_04_payment.png"))

        click_one(driver, wait, [
            ("css", ".paymentmethods .paymentmethod"),
            ("css", ".paymentmethod"),
            ("xpath", "(//*[contains(@class,'paymentmethod')])[1]"),
        ], "select_payment_method", result)
        time.sleep(1)

        click_one(driver, wait, [
            ("css", ".payment-controls .button.next"),
            ("css", ".button.next"),
            ("xpath", "//button[contains(.,'Validar') or contains(.,'Validate') or contains(.,'Confirm')]"),
        ], "validate_payment", result)
        time.sleep(6)
        driver.save_screenshot(os.path.join(OUT, f"legacy_{tag}_05_validated.png"))

        click_one(driver, wait, [
            ("css", ".button.print"),
            ("xpath", "//button[contains(.,'Imprimir') or contains(.,'Print')]"),
        ], "click_print", result)
        time.sleep(5)
        driver.save_screenshot(os.path.join(OUT, f"legacy_{tag}_06_after_print.png"))

        html = driver.page_source.lower()
        for marker in ["printing failed", "failed to fetch", "blocked", "local agent", "proxy"]:
            if marker in html:
                result["errors"].append(f"page_contains:{marker}")

        for l in driver.get_log("browser"):
            msg = l.get("message", "")
            if l.get("level") == "SEVERE" or any(k in msg.lower() for k in ["pos_printing_suite", "print", "proxy", "fetch", "error"]):
                result["console"].append({"level": l.get("level"), "message": msg})

    except Exception as e:
        result["errors"].append(f"exception:{type(e).__name__}:{e}")
        driver.save_screenshot(os.path.join(OUT, f"legacy_{tag}_error.png"))
    finally:
        result["final_url"] = driver.current_url
        after_count = len(glob.glob(os.path.join(JOBS, "job_*")))
        result["jobs_before"] = before_count
        result["jobs_after"] = after_count
        result["jobs_delta"] = after_count - before_count
        driver.quit()

    return result


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 9060), Handler)
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()

    try:
        s = requests.Session()
        auth = s.post(BASE + "/web/session/authenticate", json=AUTH, timeout=20)
        auth.raise_for_status()
        data = auth.json()
        if not data.get("result", {}).get("uid"):
            raise RuntimeError("authentication_failed")
        sid = s.cookies.get("session_id")
        if not sid:
            raise RuntimeError("session_cookie_missing")

        all_results = []
        for tag, url in URLS:
            all_results.append(run_mode(tag, url, sid))

        report = {
            "results": all_results,
            "receiver_events_count": len(receiver_events),
            "receiver_events": receiver_events[-30:],
        }
        print(json.dumps(report, ensure_ascii=False, indent=2))
        with open(os.path.join(OUT, "legacy_mode_compare_report.json"), "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
    finally:
        server.shutdown()
        server.server_close()
