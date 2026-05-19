#!/usr/bin/env python3
import html
import json
import os
import subprocess
import time
import base64
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

BASE = Path(os.environ.get("GETUPSOFT_CLI_HOME", "/home/ubuntu/.workspace-cli/flai-getupsoft"))
AUTH_USER = os.environ.get("CLI_DASHBOARD_USER", "ceo@getupsoft.com")
AUTH_PASSWORD = os.environ.get("CLI_DASHBOARD_PASSWORD", "")
WORKSPACES = {
    "getupsoft_workspace": Path("/home/ubuntu/workspaces/GetUpSoft_Workspace"),
    "flai_workspace": Path("/home/ubuntu/workspaces/flai_Workspace"),
}
LOG_DIR = BASE / "login-runs"
BIN_DIR = BASE / "bin"

CLI_COMMANDS = {
    "gcloud": ["gcloud", "auth", "login", "--no-launch-browser"],
    "gh": ["gh", "auth", "login", "--web", "--hostname", "github.com"],
    "codex": ["codex", "login"],
    "gemini": ["gemini", "auth", "login"],
    "claude": ["claude", "login"],
}


def run(cmd, cwd):
    env = os.environ.copy()
    env.update(
        {
            "GETUPSOFT_CLI_HOME": str(BASE),
            "PATH": f"{BIN_DIR}:{BASE}/tools/ripgrep:{BASE}/tools/node/bin:{BASE}/npm-global/bin:"
            + env.get("PATH", ""),
            "GH_CONFIG_DIR": str(BASE / "profiles/gh"),
            "CLOUDSDK_CONFIG": str(BASE / "profiles/gcloud"),
            "CODEX_HOME": str(BASE / "profiles/codex"),
            "NPM_CONFIG_PREFIX": str(BASE / "npm-global"),
        }
    )
    try:
        p = subprocess.run(cmd, cwd=cwd, env=env, text=True, capture_output=True, timeout=18)
        return p.returncode, (p.stdout + p.stderr).strip()
    except subprocess.TimeoutExpired:
        return 124, "timeout"
    except Exception as exc:
        return 1, str(exc)


def status_for(workspace_key):
    cwd = WORKSPACES[workspace_key]
    checks = {}
    code, out = run(["gcloud", "auth", "list", "--format=value(account,status)"], cwd)
    checks["gcloud"] = {
        "connected": bool(out.strip()),
        "detail": "\n".join(line for line in out.splitlines() if line.strip()) or "not logged in",
    }
    code, out = run(["gh", "auth", "status"], cwd)
    checks["gh"] = {"connected": code == 0 and "Logged in" in out, "detail": out or "not logged in"}
    code, out = run(["codex", "login", "status"], cwd)
    checks["codex"] = {"connected": code == 0 and "Logged in" in out, "detail": out or "not logged in"}
    checks["claude"] = {
        "connected": (BASE / "profiles/claude/.credentials.json").exists(),
        "detail": "credentials present" if (BASE / "profiles/claude/.credentials.json").exists() else "missing",
    }
    checks["gemini"] = {
        "connected": (BASE / "profiles/gemini/oauth_creds.json").exists(),
        "detail": "oauth credentials present" if (BASE / "profiles/gemini/oauth_creds.json").exists() else "missing",
    }
    return checks


def start_login(workspace_key, cli):
    if workspace_key not in WORKSPACES:
        raise ValueError("unknown workspace")
    if cli not in CLI_COMMANDS:
        raise ValueError("unknown cli")
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    stamp = time.strftime("%Y%m%d-%H%M%S")
    log = LOG_DIR / f"{workspace_key}-{cli}-{stamp}.log"
    cmd = CLI_COMMANDS[cli]
    wrapped = (
        "set -e; "
        f"cd {sh_quote(str(WORKSPACES[workspace_key]))}; "
        f"export GETUPSOFT_CLI_HOME={sh_quote(str(BASE))}; "
        f"export PATH={sh_quote(str(BIN_DIR))}:$GETUPSOFT_CLI_HOME/tools/ripgrep:$GETUPSOFT_CLI_HOME/tools/node/bin:$GETUPSOFT_CLI_HOME/npm-global/bin:$PATH; "
        f"export GH_CONFIG_DIR=$GETUPSOFT_CLI_HOME/profiles/gh CLOUDSDK_CONFIG=$GETUPSOFT_CLI_HOME/profiles/gcloud CODEX_HOME=$GETUPSOFT_CLI_HOME/profiles/codex; "
        + " ".join(sh_quote(x) for x in cmd)
    )
    subprocess.Popen(["bash", "-lc", f"{wrapped} > {sh_quote(str(log))} 2>&1"], start_new_session=True)
    return log.name


def sh_quote(value):
    return "'" + value.replace("'", "'\"'\"'") + "'"


