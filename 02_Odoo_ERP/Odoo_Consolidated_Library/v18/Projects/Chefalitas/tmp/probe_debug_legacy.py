# -*- coding: utf-8 -*-
import base64
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
MODES = [
    ("nodebug", BASE + "/pos/web?config_id=1"),
    ("debug", BASE + "/pos/web?config_id=1&debug=assets"),
]
OUT = "tmp"
JOBS = os.path.join(OUT, "print_jobs")
os.makedirs(JOBS, exist_ok=True)

for f in os.listdir(JOBS):
    try:
        os.remove(os.path.join(JOBS, f))
    except Exception:
        pass

receiver_events = []


def tag():
    return datetime.now().strftime("%Y%m%d_%H%M%S_%f")


def strip_data_url(v):
    if not isinstance(v, str):
        return ""
    m = re.match(r"^data:[^;]+;base64,(.*)$", v, flags=re.I | re.S)
    return m.group(1) if m else v


def save_image_to_pdf(data_b64):
    raw = base64.b64decode(strip_data_url(data_b64), validate=False)
    png = os.path.join(JOBS, f"job_{tag()}.png")
    with open(png, "wb") as f:
        f.write(raw)
    out = {"png": png}
    if Image:
        try:
            img = Image.open(png).convert("RGB")
            pdf = png[:-4] + ".pdf"
            img.save(pdf, "PDF", resolution=203)
            out["pdf"] = pdf
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
        b = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self._cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

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
        n = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(n) if n else b""
        try:
            data = json.loads(raw.decode("utf-8") or "{}")
        except Exception:
            return self._json(400, {"error": "invalid json"})

        event = {"path": self.path, "at": tag()}
        receiver_events.append(event)

        if self.path == "/print":
            payload = data.get("data")
            if not payload:
                return self._json(400, {"error": "missing data"})
            saved = save_image_to_pdf(payload)
            event["saved"] = saved
            return self._json(200, {"ok": True, "saved": saved})

        return self._json(404, {"error": "not found"})


def click(driver, wait, selectors):
    last = None
    for mode, sel in selectors:
        try:
            loc = (By.CSS_SELECTOR, sel) if mode == "css" else (By.XPATH, sel)
            el = wait.until(EC.element_to_be_clickable(loc))
            driver.execute_script("arguments[0].click();", el)
            return {"ok": True, "selector": sel}
        except Exception as e:
            last = str(e)
    return {"ok": False, "error": last}


def handle_table_popup(driver):
    # popup "Selector de mesa"
    if "selector de mesa" not in driver.page_source.lower():
        return False
    try:
        btn1 = driver.find_element(By.XPATH, "//button[normalize-space()='1']")
        driver.execute_script("arguments[0].click();", btn1)
        time.sleep(0.5)
    except Exception:
        pass
    try:
        go = driver.find_element(By.XPATH, "//button[normalize-space()='Ir' or normalize-space()='Go']")
        driver.execute_script("arguments[0].click();", go)
        time.sleep(1.5)
        return True
    except Exception:
        return False


