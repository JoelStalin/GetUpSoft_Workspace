const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("orcaDesktop", {
  getState: () => ipcRenderer.invoke("state:get"),
  setState: (state) => ipcRenderer.invoke("state:set", state),
  openExternal: (url) => ipcRenderer.invoke("shell:openExternal", url)
});
