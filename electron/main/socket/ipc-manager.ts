import type { IpcMainInvokeEvent } from 'electron'
import type { IPCSendMesssageType } from './index'
import { BrowserWindow, ipcMain } from 'electron'
import log from 'electron-log/main'
import { SocketManager } from './socket-manager'

function broadcast(message: any) {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send('ipc-message', message)
  })
}

export type IPCInvokeMap = Pick<SocketManager, 'broadcastMessage' | 'getServerMockKeys' | 'getSocketTypeOptions' | 'createClient' | 'createServer' | 'closeClient' | 'closeServer'>

interface IPCInvokeData<T extends keyof IPCInvokeMap = keyof IPCInvokeMap> {
  type: T
  args: Parameters<IPCInvokeMap[T]>
}

class SocketIPCManager {
  private readonly socketManager = new SocketManager()
  private readonly logger = log.scope(this.constructor.name)

  constructor() {
    this.socketManager.on('message', this.onMessage.bind(this))
    ipcMain.handle('ipc:invoke', this.onHandle.bind(this))
  }

  private onMessage(message: IPCSendMesssageType) {
    this.logger.debug('onMessage', message)
    broadcast(message)
  }

  private async onHandle(_event: IpcMainInvokeEvent, data: IPCInvokeData) {
    this.logger.debug(`ipc:handle invoke ${data.type}`, ...data.args)
    const result = await (this.socketManager[data.type] as any)(...data.args)
    this.logger.debug('ipc:handle result', result)
    return result
  }

  [Symbol.dispose]() {
    this.logger.debug('dispose')
    ipcMain.removeHandler('ipc:handle')
    this.socketManager.off('message', this.onMessage)
    this.socketManager[Symbol.dispose]()
  }
}

export function setupSocketIPCManager() {
  const socketIPCManager = new SocketIPCManager()
  return () => socketIPCManager[Symbol.dispose]()
}
