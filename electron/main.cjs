// Nook — Cross-Platform Desktop Notch Application Shell (Electron)
// Supports macOS Bezel Notch & Windows Dynamic Island Docking

const { app, BrowserWindow, screen, ipcMain, globalShortcut } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth } = primaryDisplay.workAreaSize;

  const windowWidth = 760;
  const windowHeight = 620;
  const posX = Math.round((screenWidth - windowWidth) / 2);
  const posY = 0; // Docked flush to the top bezel

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: posX,
    y: posY,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    movable: true,
    hasShadow: false,
    focusable: true,
    skipTaskbar: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allows loading local character assets & audio files
    },
  });

  // Always keep notch docked on top across workspaces
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setAlwaysOnTop(true, 'floating');

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      // Fallback to local bundle if dev server is not ready
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Register Global Hotkeys
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    mainWindow?.webContents.send('nook:hotkey-record');
  });

  globalShortcut.register('CommandOrControl+Shift+N', () => {
    mainWindow?.webContents.send('nook:hotkey-drawer');
  });

  globalShortcut.register('CommandOrControl+Shift+K', () => {
    mainWindow?.webContents.send('nook:hotkey-chat');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC communication
ipcMain.handle('get-platform-info', () => {
  return {
    platform: process.platform, // 'win32' or 'darwin'
    isMac: process.platform === 'darwin',
    isWindows: process.platform === 'win32',
    isPackaged: app.isPackaged,
  };
});

ipcMain.on('nook:set-window-size', (_event, { width, height }) => {
  if (!mainWindow) return;
  const primaryDisplay = screen.getPrimaryDisplay();
  const posX = Math.round((primaryDisplay.workAreaSize.width - width) / 2);
  mainWindow.setBounds({
    x: posX,
    y: 0,
    width,
    height,
  });
});

ipcMain.on('nook:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('nook:quit', () => {
  app.quit();
});
