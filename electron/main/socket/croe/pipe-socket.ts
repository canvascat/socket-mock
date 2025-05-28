import net from 'node:net'
import { MockClient, MockServer } from './common'

/**
 * 管道客户端
 * pipe://\\.\pipe\agent_cli
 * only support windows
 */
class PipeSocketMockClient extends MockClient {
  private client: net.Socket

  constructor(path: string) {
    super()
    this.client = net.createConnection({ path })
    this.client.once('connect', () => {
      this.emit('connect')
    }).on('data', (data) => {
      this.emit('message', data.toString())
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
    this.client.write(message)
  }
}

class PipeSocketMockServer extends MockServer {
  private server: net.Server
  private clients = new Set<net.Socket>()
  private id = 0

  constructor(path: string) {
    super()
    this.server = net.createServer(client => this.onConnection(client))
    this.server.listen({
      path,
      exclusive: false,
    }, () => {
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
      this.emit('message', id, data.toString())
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
    this.clients.forEach(client => client.write(message))
  }
}

export const socketType = 'NamedPipes' as const
export const socketTypeName = '命名管道（仅支持Windows）' as const

export function createMockClient(path: string) {
  return new PipeSocketMockClient(path)
}

export function createMockServer(path: string) {
  return new PipeSocketMockServer(path)
}
