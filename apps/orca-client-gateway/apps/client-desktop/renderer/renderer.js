const ui = {
  baseUrlInput: document.getElementById("baseUrlInput"),
  pairingCodeInput: document.getElementById("pairingCodeInput"),
  deviceNameInput: document.getElementById("deviceNameInput"),
  connectBtn: document.getElementById("connectBtn"),
  resumeBtn: document.getElementById("resumeBtn"),
  disconnectBtn: document.getElementById("disconnectBtn"),
  openApiBtn: document.getElementById("openApiBtn"),
  activationMessage: document.getElementById("activationMessage"),
  stateValue: document.getElementById("stateValue"),
  tenantValue: document.getElementById("tenantValue"),
  deviceValue: document.getElementById("deviceValue"),
  heartbeatValue: document.getElementById("heartbeatValue"),
  pollValue: document.getElementById("pollValue"),
  logView: document.getElementById("logView")
};

let agent = {
  baseUrl: "",
  tenantId: "",
  deviceId: "",
  connected: false,
  heartbeatTimer: null,
  pollTimer: null
};

const DEFAULT_BASE_URL = "https://ethernet-deck-frog-holds.trycloudflare.com";
const FALLBACK_BASE_URL = "https://ethernet-deck-frog-holds.trycloudflare.com";

function normalizeErrorMessage(error) {
  const msg = error?.message || String(error);
  if (msg.startsWith("Missing fields:")) {
    return `Faltan campos: ${msg.replace("Missing fields:", "").trim()}.`;
  }
  if (msg.includes("Base URL and pairing code are required")) {
    return "Debes completar Base URL y Pairing Code.";
  }
  if (msg.includes("fetch failed")) return "No se pudo conectar al servidor (network/tunnel).";
  if (msg.includes("HTTP 400") && msg.toLowerCase().includes("pairing")) return "Pairing code invalido o expirado.";
  if (msg.includes("HTTP 401")) return "No autorizado. Verifica credenciales o estado del dispositivo.";
  if (msg.includes("HTTP 404")) return "Ruta no encontrada en el servidor. Verifica version/API base URL.";
  if (msg.includes("HTTP 429")) return "Demasiados intentos. Espera unos segundos e intenta de nuevo.";
  return msg;
}

function log(message, data) {
  const line = `[${new Date().toISOString()}] ${message}${data ? ` ${JSON.stringify(data)}` : ""}`;
  ui.logView.textContent = `${line}\n${ui.logView.textContent}`.slice(0, 8000);
}

function setStatus(text) {
  ui.stateValue.textContent = text;
  if (text === "Revoked") {
    ui.stateValue.classList.add("revoked");
    ui.activationMessage.classList.add("revoked");
  } else {
    ui.stateValue.classList.remove("revoked");
    ui.activationMessage.classList.remove("revoked");
  }
}

