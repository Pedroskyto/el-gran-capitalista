"use strict";

const { app, BrowserWindow, shell, ipcMain, globalShortcut, dialog } = require("electron");
const path = require("path");

// electron-updater es opcional — si no está instalado el juego arranca igual
let autoUpdater = null;
try {
  autoUpdater = require("electron-updater").autoUpdater;
} catch (e) {
  console.log("[updater] electron-updater no disponible:", e.message);
}

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

let mainWindow;
let splashWindow;
let updateWindow = null;

// ── SPLASH ────────────────────────────────────────────────────────────────────

function createSplash() {
  splashWindow = new BrowserWindow({
    width: 480,
    height: 300,
    frame: false,
    transparent: false,
    resizable: false,
    center: true,
    skipTaskbar: true,
    alwaysOnTop: true,
    backgroundColor: "#06050f",
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });
  splashWindow.loadFile(path.join(__dirname, "splash.html"));
  splashWindow.show();
}

// ── MAIN WINDOW ───────────────────────────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    title: "El Gran Capitalista",
    icon: path.join(__dirname, "public", "icon.png"),
    backgroundColor: "#080810",
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.destroy();
        splashWindow = null;
      }
      mainWindow.show();
      mainWindow.focus();
      if (!isDev) checkForUpdates();
    }, 1500);
  });

  mainWindow.on("enter-full-screen", () => {
    mainWindow.webContents.send("fullscreen-changed", true);
  });
  mainWindow.on("leave-full-screen", () => {
    mainWindow.webContents.send("fullscreen-changed", false);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => { mainWindow = null; });
}

// ── UPDATE PROGRESS WINDOW ────────────────────────────────────────────────────

