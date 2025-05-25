import type { MockKey } from './croe/type'
import type { SocketItem } from './manager'
import { EventEmitter } from 'node:events'
import log from 'electron-log/main'
import { store } from '../store'
import { normalizeMockKey } from './croe/util'

type SocketStoreItem = Pick<SocketItem, 'key' | 'logs'>

export class SocketStore extends EventEmitter {
  private readonly logger = log.scope(this.constructor.name)
  clientMap = new Map<MockKey, SocketStoreItem>()
  serverMap = new Map<MockKey, SocketStoreItem>()

  constructor() {
    super()
    const { clientItems, serverItems } = store.get('socket')
    this.clientMap = new Map(clientItems.map(item => [item.key, item]))
    this.serverMap = new Map(serverItems.map(item => [item.key, item]))
  }

  /** 更新数据到store */
  private updateStore() {
    const clientItems = Array.from(this.clientMap.values(), ({ key, logs }) => ({ key, logs }))
    const serverItems = Array.from(this.serverMap.values(), ({ key, logs }) => ({ key, logs }))
    store.set('socket', {
      clientItems,
      serverItems,
    })
  }

  addClient(item: Pick<SocketItem, 'key' | 'logs'> | SocketItem['key']) {
    if (typeof item === 'string') {
      item = {
        key: item,
        logs: [],
      }
    }
    if (this.clientMap.has(item.key)) {
      return
    }
    this.clientMap.set(item.key, item)
    this.updateStore()
  }

  addServer(item: Pick<SocketItem, 'key' | 'logs'> | SocketItem['key']) {
    if (typeof item === 'string') {
      item = {
        key: item,
        logs: [],
      }
    }
    if (this.serverMap.has(item.key)) {
      return
    }
    this.serverMap.set(item.key, item)
    this.updateStore()
  }

  removeClient(key: MockKey) {
    if (!this.clientMap.has(key)) {
      return
    }
    this.clientMap.delete(key)
    this.updateStore()
  }

  removeServer(key: MockKey) {
    if (!this.serverMap.has(key)) {
      return
    }
    this.serverMap.delete(key)
    this.updateStore()
  }

  addLog(key: MockKey, type: string, args: any[]) {
    const { mockType } = normalizeMockKey(key)
    const item = mockType === 'client' ? this.clientMap.get(key) : this.serverMap.get(key)
    if (item) {
      item.logs.push(key, type, ...args.filter(Boolean).map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg.toString()))
      this.updateStore()
    }
    else {
      this.logger.error('not found item', key, type, args)
    }
  }
}
