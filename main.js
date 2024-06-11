const { app, BrowserWindow } = require('electron');
const express = require('express');
const path = require('path');
const { autoUpdater } = require('electron-updater');

autoUpdater.autoDownload = true; 
const expressApp = express();
const PORT = process.env.PORT || 3000;
expressApp.use(express.json())
expressApp.use(express.urlencoded({extended: true}));

// Serve the static files from the React app
expressApp.use(express.static(path.join(__dirname, 'frontend/build')));

expressApp.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
});

const server = expressApp.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadURL(`http://localhost:${PORT}`);
  autoUpdater.checkForUpdatesAndNotify();
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
