// import { createRequire } from 'node:module'
import os from 'node:os'
import process from 'node:process'
import { app, BrowserWindow } from 'electron'
import Store from 'electron-log'
import log from 'electron-log/main'
import { setupSocketIPCManager } from './socket/ipc-manager'
import { WindowManager } from './window-manager'
import './env'

// Optional, initialize the store for any renderer process
Store.initialize()
// Optional, initialize the logger for any renderer process
log.initialize()

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1'))
  app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32')
  app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

const windowManager = new WindowManager()

app.whenReady().then(() => {
  setupSocketIPCManager()
  windowManager.createWindow()
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  }
  else {
    windowManager.createWindow()
  }
})

// New window example arg: new windows url
// ipcMain.handle('open-win', (_, arg) => {
//   const childWindow = new BrowserWindow({
//     webPreferences: {
//       preload,
//       nodeIntegration: true,
//       contextIsolation: false,
//     },
//   })

//   if (VITE_DEV_SERVER_URL) {
//     childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
//   }
//   else {
//     childWindow.loadFile(indexHtml, { hash: arg })
//   }
// })