def run_mode(tag_name, url, sid):
    result = {"mode": tag_name, "url": url, "steps": [], "errors": [], "console": [], "jobs_before": len(os.listdir(JOBS))}

    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--window-size=1700,1100")
    opts.set_capability("goog:loggingPrefs", {"browser": "ALL"})
    d = webdriver.Edge(options=opts)
    wait = WebDriverWait(d, 12)

    try:
        d.get(BASE)
        d.add_cookie({"name": "session_id", "value": sid, "path": "/"})
        d.get(url)
        time.sleep(6)
        d.save_screenshot(os.path.join(OUT, f"probe_{tag_name}_01_loaded.png"))

        if "web/login" in d.current_url:
            result["errors"].append("redirect_login")
            return result

        # floor table click
        r = click(d, wait, [
            ("css", ".floor-map .table"),
            ("css", ".table"),
            ("xpath", "(//*[contains(@class,'table')])[1]"),
        ])
        result["steps"].append({"step": "table_click", **r})
        time.sleep(1)
        popup_done = handle_table_popup(d)
        result["steps"].append({"step": "table_popup", "ok": popup_done})
        d.save_screenshot(os.path.join(OUT, f"probe_{tag_name}_02_table.png"))

        # product
        r = click(d, wait, [
            ("css", ".products-widget .product"),
            ("css", ".product"),
            ("xpath", "(//*[contains(@class,'product')])[1]"),
        ])
        result["steps"].append({"step": "add_product", **r})
        time.sleep(1)
        d.save_screenshot(os.path.join(OUT, f"probe_{tag_name}_03_product.png"))

        # pay
        r = click(d, wait, [
            ("css", ".pay-order-button"),
            ("css", ".button.pay"),
            ("xpath", "//button[contains(.,'Pago') or contains(.,'Pagar') or contains(.,'Pay')]"),
        ])
        result["steps"].append({"step": "go_payment", **r})
        time.sleep(1)
        d.save_screenshot(os.path.join(OUT, f"probe_{tag_name}_04_payment.png"))

        # payment method
        r = click(d, wait, [
            ("css", ".paymentmethods .paymentmethod"),
            ("css", ".paymentmethod"),
            ("xpath", "(//*[contains(@class,'paymentmethod')])[1]"),
        ])
        result["steps"].append({"step": "payment_method", **r})

        # validate
        r = click(d, wait, [
            ("css", ".payment-controls .button.next"),
            ("css", ".button.next"),
            ("xpath", "//button[contains(.,'Validar') or contains(.,'Validate') or contains(.,'Confirm')]"),
        ])
        result["steps"].append({"step": "validate", **r})
        time.sleep(4)
        d.save_screenshot(os.path.join(OUT, f"probe_{tag_name}_05_validated.png"))

        # print button if exists
        r = click(d, wait, [
            ("css", ".button.print"),
            ("xpath", "//button[contains(.,'Imprimir') or contains(.,'Print')]"),
        ])
        result["steps"].append({"step": "print_click", **r})
        time.sleep(4)
        d.save_screenshot(os.path.join(OUT, f"probe_{tag_name}_06_after_print.png"))

        page = d.page_source.lower()
        for m in ["printing failed", "failed to fetch", "blocked", "local agent", "traceback"]:
            if m in page:
                result["errors"].append(f"page:{m}")

        for l in d.get_log("browser"):
            msg = l.get("message", "")
            if l.get("level") == "SEVERE" or any(k in msg.lower() for k in ["print", "pos_printing_suite", "proxy", "error", "fetch"]):
                result["console"].append({"level": l.get("level"), "message": msg})

    except Exception as e:
        result["errors"].append(f"exception:{type(e).__name__}:{e}")
        d.save_screenshot(os.path.join(OUT, f"probe_{tag_name}_error.png"))
    finally:
        result["final_url"] = d.current_url
        result["jobs_after"] = len(os.listdir(JOBS))
        result["jobs_delta"] = result["jobs_after"] - result["jobs_before"]
        d.quit()

    return result


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 9060), Handler)
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()

    summary = {}
    try:
        s = requests.Session()
        ra = s.post(BASE + "/web/session/authenticate", json=AUTH, timeout=20)
        ra.raise_for_status()
        sid = s.cookies.get("session_id")
        if not sid:
            raise RuntimeError("no_session_cookie")

        results = []
        for mode in MODES:
            results.append(run_mode(mode[0], mode[1], sid))

        summary = {
            "results": results,
            "receiver_events_count": len(receiver_events),
            "receiver_events": receiver_events,
            "jobs_files": sorted(os.listdir(JOBS)),
        }
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        with open(os.path.join(OUT, "probe_debug_legacy_summary.json"), "w", encoding="utf-8") as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)
    finally:
        server.shutdown()
        server.server_close()
