const path = require("path");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");
const { app, BrowserWindow, ipcMain, shell } = require("electron");

const APP_STATE = {
  enrollment: {
    baseUrl: "https://ethernet-deck-frog-holds.trycloudflare.com",
    deviceId: null,
    tenantId: null
  }
};

function appendBootstrapLog(message, extra) {
  try {
    const p = path.join(app.getPath("userData"), "GetUpSoft", "OrcaAgent", "desktop-ui.log");
    fs.mkdirSync(path.dirname(p), { recursive: true });
    const line = `[${new Date().toISOString()}] ${message}${extra ? ` ${JSON.stringify(extra)}` : ""}\n`;
    fs.appendFileSync(p, line, "utf8");
  } catch {
    // no-op
  }
}

function getStatePaths() {
  const dir = path.join(app.getPath("userData"), "GetUpSoft", "OrcaAgent");
  return {
    dir,
    stateFile: path.join(dir, "state.enc"),
    saltFile: path.join(dir, "state.salt")
  };
}

function ensureStateDir() {
  const { dir } = getStatePaths();
  fs.mkdirSync(dir, { recursive: true });
}

function loadOrCreateSalt() {
  const { saltFile } = getStatePaths();
  if (fs.existsSync(saltFile)) return fs.readFileSync(saltFile);
  const salt = crypto.randomBytes(16);
  fs.writeFileSync(saltFile, salt);
  return salt;
}

function deriveKey() {
  const salt = loadOrCreateSalt();
  const secret = `${os.userInfo().username}|${os.hostname()}|GetUpSoft-OrcaAgent-v1`;
  return crypto.scryptSync(secret, salt, 32);
}

function encryptJson(obj) {
  const iv = crypto.randomBytes(12);
  const key = deriveKey();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(obj), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

function decryptJson(raw) {
  const buf = Buffer.from(raw, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ciphertext = buf.subarray(28);
  const key = deriveKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  return JSON.parse(plaintext);
}

function saveState() {
  ensureStateDir();
  const { stateFile, saltFile } = getStatePaths();
  const enc = encryptJson(APP_STATE);
  fs.writeFileSync(stateFile, enc, "utf8");
  appendBootstrapLog("state-saved", { stateFile, saltFile });
}

function loadState() {
  try {
    ensureStateDir();
    const { stateFile } = getStatePaths();
    if (!fs.existsSync(stateFile)) {
      appendBootstrapLog("state-not-found", { stateFile });
      return;
    }
    const raw = fs.readFileSync(stateFile, "utf8");
    const parsed = decryptJson(raw);
    if (parsed && parsed.enrollment) {
      APP_STATE.enrollment = { ...APP_STATE.enrollment, ...parsed.enrollment };
    }
    appendBootstrapLog("state-loaded", { stateFile });
  } catch {
    // keep defaults on any state read/decrypt error
    appendBootstrapLog("state-load-error");
  }
}

function createWindow() {
  const logDir = path.join(app.getPath("userData"), "GetUpSoft", "OrcaAgent");
  const logFile = path.join(logDir, "desktop-ui.log");
  fs.mkdirSync(logDir, { recursive: true });
  const writeLog = (msg, extra) => {
    const line = `[${new Date().toISOString()}] ${msg}${extra ? ` ${JSON.stringify(extra)}` : ""}\n`;
    fs.appendFileSync(logFile, line, "utf8");
  };

  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 900,
    minHeight: 680,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.webContents.on("did-fail-load", (_, code, desc, url) => {
    writeLog("did-fail-load", { code, desc, url });
  });
  win.webContents.on("render-process-gone", (_, details) => {
    writeLog("render-process-gone", details);
  });
  win.webContents.on("did-finish-load", () => {
    writeLog("did-finish-load", { url: win.webContents.getURL() });
  });

  const target = path.join(__dirname, "renderer", "index.html");
  writeLog("loadFile", { target });
  win.loadFile(target);
}

app.whenReady().then(() => {
  loadState();
  saveState();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.disableHardwareAcceleration();

ipcMain.handle("state:get", async () => APP_STATE);
ipcMain.handle("state:set", async (_, next) => {
  APP_STATE.enrollment = { ...APP_STATE.enrollment, ...(next || {}) };
  saveState();
  return APP_STATE;
});
ipcMain.handle("shell:openExternal", async (_, url) => {
  await shell.openExternal(url);
  return true;
});
