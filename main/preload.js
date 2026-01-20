const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Aquí definiremos funciones que React podrá usar
  sayHello: () => console.log("Hola desde el sistema nativo")
});