// electron/preload.js

// ============================================
// PRELOAD — PUENTE SEGURO ENTRE ELECTRON Y REACT
// ============================================

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expone funciones nativas de Electron al contexto de React
 * de forma segura mediante contextBridge.
 * Las funciones aquí definidas son accesibles via window.electronAPI
 */
contextBridge.exposeInMainWorld('electronAPI', {
  sayHello: () => console.log("Hola desde el sistema nativo")
});