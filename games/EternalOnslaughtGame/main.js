const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // This is the 'bulletproof' path code you asked for
  win.loadFile(path.join(__dirname, 'Index.html')); 

  // OPTIONAL: Uncomment the line below if you want to see the error console 
  // inside your .exe to debug further
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});