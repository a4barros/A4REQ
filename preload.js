const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
    request: (options) => ipcRenderer.invoke("http-request", options),
});