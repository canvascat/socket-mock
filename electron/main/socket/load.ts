import type { MockClient, MockServer, SocketMockModule } from './croe/common'
import type { MockKey, MockType, SocketType } from './type'
import * as pipe from './croe/pipe-socket'
import * as tcp from './croe/tcp-socket'
import * as unix from './croe/unix-socket'
import { normalizeMockKey } from './util'

export const supportModules = new Map<SocketType, SocketMockModule>(
  [
    [pipe.socketType, pipe] as const,
    [tcp.socketType, tcp] as const,
    [unix.socketType, unix] as const,
  ].filter(([_, module]) => module.isSupport),
)

async function loadModule(type: SocketType): Promise<SocketMockModule> {
  if (supportModules.has(type)) {
    return supportModules.get(type)!
  }
  // TODO: 支持动态加载模块
  throw new Error(`Invalid socket type: ${type}`)
}

export async function loadMockModule<T extends MockType>(mockKey: MockKey<T>): Promise<T extends 'client' ? MockClient : MockServer> {
  const { socketType, mockType, name } = normalizeMockKey(mockKey)
  const module = await loadModule(socketType)
  return mockType === 'client'
    ? (module.createMockClient(name) as T extends 'client' ? MockClient : never)
    : (module.createMockServer(name) as T extends 'client' ? never : MockServer)
}
