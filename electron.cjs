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
    show: false, // espera a estar listo antes de mostrarse
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
    // Mínimo 1.5s de splash para que no sea un parpadeo
    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.destroy();
        splashWindow = null;
      }
      mainWindow.show();
      mainWindow.focus();
      // Comprobar actualizaciones tras mostrar la ventana
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

// ── AUTO-UPDATER ──────────────────────────────────────────────────────────────

function checkForUpdates() {
  if (!autoUpdater) return; // módulo no disponible, salir silenciosamente

  autoUpdater.autoDownload = false; // pregunta antes de descargar
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.checkForUpdates().catch(() => {}); // falla silenciosamente si no hay red

  autoUpdater.on("update-available", (info) => {
    dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Actualización disponible",
      message: `El Gran Capitalista v${info.version} ya está disponible.`,
      detail: "¿Quieres descargarla ahora? Se instalará al cerrar el juego.",
      buttons: ["Descargar", "Ahora no"],
      defaultId: 0,
      cancelId: 1,
    }).then(({ response }) => {
      if (response === 0) {
        autoUpdater.downloadUpdate();
        dialog.showMessageBox(mainWindow, {
          type: "info",
          title: "Descargando actualización...",
          message: "La actualización se descarga en segundo plano.",
          detail: "Se instalará automáticamente cuando cierres el juego.",
          buttons: ["OK"],
        });
      }
    });
  });

  autoUpdater.on("update-not-available", () => {
    // Silencioso — no molestamos al jugador si no hay nada nuevo
  });

  autoUpdater.on("error", () => {
    // Silencioso — no interrumpimos el juego por un error de red
  });

  autoUpdater.on("update-downloaded", () => {
    dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Actualización lista",
      message: "La actualización está lista para instalar.",
      detail: "¿Instalar y reiniciar ahora?",
      buttons: ["Instalar ahora", "Al cerrar el juego"],
      defaultId: 0,
    }).then(({ response }) => {
      if (response === 0) autoUpdater.quitAndInstall();
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
