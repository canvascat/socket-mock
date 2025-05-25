import type { ListenOptions } from 'node:net'
import type { MockClient, MockServer } from './croe/common'
import type { MockClientEventMap, MockKey, MockServerEventMap, SocketType } from './croe/type'
import { EventEmitter } from 'node:events'
import { createServer } from 'node:net'
import log from 'electron-log/main'
import { fromEvent, merge } from 'rxjs'
import { createMockClient, createMockServer } from './croe'
import { normalizeMockKey } from './croe/util'
import { SocketStore } from './store'

interface ServerMessage<T extends keyof MockServerEventMap = keyof MockServerEventMap> {
  name: MockKey
  type: `server:${T}`
  args: MockServerEventMap[T]
}

interface ClientMessage<T extends keyof MockClientEventMap = keyof MockClientEventMap> {
  name: MockKey
  type: `client:${T}`
  args: MockClientEventMap[T]
}

type ServerMessageType =
  | ServerMessage<'listening'>
  | ServerMessage<'close'>
  | ServerMessage<'error'>
  | ServerMessage<'connect'>
  | ServerMessage<'disconnect'>
  | ServerMessage<'message'>
  | ServerMessage<'send'>
type ClientMessageType =
  | ClientMessage<'connect'>
  | ClientMessage<'disconnect'>
  | ClientMessage<'error'>
  | ClientMessage<'message'>
  | ClientMessage<'send'>

export type IPCSendMesssageType = ServerMessageType | ClientMessageType

type AddPrefix<T, P extends string> = {
  [K in keyof T as `${P}:${string & K}`]: T[K]
}

type SocketManagerClientEventMap<T extends keyof MockClientEventMap = keyof MockClientEventMap> = {
  [P in T]: [ClientMessage<P>]
}
type SocketManagerServerEventMap<T extends keyof MockServerEventMap = keyof MockServerEventMap> = {
  [P in T]: [ServerMessage<P>]
}

type SocketManagerEventMap = AddPrefix<SocketManagerClientEventMap, 'client'> & AddPrefix<SocketManagerServerEventMap, 'server'> & {
  message: [IPCSendMesssageType]
}

export interface SocketItem {
  key: MockKey
  socketType: SocketType
  running: boolean
  logs: string[]
}

export class SocketManager extends EventEmitter<SocketManagerEventMap> {
  private readonly serverMap = new Map<MockKey, MockServer>()
  private readonly clientMap = new Map<MockKey, MockClient>()
  private readonly store = new SocketStore()
  private readonly logger = log.scope(this.constructor.name)

  /** 检查端口或管道是否被占用 */
  checkServer(options: Required<Pick<ListenOptions, 'port'>> | Required<Pick<ListenOptions, 'path'>>) {
    return new Promise<Error | void>((resolve) => {
      const server = createServer()
      server.listen(options, () => {
        server.close()
        resolve()
      })
      server.on('error', (err) => {
        server.close()
        resolve(err)
      })
    })
  }

  createServer(name: MockKey<'server'>) {
    const server = createMockServer(name)
    this.serverMap.set(name, server)
    this.store.addServer(name)
    const eventNames: (keyof MockServerEventMap)[] = [
      'close',
      'error',
      'listening',
      'connect',
      'disconnect',
      'message',
    ]
    const sub = merge(...eventNames.map(eventName => fromEvent<ServerMessageType>(server, eventName, (...args) => ({
      name,
      type: `server:${eventName}`,
      args: args as any,
    })))).subscribe((data) => {
      this.store.addLog(name, data.type, data.args)
      this.emit(data.type, data as any)
      this.emit('message', data)
    })
    server.once('close', () => {
      this.logger.debug('on close', name)
      setImmediate(() => {
        this.closeServer(name)
        sub.unsubscribe()
      })
    })
  }

  createClient(name: MockKey<'client'>) {
    this.logger.debug('createClient', name)
    const client = createMockClient(name)
    this.clientMap.set(name, client)
    this.store.addClient(name)
    const eventNames: (keyof MockClientEventMap)[] = [
      'connect',
      'disconnect',
      'error',
      'message',
    ]

    const sub = merge(...eventNames.map(eventName => fromEvent<ClientMessageType>(client, eventName, (...args) => ({
      name,
      type: `client:${eventName}`,
      args: args as any,
    })))).subscribe((data) => {
      this.store.addLog(name, data.type, data.args)
      this.emit(data.type, data as any)
      this.emit('message', data)
    })

    client.once('disconnect', () => {
      setImmediate(() => {
        this.closeClient(name)
        sub.unsubscribe()
      })
    })
  }

  getServerItems(socketType?: SocketType): SocketItem[] {
    const runningKeys = new Set(this.serverMap.keys())
    const items = Array.from(this.store.serverMap, ([key, item]) => ({
      ...item,
      ...normalizeMockKey(key),
      running: runningKeys.has(key),
    }))
    if (socketType) {
      return items.filter(item => item.socketType === socketType)
    }
    return items
  }

  getClientItems(socketType?: SocketType): SocketItem[] {
    const runningKeys = new Set(this.clientMap.keys())
    const items = Array.from(this.store.clientMap, ([key, item]) => ({
      ...item,
      ...normalizeMockKey(key),
      running: runningKeys.has(key),
    }))
    if (socketType) {
      return items.filter(item => item.socketType === socketType)
    }
    return items
  }

  closeServer(name: MockKey<'server'>) {
    const server = this.serverMap.get(name)
    if (server) {
      this.logger.debug('closeServer', name)
      server[Symbol.dispose]()
      this.serverMap.delete(name)
    }
  }

  closeClient(name: MockKey<'client'>) {
    const client = this.clientMap.get(name)
    if (client) {
      client[Symbol.dispose]()
      this.clientMap.delete(name)
    }
  }

  /** client -> server */
  send2server(name: MockKey<'client'>, data: any) {
    this.clientMap.get(name)?.send(data)
  }

  /** server -> client */
  send2client(name: MockKey<'server'>, id: string, message: string) {
    this.serverMap.get(name)?.send(id, message)
    this.serverMap.get(name)?.broadcast(message)
  }

  /** server -> all client */
  broadcast2client(name: MockKey<'server'>, message: string) {
    this.serverMap.get(name)?.broadcast(message)
  }

  [Symbol.dispose]() {
    this.serverMap.forEach(server => server[Symbol.dispose]())
    this.clientMap.forEach(client => client[Symbol.dispose]())
  }
}
