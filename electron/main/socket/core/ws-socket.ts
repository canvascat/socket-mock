import WebSocket, { WebSocketServer } from 'ws'
import { MockClient, MockServer } from './common'

class WebSocketMockServer extends MockServer {
  private server: WebSocketServer
  private id = 0

  constructor(port: number) {
    super()
    this.server = new WebSocketServer({ port })

    this.server.on('connection', (client) => {
      this.onConnection(client)
    }).once('listening', () => {
      this.logger.debug('on listening', this.server.address())
      this.emit('listening')
    }).once('close', () => {
      this.logger.debug('on close')
      this.emit('close')
    }).once('error', (error) => {
      this.logger.debug('on error', error)
      this.emit('error', error)
    })
  }

  private onConnection(client: WebSocket) {
    const id = `${this.id++}`
    this.logger.debug(`客户端${id}已连接`, client.url)
    this.emit('connect', id)
    client.on('message', (message) => {
      this.emit('message', id, message.toString('utf-8'))
    }).once('close', () => {
      this.logger.debug('客户端断开连接')
      this.emit('disconnect', id)
    }).once('error', (err) => {
      this.logger.error('连接错误:', err)
      client.close()
    })
  }

  close() {
    this.server.close()
    this.server.clients.forEach(client => client.close())
    this.server.clients.clear()
  }

  broadcast(message: string) {
    this.emit('broadcast', message)
    this.server.clients.forEach(client => client.send(message))
  }
}

class WebSocketMockClient extends MockClient {
  private client: WebSocket

  constructor(url: string) {
    super()
    this.client = new WebSocket(url)
    this.client.on('open', () => {
      this.emit('connect')
    }).on('message', (message) => {
      this.emit('message', message.toString('utf-8'))
    }).once('close', () => {
      this.emit('disconnect')
    }).once('error', (err) => {
      this.close()
      this.emit('error', err)
    })
  }

  close() {
    this.client.close()
  }

  send(message: string) {
    this.client.send(message)
    this.emit('send', message)
  }
}

export const socketType = 'ws' as const
export const socketTypeName = 'WebSocket' as const

export function createMockClient(url: string) {
  return new WebSocketMockClient(url)
}

export function createMockServer(port: number | string) {
  return new WebSocketMockServer(+(port))
}

export const isSupport = true
