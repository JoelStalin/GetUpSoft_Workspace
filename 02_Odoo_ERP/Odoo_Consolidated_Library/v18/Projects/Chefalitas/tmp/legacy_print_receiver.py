# -*- coding: utf-8 -*-
import base64
import json
import os
import re
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

try:
    from PIL import Image
except Exception:
    Image = None

HOST = "127.0.0.1"
PORT = 9060
OUT_DIR = os.path.join("tmp", "print_jobs")
os.makedirs(OUT_DIR, exist_ok=True)


def now_tag():
    return datetime.now().strftime("%Y%m%d_%H%M%S_%f")


def strip_data_url(value):
    if not isinstance(value, str):
        return ""
    m = re.match(r"^data:[^;]+;base64,(.*)$", value, flags=re.I | re.S)
    return m.group(1) if m else value


def save_pdf(data_b64):
    raw = base64.b64decode(strip_data_url(data_b64), validate=False)
    path = os.path.join(OUT_DIR, f"job_{now_tag()}.pdf")
    with open(path, "wb") as f:
        f.write(raw)
    return path


def save_image_or_pdf(data_b64):
    raw = base64.b64decode(strip_data_url(data_b64), validate=False)
    png_path = os.path.join(OUT_DIR, f"job_{now_tag()}.png")
    with open(png_path, "wb") as f:
        f.write(raw)
    if Image:
        try:
            img = Image.open(png_path).convert("RGB")
            pdf_path = png_path[:-4] + ".pdf"
            img.save(pdf_path, "PDF", resolution=203)
            return {"image": png_path, "pdf": pdf_path}
        except Exception as e:
            return {"image": png_path, "pdf_error": str(e)}
    return {"image": png_path}


class Handler(BaseHTTPRequestHandler):
    server_version = "PosLegacyReceiver/1.0"

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
        return self._json(404, {"error": "not found", "path": self.path})

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length else b""
        try:
            data = json.loads(raw.decode("utf-8") or "{}")
        except Exception:
            return self._json(400, {"error": "invalid json"})

        # Local Agent endpoint
        if self.path == "/print":
            ptype = str(data.get("type") or "").lower()
            payload = data.get("data")
            if not payload:
                return self._json(400, {"error": "data required"})
            if ptype == "pdf":
                saved = save_pdf(payload)
            else:
                saved = save_image_or_pdf(payload)
            return self._json(200, {"ok": True, "type": ptype or "image", "saved": saved})

        # Legacy HW Proxy compatible endpoint
        if self.path == "/hw_proxy/default_printer_action":
            action = data.get("action") or data.get("data", {}).get("action")
            payload = data.get("receipt") or data.get("data", {}).get("receipt")
            if action == "cashbox":
                return self._json(200, {"result": True, "action": "cashbox"})
            if action == "print_receipt" and payload:
                saved = save_image_or_pdf(payload)
                return self._json(200, {"result": True, "action": action, "saved": saved})
            return self._json(400, {"error": "unsupported action", "action": action})

        return self._json(404, {"error": "not found", "path": self.path})


if __name__ == "__main__":
    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Receiver listening on http://{HOST}:{PORT}")
    httpd.serve_forever()
