import type { MockClient, MockServer } from './croe/common'
import type { MockClientEventMap, MockKey, MockServerEventMap } from './croe/type'
import EventEmitter from 'node:events'
import log from 'electron-log/main'
import { fromEvent, merge } from 'rxjs'
import { SOCKET_CLIENT_EVENT_NAMES, SOCKET_SERVER_EVENT_NAMES } from './croe/const'
import { loadMockModule, supportModules } from './croe/load'

interface ServerMessage<T extends keyof MockServerEventMap = keyof MockServerEventMap> {
  name: MockKey
  type: `server:${T}`
  args: MockServerEventMap[T]
}

interface ClientMessage<T extends keyof MockClientEventMap = keyof MockClientEventMap> {
  name: MockKey
  clientId: string
  type: `client:${T}`
  args: MockClientEventMap[T]
}
export type ServerMessageType =
  | ServerMessage<'listening'>
  | ServerMessage<'close'>
  | ServerMessage<'error'>
  | ServerMessage<'connect'>
  | ServerMessage<'disconnect'>
  | ServerMessage<'message'>
  | ServerMessage<'broadcast'>
export type ClientMessageType =
  | ClientMessage<'connect'>
  | ClientMessage<'disconnect'>
  | ClientMessage<'error'>
  | ClientMessage<'message'>
  | ClientMessage<'send'>

type AddPrefix<T, P extends string> = {
  [K in keyof T as `${P}:${string & K}`]: T[K]
}

type SocketManagerClientEventMap<T extends keyof MockClientEventMap = keyof MockClientEventMap> = {
  [P in T]: [ClientMessage<P>]
}
type SocketManagerServerEventMap<T extends keyof MockServerEventMap = keyof MockServerEventMap> = {
  [P in T]: [ServerMessage<P>]
}
export type IPCSendMesssageType = ServerMessageType | ClientMessageType
type SocketManagerEventMap = AddPrefix<SocketManagerClientEventMap, 'client'> & AddPrefix<SocketManagerServerEventMap, 'server'> & {
  message: [IPCSendMesssageType]
}

export class SocketManager extends EventEmitter<SocketManagerEventMap> {
  private readonly logger = log.scope(this.constructor.name)
  private readonly clients = new Map<MockKey<'client'>, Map<string, MockClient>>()
  private readonly servers = new Map<MockKey<'server'>, MockServer>()
  private clientId = 0

  /**
   * 获取支持的模块类型
   * @returns 支持的模块类型
   */
  getSocketTypeOptions() {
    return Array.from(supportModules.values()).map(module => ({
      label: module.socketTypeName,
      value: module.socketType,
    }))
  }

  /**
   * 创建客户端
   * @param name 客户端名称
   * @returns 客户端
   */
  async createClient(name: MockKey<'client'>) {
    const client = await loadMockModule(name)
    const id = `${this.clientId++}`
    if (!this.clients.has(name)) {
      this.clients.set(name, new Map())
    }
    this.clients.get(name)!.set(id, client)
    const sub = merge(...SOCKET_CLIENT_EVENT_NAMES.map(eventName => fromEvent<ClientMessageType>(client, eventName, (...args) => ({
      name,
      clientId: id,
      type: `client:${eventName}` as const,
      args: args as any,
    })))).subscribe((data) => {
      this.emit(data.type, data as any)
      this.emit('message', data)
    })
    client.once('disconnect', () => {
      this.logger.debug('on disconnect', name)
      setImmediate(() => {
        this.closeClient(name, id)
        sub.unsubscribe()
      })
    })
    return { name, id }
  }

  /**
   * 创建服务器
   * @param name 服务器名称
   * @returns 服务器
   */
  async createServer(name: MockKey<'server'>) {
    const server = await loadMockModule(name)
    this.servers.set(name, server)
    const sub = merge(...SOCKET_SERVER_EVENT_NAMES.map(eventName => fromEvent<ServerMessageType>(server, eventName, (...args) => ({
      name,
      type: `server:${eventName}`,
      args: args as any,
    })))).subscribe((data) => {
      this.emit(data.type, data as any)
      this.emit('message', data)
    })
    server.once('close', () => {
      this.logger.debug('on close', name)
      setImmediate(() => {
        // this.closeServer(name)
        sub.unsubscribe()
      })
    })
    return { name }
  }

  /**
   * 关闭客户端
   * @param name 客户端名称
   * @param id 客户端ID
   */
  closeClient(name: MockKey<'client'>, id: string) {
    const client = this.clients.get(name)?.get(id)
    if (client) {
      this.logger.debug('closeClient', name, id)
      client.close()
      this.clients.get(name)!.delete(id)
    }
  }

  /**
   * 关闭服务器
   * @param name 服务器名称
   */
  closeServer(name: MockKey<'server'>) {
    const server = this.servers.get(name)
    if (server) {
      this.logger.debug('closeServer', name)
      server[Symbol.dispose]()
      this.servers.delete(name)
    }
  }

  [Symbol.dispose]() {
    this.servers.forEach(server => server[Symbol.dispose]())
    this.clients.forEach(client => client.forEach(client => client[Symbol.dispose]()))
    this.servers.clear()
    this.clients.clear()
  }
}
