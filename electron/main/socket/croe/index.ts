import type { MockClient, MockServer } from './common'
import type { MockKey } from './type'
import * as socket from './socket'
import { normalizeMockKey } from './util'
import * as websocket from './websocket'
// export * as socketio from './socket-io';

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
