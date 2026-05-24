const path = require("path");
const { app, BrowserWindow, ipcMain, shell } = require("electron");

const APP_STATE = {
  enrollment: {
    baseUrl: "https://ethernet-deck-frog-holds.trycloudflare.com",
    deviceId: null,
    tenantId: null
  }
};

function createWindow() {
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

  win.loadFile(path.join(__dirname, "renderer", "index.html"));
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("state:get", async () => APP_STATE);
ipcMain.handle("state:set", async (_, next) => {
  APP_STATE.enrollment = { ...APP_STATE.enrollment, ...(next || {}) };
  return APP_STATE;
});
ipcMain.handle("shell:openExternal", async (_, url) => {
  await shell.openExternal(url);
  return true;
});
