// electron/main.js

// ============================================
// PROCESO PRINCIPAL DE ELECTRON
// ============================================

const { app, BrowserWindow } = require('electron');
const path = require('path');

/**
 * Crea la ventana principal de la aplicación.
 * En desarrollo carga el servidor de Vite, en producción el build estático.
 * contextIsolation y nodeIntegration desactivado por seguridad.
 */
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      nodeIntegration:  false,
      contextIsolation: true,
    },
  });

  win.loadURL('http://localhost:5173');
  // win.webContents.openDevTools();
}

/**
 * Inicializa la app cuando Electron está listo.
 * En macOS (darwin) vuelve a crear la ventana si no hay ninguna abierta.
 */
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

/**
 * Cierra la app al cerrar todas las ventanas, excepto en macOS
 * donde las apps suelen permanecer activas sin ventanas.
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});