import type { HandleFnMap, OnFnMap } from '@main/socket'
import type { MockKey } from '@main/socket/croe/type'
import type { IPCSendMesssageType } from '@main/socket/manager'
import { normalizeMockKey } from '@main/socket/croe/util'
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

export async function precheckServer(params: MockKey<'server'> | Parameters<HandleFnMap['checkServer']>[0]) {
  if (typeof params === 'string') {
    const { name, socketType } = normalizeMockKey(params)
    console.debug(params, socketType, name)
    params = socketType === 'websocket' ? { port: +name } : { path: name }
  }
  return ipc.invoke.checkServer(params)
}
