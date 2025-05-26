import type { IpcMainEvent, IpcMainInvokeEvent } from 'electron'
import type { IPCSendMesssageType } from './manager'
import { BrowserWindow, ipcMain } from 'electron'
import log from 'electron-log/main'
import { SocketManager } from './manager'

function broadcast(message: any) {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send('ipc-message', message)
  })
}

export type OnFnMap = Pick<SocketManager, 'createServer' | 'createClient' | 'closeServer' | 'closeClient' | 'send2server' | 'broadcast2client'>

export type OnEventMap = {
  [K in keyof OnFnMap]: Parameters<OnFnMap[K]>;
}

export type HandleFnMap = Pick<SocketManager, 'getServerItems' | 'getClientItems' | 'checkServer'>

interface HandleData<T extends keyof HandleFnMap> {
  type: T
  args: Parameters<HandleFnMap[T]>
}

interface OnData<T extends keyof OnEventMap> {
  type: T
  args: OnEventMap[T]
}

class SocketIPCManager {
  private readonly socketManager = new SocketManager()
  private readonly logger = log.scope(this.constructor.name)

  constructor() {
    this.socketManager.on('message', this.onMessage.bind(this))
    ipcMain.handle('ipc:handle', this.onHandle.bind(this))
    ipcMain.on('ipc:on', this.onOn.bind(this))
  }

  private onMessage(message: IPCSendMesssageType) {
    this.logger.debug('onMessage', message)
    broadcast(message)
  }

  private async onHandle(_event: IpcMainInvokeEvent, data: HandleData<keyof HandleFnMap>) {
    this.logger.debug(`ipc:handle invoke ${data.type}`, ...data.args)
    const result = await (this.socketManager[data.type] as any)(...data.args)
    this.logger.debug('ipc:handle result', result)
    return result
  }

  private onOn(_event: IpcMainEvent, data: OnData<keyof OnFnMap>) {
    this.logger.debug(`ipc:on invoke ${data.type}`, ...data.args);
    (this.socketManager[data.type] as any)(...data.args)
  }

  [Symbol.dispose]() {
    this.logger.debug('dispose')
    ipcMain.removeHandler('ipc:handle')
    ipcMain.removeListener('ipc:on', this.onOn)
    this.socketManager.off('message', this.onMessage)
    this.socketManager[Symbol.dispose]()
  }
}
export function setupSocketManager() {
  const socketIPCManager = new SocketIPCManager()

  return () => socketIPCManager[Symbol.dispose]()
}
