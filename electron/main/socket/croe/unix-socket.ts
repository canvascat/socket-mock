import net from 'node:net'
import process from 'node:process'
import { MockClient, MockServer } from './common'

/**
 * Unix Domain Socket
 * unix-domain-socket://path/to/socket
 * only support unix
 */
class UnixSocketMockClient extends MockClient {
  private client: net.Socket

  constructor(path: string) {
    super()
    this.client = net.createConnection({ path })
    this.client.once('connect', () => {
      this.emit('connect')
    }).on('data', (data) => {
      this.resolver.output(data, content => this.emit('message', content))
    }).once('close', () => {
      this.emit('disconnect')
    }).once('error', (err) => {
      this.emit('error', err)
      this.client.destroy()
    })
  }

  close() {
    this.client.destroy()
  }

  send(message: string) {
    this.emit('send', message)
    message = this.resolver.input(message)
    this.client.write(message)
  }
}

class UnixSocketMockServer extends MockServer {
  private server: net.Server
  private clients = new Set<net.Socket>()
  private id = 0

  constructor(path: string) {
    super()
    this.server = net.createServer(client => this.onConnection(client))
    this.server.listen(path, () => {
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

  private onConnection(client: net.Socket) {
    const id = `${this.id++}`
    this.logger.debug(`客户端${id}已连接`)
    this.clients.add(client)
    this.emit('connect', id)

    client.on('data', (data) => {
      this.resolver.output(data, content => this.emit('message', id, content))
    }).once('close', () => {
      this.logger.debug('客户端断开连接')
      this.clients.delete(client)
      this.emit('disconnect', id)
    }).once('error', (err) => {
      this.logger.error('连接错误:', err)
      client.destroy()
    })
  }

  close() {
    this.server.close()
    this.clients.forEach(client => client.destroy())
    this.clients.clear()
  }

  broadcast(message: string) {
    this.emit('broadcast', message)
    message = this.resolver.input(message)
    this.clients.forEach(client => client.write(message))
  }
}

export const socketType = 'unix' as const
export const socketTypeName = 'unix域套接字' as const

export function createMockClient(path: string) {
  return new UnixSocketMockClient(path)
}

export function createMockServer(path: string) {
  return new UnixSocketMockServer(path)
}

export const isSupport = process.platform === 'linux' || process.platform === 'darwin'
