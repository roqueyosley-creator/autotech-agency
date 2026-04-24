const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'AutoTech PRO',
    show: false, // Prevents white flash
    icon: path.join(__dirname, '../dist/icon-512.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.setMenuBarVisibility(false);

  win.once('ready-to-show', () => {
    win.show();
  });

  // Load the compiled React app
  win.loadFile(path.join(__dirname, '../dist/index.html'));
}

process.on('uncaughtException', (error) => {
    console.error('Unhandled Exception:', error);
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