class Handler(BaseHTTPRequestHandler):
    def _authorized(self):
        if not AUTH_PASSWORD:
            return True
        value = self.headers.get("Authorization", "")
        if not value.startswith("Basic "):
            return False
        try:
            decoded = base64.b64decode(value.split(" ", 1)[1]).decode()
        except Exception:
            return False
        return decoded == f"{AUTH_USER}:{AUTH_PASSWORD}"

    def _require_auth(self):
        self.send_response(401)
        self.send_header("WWW-Authenticate", 'Basic realm="GetUpSoft CLI Dashboard"')
        self.send_header("Cache-Control", "no-store")
        self.end_headers()

    def _send(self, code, body, content_type="text/html; charset=utf-8"):
        data = body.encode()
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if not self._authorized():
            self._require_auth()
            return
        parsed = urlparse(self.path)
        qs = parse_qs(parsed.query)
        workspace = qs.get("workspace", ["getupsoft_workspace"])[0]
        if parsed.path == "/healthz":
            self._send(200, "ok\n", "text/plain")
            return
        if parsed.path == "/api/status":
            self._send(200, json.dumps(status_for(workspace), indent=2), "application/json")
            return
        if parsed.path.startswith("/api/log/"):
            name = Path(parsed.path.split("/")[-1]).name
            log = LOG_DIR / name
            self._send(200, log.read_text(errors="replace")[-12000:] if log.exists() else "log not found", "text/plain")
            return
        self._send(200, render_page(workspace))

    def do_HEAD(self):
        if not self._authorized():
            self._require_auth()
            return
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()

    def do_POST(self):
        if not self._authorized():
            self._require_auth()
            return
        parsed = urlparse(self.path)
        parts = parsed.path.strip("/").split("/")
        if len(parts) == 3 and parts[:2] == ["api", "login"]:
            length = int(self.headers.get("Content-Length", "0") or "0")
            body = parse_qs(self.rfile.read(length).decode())
            workspace = body.get("workspace", ["getupsoft_workspace"])[0]
            try:
                log = start_login(workspace, parts[2])
                self._send(200, json.dumps({"ok": True, "log": log}), "application/json")
            except Exception as exc:
                self._send(400, json.dumps({"ok": False, "error": str(exc)}), "application/json")
            return
        self._send(404, "not found", "text/plain")


def render_page(workspace):
    if workspace not in WORKSPACES:
        workspace = "getupsoft_workspace"
    statuses = status_for(workspace)
    rows = []
    for name, item in statuses.items():
        state = "connected" if item["connected"] else "missing"
        rows.append(
            f"<tr><td>{html.escape(name)}</td><td><span class='{state}'>{state}</span></td>"
            f"<td><pre>{html.escape(item['detail'])}</pre></td>"
            f"<td><button onclick=\"loginCli('{html.escape(name)}')\">Login / reconnect</button></td></tr>"
        )
    options = "".join(
        f"<option value='{html.escape(k)}' {'selected' if k == workspace else ''}>{html.escape(k)}</option>"
        for k in WORKSPACES
    )
    return f"""<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>GetUpSoft CLI Dashboard</title>
  <style>
    :root {{ color-scheme: dark; --bg:#08110f; --card:#101d19; --line:#29443b; --ok:#42d392; --bad:#ff7369; --fg:#e9fff8; --muted:#9fc2b7; }}
    body {{ margin:0; font-family: ui-sans-serif, system-ui, sans-serif; background: radial-gradient(circle at top left,#183d34,var(--bg) 42%); color:var(--fg); }}
    main {{ max-width:1180px; margin:0 auto; padding:38px 22px; }}
    h1 {{ margin:0 0 8px; font-size:34px; }}
    .muted {{ color:var(--muted); }}
    .toolbar, table, .logbox {{ background:rgba(16,29,25,.88); border:1px solid var(--line); border-radius:18px; box-shadow:0 24px 70px rgba(0,0,0,.25); }}
    .toolbar {{ padding:16px; margin:24px 0; display:flex; gap:12px; align-items:center; flex-wrap:wrap; }}
    select, button {{ background:#d6fff0; color:#06231a; border:0; border-radius:12px; padding:10px 14px; font-weight:700; }}
    button {{ cursor:pointer; }}
    table {{ width:100%; border-collapse:collapse; overflow:hidden; }}
    th, td {{ border-bottom:1px solid var(--line); padding:14px; vertical-align:top; text-align:left; }}
    th {{ color:#bce7db; }}
    pre {{ margin:0; white-space:pre-wrap; max-height:145px; overflow:auto; color:#d9fff3; }}
    .connected {{ color:var(--ok); font-weight:800; }}
    .missing {{ color:var(--bad); font-weight:800; }}
    .logbox {{ margin-top:20px; padding:16px; }}
    #log {{ min-height:120px; white-space:pre-wrap; color:#d8f7ee; }}
  </style>
</head>
<body>
<main>
  <h1>GetUpSoft CLI Dashboard</h1>
  <div class="muted">Estado de sesiones CLI por workspace. Los tokens no se muestran.</div>
  <div class="toolbar">
    <label>Proyecto/workspace</label>
    <select id="workspace" onchange="location='/?workspace='+this.value">{options}</select>
    <button onclick="location.reload()">Revisar estado</button>
  </div>
  <table>
    <thead><tr><th>CLI</th><th>Estado</th><th>Detalle</th><th>Acción</th></tr></thead>
    <tbody>{''.join(rows)}</tbody>
  </table>
  <div class="logbox">
    <strong>Login output</strong>
    <div class="muted">Después de iniciar login, aquí aparecerá la URL/código de autorización cuando el CLI lo genere.</div>
    <pre id="log">Sin proceso activo.</pre>
  </div>
</main>
<script>
let currentLog = null;
async function loginCli(cli) {{
  const workspace = document.getElementById('workspace').value;
  const res = await fetch('/api/login/' + cli, {{
    method:'POST',
    headers:{{'Content-Type':'application/x-www-form-urlencoded'}},
    body:new URLSearchParams({{workspace}})
  }});
  const data = await res.json();
  if (!data.ok) {{ document.getElementById('log').textContent = data.error; return; }}
  currentLog = data.log;
  document.getElementById('log').textContent = 'Proceso iniciado: ' + currentLog + '\\nEsperando output...';
  pollLog();
}}
async function pollLog() {{
  if (!currentLog) return;
  const text = await fetch('/api/log/' + currentLog).then(r => r.text());
  document.getElementById('log').textContent = text || 'Esperando output...';
  setTimeout(pollLog, 2500);
}}
</script>
</body>
</html>"""


if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", int(os.environ.get("PORT", "3022"))), Handler).serve_forever()
