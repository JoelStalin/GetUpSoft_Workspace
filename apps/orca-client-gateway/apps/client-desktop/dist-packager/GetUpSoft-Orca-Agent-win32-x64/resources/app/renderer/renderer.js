const ui = {
  baseUrlInput: document.getElementById("baseUrlInput"),
  pairingCodeInput: document.getElementById("pairingCodeInput"),
  deviceNameInput: document.getElementById("deviceNameInput"),
  connectBtn: document.getElementById("connectBtn"),
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

function log(message, data) {
  const line = `[${new Date().toISOString()}] ${message}${data ? ` ${JSON.stringify(data)}` : ""}`;
  ui.logView.textContent = `${line}\n${ui.logView.textContent}`.slice(0, 8000);
}

function setStatus(text) {
  ui.stateValue.textContent = text;
}

function safeJson(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
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

async function connectAgent() {
  try {
    const baseUrl = ui.baseUrlInput.value.trim().replace(/\/$/, "");
    const pairingCode = ui.pairingCodeInput.value.trim();
    const deviceName = ui.deviceNameInput.value.trim() || "QA Desktop Agent";
    if (!baseUrl || !pairingCode) throw new Error("Base URL and pairing code are required.");

    agent.baseUrl = baseUrl;
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

    await heartbeat();
    await pollCommands();
    stopLoops();
    agent.heartbeatTimer = setInterval(() => heartbeat().catch((e) => log("heartbeat-error", { error: e.message })), 15000);
    agent.pollTimer = setInterval(() => pollCommands().catch((e) => log("poll-error", { error: e.message })), 8000);
  } catch (error) {
    ui.activationMessage.textContent = `Error: ${error.message}`;
    setStatus("Error");
    log("connect-error", { error: error.message });
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
  if (!st || !st.enrollment) return;
  ui.baseUrlInput.value = st.enrollment.baseUrl || ui.baseUrlInput.value;
}

ui.connectBtn.addEventListener("click", () => connectAgent());
ui.disconnectBtn.addEventListener("click", () => disconnectAgent());
ui.openApiBtn.addEventListener("click", () => {
  const url = ui.baseUrlInput.value.trim();
  if (url) window.orcaDesktop.openExternal(url);
});

restoreState().catch((e) => log("restore-error", { error: e.message }));
