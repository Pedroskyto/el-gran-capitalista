"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  toggleFullscreen: () => ipcRenderer.invoke("toggle-fullscreen"),
  isFullscreen:     () => ipcRenderer.invoke("is-fullscreen"),
  onFullscreenChange: (cb) => {
    ipcRenderer.on("fullscreen-changed", (_event, value) => cb(value));
    return () => ipcRenderer.removeAllListeners("fullscreen-changed");
  },
  quit: () => ipcRenderer.invoke("quit-app"),
});