function createUpdateWindow(version) {
  if (updateWindow && !updateWindow.isDestroyed()) return;

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: 'Segoe UI', sans-serif;
    background: #0d0d1a;
    color: #e0e0ff;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 28px 32px;
    gap: 14px;
    user-select: none;
    -webkit-app-region: drag;
  }
  .label { font-size: 11px; font-weight: 700; color: #5555aa; letter-spacing: 2px; text-transform: uppercase; }
  .version { font-size: 20px; font-weight: 800; color: #ffffff; }
  .bar-wrap { width: 100%; height: 10px; background: #1a1a2e; border-radius: 6px; overflow: hidden; }
  .bar { height: 100%; width: 0%; background: linear-gradient(90deg, #4a9eff, #9b59ff); border-radius: 6px; transition: width 0.4s ease; }
  .percent { font-size: 32px; font-weight: 900; color: #4a9eff; }
  .status { font-size: 12px; color: #6666aa; }
  .info { font-size: 11px; color: #44446a; }
  .btns { display: flex; gap: 10px; margin-top: 4px; }
  button { -webkit-app-region: no-drag; padding: 9px 22px; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; }
  button:hover { opacity: 0.85; }
  #btn-install { background: linear-gradient(135deg, #4a9eff, #9b59ff); color: #fff; }
  #btn-later { background: #1a1a2e; color: #6666aa; }
  .done-icon { font-size: 36px; }
  .hidden { display: none !important; }
</style>
</head><body>
  <div class="label">El Gran Capitalista</div>
  <div class="version">Actualizando a v${version}</div>

  <div id="section-downloading" style="width:100%;display:flex;flex-direction:column;align-items:center;gap:12px">
    <div class="percent" id="pct">0%</div>
    <div class="bar-wrap" style="width:340px"><div class="bar" id="bar"></div></div>
    <div class="status" id="status">Iniciando descarga...</div>
    <div class="info" id="info"></div>
  </div>

  <div id="section-done" class="hidden" style="display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center">
    <div class="done-icon">&#x2705;</div>
    <div style="font-size:16px;font-weight:700;color:#fff">Actualizacion lista</div>
    <div class="status">Instala ahora o al cerrar el juego</div>
    <div class="btns">
      <button id="btn-install">Instalar y reiniciar</button>
      <button id="btn-later">Al cerrar</button>
    </div>
  </div>

<script>
  const { ipcRenderer } = require('electron');
  ipcRenderer.on('update-progress', (_, p) => {
    const pct = Math.round(p.percent || 0);
    document.getElementById('pct').textContent = pct + '%';
    document.getElementById('bar').style.width = pct + '%';
    const mbps = p.bytesPerSecond ? (p.bytesPerSecond / 1024 / 1024).toFixed(1) : '0';
    const xfer = p.transferred ? (p.transferred / 1024 / 1024).toFixed(1) : '0';
    const total = p.total ? (p.total / 1024 / 1024).toFixed(1) : '?';
    document.getElementById('status').textContent = 'Descargando... ' + mbps + ' MB/s';
    document.getElementById('info').textContent = xfer + ' MB / ' + total + ' MB';
  });
  ipcRenderer.on('update-ready', () => {
    document.getElementById('section-downloading').classList.add('hidden');
    document.getElementById('section-done').classList.remove('hidden');
    document.getElementById('section-done').style.display = 'flex';
  });
  document.getElementById('btn-install').onclick = () => ipcRenderer.send('install-update');
  document.getElementById('btn-later').onclick = () => ipcRenderer.send('close-update-window');
</script>
</body></html>`;

  updateWindow = new BrowserWindow({
    width: 440,
    height: 270,
    frame: false,
    resizable: false,
    center: true,
    alwaysOnTop: true,
    backgroundColor: "#0d0d1a",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  updateWindow.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));
  updateWindow.on("closed", () => { updateWindow = null; });
}

// ── AUTO-UPDATER ──────────────────────────────────────────────────────────────

function checkForUpdates() {
  if (!autoUpdater) return;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.checkForUpdates().catch(() => {});

  autoUpdater.on("update-available", (info) => {
    dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Nueva version disponible",
      message: `El Gran Capitalista v${info.version} esta disponible.`,
      detail: "Puedes seguir jugando mientras se descarga en segundo plano.",
      buttons: ["Descargar", "Ahora no"],
      defaultId: 0,
      cancelId: 1,
    }).then(({ response }) => {
      if (response === 0) {
        createUpdateWindow(info.version);
        autoUpdater.downloadUpdate();
      }
    });
  });

  autoUpdater.on("download-progress", (progress) => {
    if (updateWindow && !updateWindow.isDestroyed()) {
      updateWindow.webContents.send("update-progress", progress);
    }
  });

  autoUpdater.on("update-downloaded", () => {
    if (updateWindow && !updateWindow.isDestroyed()) {
      updateWindow.webContents.send("update-ready");
    } else {
      dialog.showMessageBox(mainWindow, {
        type: "info",
        title: "Actualizacion lista",
        message: "La actualizacion esta lista para instalar.",
        detail: "Instalar y reiniciar ahora?",
        buttons: ["Instalar ahora", "Al cerrar el juego"],
        defaultId: 0,
      }).then(({ response }) => {
        if (response === 0) autoUpdater.quitAndInstall();
      });
    }
  });

  autoUpdater.on("update-not-available", () => {});
  autoUpdater.on("error", (err) => {
    dialog.showMessageBox(mainWindow, {
      type: "error",
      title: "Update Error",
      message: err.message || "Unknown error",
      detail: err.stack || "",
      buttons: ["OK"]
    });
  });
}

// ── IPC ───────────────────────────────────────────────────────────────────────

ipcMain.handle("toggle-fullscreen", () => {
  if (!mainWindow) return;
  mainWindow.setFullScreen(!mainWindow.isFullScreen());
  return mainWindow.isFullScreen();
});

ipcMain.handle("is-fullscreen", () => {
  return mainWindow ? mainWindow.isFullScreen() : false;
});

ipcMain.handle("quit-app", () => {
  app.quit();
});

ipcMain.on("install-update", () => {
  autoUpdater.quitAndInstall();
});

ipcMain.on("close-update-window", () => {
  if (updateWindow && !updateWindow.isDestroyed()) updateWindow.close();
});

// ── APP LIFECYCLE ─────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  createSplash();
  createWindow();

  globalShortcut.register("F11", () => {
    if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
