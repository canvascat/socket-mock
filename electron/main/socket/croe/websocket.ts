import WebSocket, { WebSocketServer } from 'ws'
import { MockClient, MockServer } from './common'
import { any2string } from './util'

class WebSocketMockServer extends MockServer {
  private server: WebSocketServer
  private clients = new Map<string, WebSocket>()

  constructor(port: number) {
    super()
    this.server = new WebSocketServer({ port })

    this.server.on('connection', (client) => {
      this.onConnection(client)
    }).once('listening', () => {
      this.logger.debug('on listening', this.server.address())
      this.emit('listening', any2string(this.server.address()))
    }).once('close', () => {
      this.logger.debug('on close')
      this.emit('close', any2string(this.server.address()))
    }).once('error', (error) => {
      this.logger.debug('on error', error)
      this.emit('error', error)
    })
  }

  private onConnection(client: WebSocket) {
    this.clients.set(client.url, client)
    this.emit('connect', client.url)

    client.on('message', (message) => {
      this.emit('message', client.url, message.toString('utf-8'))
    }).once('close', () => {
      console.debug('Mock server is disconnected')
      this.clients.delete(client.url)
      this.emit('disconnect', client.url)
    })
  }

  close() {
    this.logger.debug('invoke close')
    this.server.close()
    this.clients.forEach(ws => ws.close())
  }

  send(id: string, message: string) {
    this.clients.get(id)?.send(message)
    this.emit('send', id, message)
  }

  broadcast(message: string) {
    this.clients.forEach(ws => ws.send(message))
  }
}

export function createMockServer(port: number | string) {
  return new WebSocketMockServer(+(port))
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

export function createMockClient(url: string) {
  return new WebSocketMockClient(url)
}
