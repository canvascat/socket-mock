import type { MockClient, MockServer, SocketMockModule } from './common'
import type { MockKey, MockType, SocketType } from './type'
import * as socket from './socket'
import { normalizeMockKey } from './util'
import * as websocket from './websocket'

function loadModule(type: SocketType): Promise<SocketMockModule> {
  switch (type) {
    case 'socket':
      return import('./socket')
    case 'websocket':
      return import('./websocket')
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

/**
 * @deprecated use loadMockModule
 */
export function createMockServer(mockKey: MockKey): MockServer {
  const { socketType, mockType, name } = normalizeMockKey(mockKey)
  switch (socketType) {
    case 'socket':
      return socket.createMockServer(name)
    case 'websocket':
      return websocket.createMockServer(name)
    default:
      throw new Error(`Invalid ${mockType} key: ${mockKey}`)
  }
}
/**
 * @deprecated use loadMockModule
 */
export function createMockClient(mockKey: MockKey): MockClient {
  const { socketType, mockType, name } = normalizeMockKey(mockKey)
  switch (socketType) {
    case 'socket':
      return socket.createMockClient(name)
    case 'websocket':
      return websocket.createMockClient(name)
    default:
      throw new Error(`Invalid ${mockType} key: ${mockKey}`)
  }
}
