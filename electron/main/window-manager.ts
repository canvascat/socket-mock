import type { MockType } from './socket'
import path from 'node:path'
import process from 'node:process'
import { app, BrowserWindow, screen, shell } from 'electron'
import log from 'electron-log/main'
// import pkg from '../../package.json'
// import { MAIN_DIST, RENDERER_DIST } from './env'
import { update } from './update'

const preload = path.join(__dirname, '../preload/index.mjs')

export class WindowManager {
  private readonly logger = log.scope(this.constructor.name)
  private mainWindow: BrowserWindow | null = null

  constructor() {
    this.logger.info('WindowManager constructor')
    app.on('window-all-closed', () => {
      this.mainWindow = null
      if (process.platform !== 'darwin')
        app.quit()
    })
    app.on('second-instance', () => {
      if (this.mainWindow) {
        // Focus on the main window if the user tried to open another
        if (this.mainWindow.isMinimized())
          this.mainWindow.restore()
        this.mainWindow.focus()
      }
    })
  }

  // 创建新窗口
  createWindow(_type: MockType = 'server') {
    const workAreaSize = screen.getPrimaryDisplay().workAreaSize
    const height = Math.min(Math.max(workAreaSize.height / 3 * 2, 800), workAreaSize.height)
    const width = Math.min(Math.max(workAreaSize.width / 3 * 2, 1200), workAreaSize.width)

    // 创建窗口
    const browserWindow = new BrowserWindow({
      title: 'Main window',
      icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
      autoHideMenuBar: true,
      height,
      width,
      webPreferences: {
        preload,
        // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
        // nodeIntegration: true,

        // Consider using contextBridge.exposeInMainWorld
        // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
        // contextIsolation: false,
      },
    })

    // // 如果没有指定位置，智能定位
    // if (!finalConfig.x && !finalConfig.y) {
    this.smartPosition(browserWindow)
    // }

    // 加载页面
    this.loadWindowContent(browserWindow)

    this.mainWindow = browserWindow
  }

  // 智能定位窗口
  private smartPosition(window: BrowserWindow) {
    const mainWin = BrowserWindow.getFocusedWindow()
    if (!mainWin)
      return
    const { x, y } = mainWin.getBounds()
    window.setPosition(x + 20, y + 20)
  }

  // 加载窗口内容
  private loadWindowContent(window: BrowserWindow) {
    if (process.env.VITE_DEV_SERVER_URL) { // #298
      this.logger.debug('loadURL', process.env.VITE_DEV_SERVER_URL)
      window.loadURL(process.env.VITE_DEV_SERVER_URL)
      // Open devTool if the app is not packaged
      window.webContents.openDevTools({ mode: 'detach' })
    }
    else {
      const indexHtml = path.join(process.env.APP_ROOT, 'dist/index.html')

      window.loadFile(indexHtml)
    }

    // Test actively push message to the Electron-Renderer
    window.webContents.on('did-finish-load', () => {
      window?.webContents.send('main-process-message', new Date().toLocaleString())
    })

    window.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('https:'))
        shell.openExternal(url)
      return { action: 'deny' }
    })

    // Auto update
    update(window)
  }
}
