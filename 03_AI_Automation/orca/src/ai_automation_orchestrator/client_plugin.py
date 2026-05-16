from __future__ import annotations

from io import BytesIO
from zipfile import ZIP_DEFLATED, ZipFile


PLUGIN_HTML_TEMPLATE = """<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Orca Clap Launcher</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #080b10;
      --panel: #111822;
      --text: #f2f6fb;
      --muted: #9aa9ba;
      --accent: #2dd4bf;
      --border: #263241;
      --danger: #fb7185;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: radial-gradient(circle at top, #172033, var(--bg) 55%);
      color: var(--text);
      font-family: Inter, Segoe UI, Arial, sans-serif;
      padding: 24px;
    }
    main {
      width: min(720px, 100%);
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 28px;
      box-shadow: 0 24px 70px rgba(0, 0, 0, .35);
    }
    h1 { margin: 0 0 8px; font-size: 30px; letter-spacing: 0; }
    p { margin: 0 0 18px; color: var(--muted); line-height: 1.5; }
    button {
      appearance: none;
      border: 0;
      border-radius: 8px;
      padding: 12px 16px;
      background: var(--accent);
      color: #022c22;
      font-weight: 700;
      cursor: pointer;
    }
    button.secondary {
      background: transparent;
      color: var(--text);
      border: 1px solid var(--border);
    }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; margin: 18px 0; }
    .meter {
      height: 16px;
      border-radius: 999px;
      background: #060a0f;
      border: 1px solid var(--border);
      overflow: hidden;
      margin-top: 20px;
    }
    .bar {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, var(--accent), #fde047);
      transition: width 70ms linear;
    }
    .status {
      margin-top: 14px;
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--muted);
      min-height: 45px;
    }
    .error { color: var(--danger); }
    code { color: var(--accent); }
  </style>
</head>
<body>
  <main>
    <h1>Orca Clap Launcher</h1>
    <p>Este plugin escucha el microfono local. Cuando detecta un aplauso fuerte, abre Orca en el navegador.</p>
    <p>Destino: <code id="target"></code></p>
    <div class="actions">
      <button id="start">Activar escucha</button>
      <button class="secondary" id="open">Abrir Orca ahora</button>
    </div>
    <div class="meter"><div class="bar" id="bar"></div></div>
    <div class="status" id="status">Inactivo.</div>
  </main>
  <script>
    const ORCA_URL = "__ORCA_URL__";
    const OPEN_COOLDOWN_MS = 2500;
    const CLAP_THRESHOLD = 0.32;
    const MIN_SPIKE_DELTA = 0.18;

    let audioContext = null;
    let analyser = null;
    let data = null;
    let previousLevel = 0;
    let lastOpenAt = 0;
    let listening = false;

    const statusEl = document.getElementById("status");
    const barEl = document.getElementById("bar");
    document.getElementById("target").textContent = ORCA_URL;

    function setStatus(message, isError = false) {
      statusEl.textContent = message;
      statusEl.className = isError ? "status error" : "status";
    }

    function openOrca() {
      window.open(ORCA_URL, "_blank", "noopener,noreferrer");
    }

    function audioLevel() {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (const value of data) {
        const centered = (value - 128) / 128;
        sum += centered * centered;
      }
      return Math.sqrt(sum / data.length);
    }

    function tick() {
      if (!listening) return;
      const level = audioLevel();
      const spike = level - previousLevel;
      previousLevel = previousLevel * 0.65 + level * 0.35;
      barEl.style.width = `${Math.min(100, Math.round(level * 220))}%`;

      const now = Date.now();
      if (level >= CLAP_THRESHOLD && spike >= MIN_SPIKE_DELTA && now - lastOpenAt > OPEN_COOLDOWN_MS) {
        lastOpenAt = now;
        setStatus("Aplauso detectado. Abriendo Orca...");
        openOrca();
      }

      requestAnimationFrame(tick);
    }

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
        });
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        data = new Uint8Array(analyser.fftSize);
        audioContext.createMediaStreamSource(stream).connect(analyser);
        listening = true;
        setStatus("Escuchando. Da un aplauso fuerte cerca del microfono.");
        tick();
      } catch (error) {
        setStatus(`No se pudo activar el microfono: ${error.message}`, true);
      }
    }

    document.getElementById("start").addEventListener("click", start);
    document.getElementById("open").addEventListener("click", openOrca);
  </script>
</body>
</html>
"""


README_TEMPLATE = """# Orca Clap Launcher

Este paquete abre Orca cuando el cliente da un aplauso frente al microfono.

## Uso

1. Descomprime el ZIP.
2. Abre `orca-clap-launcher.html` en Chrome o Edge.
3. Haz clic en `Activar escucha`.
4. Acepta el permiso del microfono.
5. Da un aplauso fuerte; se abrira Orca.

URL configurada:

```text
__ORCA_URL__
```

Si el navegador bloquea el microfono al abrir el archivo local, sirve esta carpeta con un servidor local y abre `http://localhost`.
"""


def build_clap_plugin_zip(orca_url: str) -> bytes:
    html = PLUGIN_HTML_TEMPLATE.replace("__ORCA_URL__", orca_url)
    readme = README_TEMPLATE.replace("__ORCA_URL__", orca_url)

    archive = BytesIO()
    with ZipFile(archive, "w", ZIP_DEFLATED) as zip_file:
        zip_file.writestr("orca-clap-launcher.html", html)
        zip_file.writestr("README.md", readme)
    return archive.getvalue()
