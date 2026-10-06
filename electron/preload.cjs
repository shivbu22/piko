// Nook — Electron Safe Preload Bridge

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
  getPlatformInfo: () => ipcRenderer.invoke('get-platform-info'),
  setWindowSize: (width, height) => ipcRenderer.send('nook:set-window-size', { width, height }),
  minimize: () => ipcRenderer.send('nook:minimize'),
  quit: () => ipcRenderer.send('nook:quit'),
  onRecordHotkey: (callback) => {
    ipcRenderer.on('nook:hotkey-record', () => callback());
  },
  onDrawerHotkey: (callback) => {
    ipcRenderer.on('nook:hotkey-drawer', () => callback());
  },
  onChatHotkey: (callback) => {
    ipcRenderer.on('nook:hotkey-chat', () => callback());
  },
});
