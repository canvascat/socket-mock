import type { HandleFnMap, OnFnMap } from '@main/socket'
import type { IPCSendMesssageType } from '@main/socket/manager'
import { fromEvent } from 'rxjs'
import { createRpc } from './rpc'

const ipcMessage = fromEvent<IPCSendMesssageType>(window.ipcRenderer, 'ipc-message', (_event, message) => message)

function createIpcInvoke() {
  return createRpc<HandleFnMap, 'invoke'>('invoke')
}

function createIpcSend() {
  return createRpc<OnFnMap, 'send'>('send')
}

export const ipc = {
  invoke: createIpcInvoke(),
  send: createIpcSend(),
  subscribe: (onMessage: (message: IPCSendMesssageType) => void) => ipcMessage.subscribe(onMessage),
}
