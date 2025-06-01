import type { MockClient, MockServer, SocketMockModule } from './common'
import type { MockKey, MockType, SocketType } from './type'
import process from 'node:process'
import * as pipe from './pipe-socket'
import * as tcp from './tcp-socket'
import * as unix from './unix-socket'
import { normalizeMockKey } from './util'
import * as ws from './websocket'

export const supportModules = new Map<SocketType, SocketMockModule>([
  [tcp.socketType, tcp],
  [ws.socketType, ws],
])

if (process.platform === 'win32') {
  supportModules.set(pipe.socketType, pipe)
}

if (process.platform === 'linux' || process.platform === 'darwin') {
  supportModules.set(unix.socketType, unix)
}

async function loadModule(type: SocketType): Promise<SocketMockModule> {
  if (supportModules.has(type)) {
    return supportModules.get(type)!
  }

  switch (type) {
    case pipe.socketType:
      return import('./pipe-socket')
    case tcp.socketType:
      return import('./tcp-socket')
    case unix.socketType:
      return import('./unix-socket')
    default:
      throw new Error(`Invalid socket type: ${type}`)
  }
}

export async function loadMockModule<T extends MockType>(mockKey: MockKey<T>): Promise<T extends 'client' ? MockClient : MockServer> {
  const { socketType, mockType, name } = normalizeMockKey(mockKey)
  const module = await loadModule(socketType)
  return mockType === 'client'
    ? (module.createMockClient(name) as T extends 'client' ? MockClient : never)
    : (module.createMockServer(name) as T extends 'client' ? never : MockServer)
}