function safeJson(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function normalizePairingCode(value) {
  return (value || "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, "")
    .toUpperCase()
    .trim();
}

async function api(path, method = "GET", body) {
  const res = await fetch(`${agent.baseUrl}${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let parsed = text;
  try {
    parsed = JSON.parse(text);
  } catch {
    // keep text
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${safeJson(parsed)}`);
  return parsed;
}

async function precheckBaseUrl(baseUrl) {
  const doCheck = async (url) => {
    agent.baseUrl = url;
    const out = await api("/api/v1/health");
    if (!out || (typeof out === "string" && !out.trim())) {
      throw new Error("Health endpoint returned empty payload.");
    }
    return out;
  };

  try {
    return { baseUrl, health: await doCheck(baseUrl), usedFallback: false };
  } catch (e) {
    if (baseUrl.includes("ssh.getupsoft.com.do")) {
      const health = await doCheck(FALLBACK_BASE_URL);
      return { baseUrl: FALLBACK_BASE_URL, health, usedFallback: true };
    }
    throw e;
  }
}

async function heartbeat() {
  if (!agent.connected || !agent.deviceId) return;
  const payload = {
    status: "connected",
    agentVersion: "0.1.0",
    runtimeVersion: "0.1.0",
    tunnelStatus: "connected",
    lastError: null,
    localTime: new Date().toISOString()
  };
  const out = await api(`/api/v1/agent/devices/${agent.deviceId}/heartbeat`, "POST", payload);
  ui.heartbeatValue.textContent = out.lastSeenAt || new Date().toISOString();
}

async function pollCommands() {
  if (!agent.connected || !agent.deviceId) return;
  const out = await api(`/api/v1/agent/devices/${agent.deviceId}/commands/poll`);
  ui.pollValue.textContent = new Date().toISOString();
  const commands = out.commands || [];
  if (!commands.length) return;
  for (const cmd of commands) {
    log("command-received", { id: cmd.id, type: cmd.type });
    await api(`/api/v1/agent/devices/${agent.deviceId}/commands/${cmd.id}/result`, "POST", {
      status: "succeeded",
      startedAt: new Date().toISOString(),
      finishedAt: new Date(Date.now() + 500).toISOString(),
      exitCode: 0,
      safeLogs: "Executed by desktop MVP agent",
      artifacts: []
    });
    log("command-result-sent", { id: cmd.id });
  }
}

function stopLoops() {
  if (agent.heartbeatTimer) clearInterval(agent.heartbeatTimer);
  if (agent.pollTimer) clearInterval(agent.pollTimer);
  agent.heartbeatTimer = null;
  agent.pollTimer = null;
}

async function startConnectedLoops() {
  await heartbeat();
  await pollCommands();
  stopLoops();
  agent.heartbeatTimer = setInterval(() => heartbeat().catch((e) => log("heartbeat-error", { error: e.message })), 15000);
  agent.pollTimer = setInterval(() => pollCommands().catch((e) => log("poll-error", { error: e.message })), 8000);
}

async function tryResumeSession(st) {
  const enrollment = st?.enrollment || {};
  const baseUrl = (enrollment.baseUrl || "").trim().replace(/\/$/, "");
  const deviceId = (enrollment.deviceId || "").trim();
  const tenantId = (enrollment.tenantId || "").trim();
  if (!baseUrl || !deviceId) return false;

  try {
    agent.baseUrl = baseUrl;
    agent.deviceId = deviceId;
    agent.tenantId = tenantId;
    agent.connected = true;
    setStatus("Reconnecting");
    ui.activationMessage.textContent = "Reconnecting...";
    ui.baseUrlInput.value = baseUrl;
    ui.deviceValue.textContent = deviceId;
    ui.tenantValue.textContent = tenantId || "-";
    log("resume-attempt", { baseUrl, deviceId, tenantId });

    await precheckBaseUrl(baseUrl);
    await startConnectedLoops();
    setStatus("Connected");
    ui.activationMessage.textContent = "Connected (restored session)";
    log("resume-ok", { deviceId });
    return true;
  } catch (error) {
    const msg = error?.message || "";
    log("resume-error", { raw: msg, normalized: normalizeErrorMessage(error) });
    if (msg.includes("device_revoked_or_not_found") || msg.includes("HTTP 401") || msg.includes("HTTP 404")) {
      await disconnectAgent();
      await window.orcaDesktop.setState({ deviceId: null, tenantId: null });
      ui.activationMessage.textContent = "Session revoked. Connect again with a new pairing code.";
      setStatus("Revoked");
    } else {
      setStatus("Error");
      ui.activationMessage.textContent = `Error: ${normalizeErrorMessage(error)}`;
    }
    return false;
  }
}

async function connectAgent() {
  try {
    const baseUrl = ui.baseUrlInput.value.trim().replace(/\/$/, "");
    const pairingCode = normalizePairingCode(ui.pairingCodeInput.value);
    const deviceName = ui.deviceNameInput.value.trim() || "QA Desktop Agent";
    if (!baseUrl || !pairingCode) {
      const missing = [];
      if (!baseUrl) missing.push("Base URL");
      if (!pairingCode) missing.push("Pairing Code");
      throw new Error(`Missing fields: ${missing.join(", ")}`);
    }

    agent.baseUrl = baseUrl;
    ui.pairingCodeInput.value = pairingCode;
    try {
      const checked = await precheckBaseUrl(baseUrl);
      agent.baseUrl = checked.baseUrl;
      ui.baseUrlInput.value = checked.baseUrl;
      log("health-ok", checked.health);
      if (checked.usedFallback) {
        log("baseurl-fallback", { from: baseUrl, to: checked.baseUrl });
      }
    } catch (healthError) {
      throw new Error(`Precheck failed: ${normalizeErrorMessage(healthError)}`);
    }

    const enroll = await api("/api/v1/agent/devices/enroll", "POST", {
      pairingCode,
      deviceName,
      os: "windows",
      arch: "x64",
      agentVersion: "0.1.0",
      publicKey: `DESKTOP-PUBKEY-${Date.now()}`
    });

    agent.tenantId = enroll.tenantId;
    agent.deviceId = enroll.deviceId;
    agent.connected = true;

    await window.orcaDesktop.setState({
      baseUrl: agent.baseUrl,
      tenantId: agent.tenantId,
      deviceId: agent.deviceId
    });

    ui.tenantValue.textContent = agent.tenantId;
    ui.deviceValue.textContent = agent.deviceId;
    ui.activationMessage.textContent = "Connected";
    setStatus("Connected");
    log("enroll-ok", enroll);

    await startConnectedLoops();
  } catch (error) {
    ui.activationMessage.textContent = `Error: ${normalizeErrorMessage(error)}`;
    setStatus("Error");
    log("connect-error", {
      raw: error.message,
      normalized: normalizeErrorMessage(error),
      baseUrlLength: (ui.baseUrlInput.value || "").trim().length,
      pairingLength: (ui.pairingCodeInput.value || "").trim().length
    });
  }
}

async function disconnectAgent() {
  stopLoops();
  agent.connected = false;
  setStatus("Disconnected");
  ui.activationMessage.textContent = "Disconnected";
  ui.tenantValue.textContent = "-";
  ui.deviceValue.textContent = "-";
  await window.orcaDesktop.setState({ deviceId: null, tenantId: null });
}

async function restoreState() {
  const st = await window.orcaDesktop.getState();
  if (!st || !st.enrollment) {
    ui.baseUrlInput.value = ui.baseUrlInput.value || DEFAULT_BASE_URL;
    return;
  }
  ui.baseUrlInput.value = st.enrollment.baseUrl || ui.baseUrlInput.value || DEFAULT_BASE_URL;
  await tryResumeSession(st);
}

ui.connectBtn.addEventListener("click", () => connectAgent());
ui.resumeBtn.addEventListener("click", async () => {
  const st = await window.orcaDesktop.getState();
  const ok = await tryResumeSession(st);
  if (!ok) {
    log("resume-manual-failed");
  }
});
ui.disconnectBtn.addEventListener("click", () => disconnectAgent());
ui.openApiBtn.addEventListener("click", () => {
  const url = ui.baseUrlInput.value.trim();
  if (url) window.orcaDesktop.openExternal(url);
});

restoreState().catch((e) => log("restore-error", { error: e.message }));
