import net from 'node:net'
import { uniqueId } from 'lodash-es'
import { MockClient, MockServer } from './common'

class TCPSocketMockServer extends MockServer {
  private server: net.Server
  private clients = new Set<net.Socket>()

  constructor(port: number) {
    super()
    this.server = net.createServer(client => this.onConnection(client))
    this.server.listen(port, () => {
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
    const id = uniqueId()
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

class TCPSocketMockClient extends MockClient {
  private client: net.Socket

  constructor(port: number) {
    super()
    this.client = net.createConnection({ port })
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

export const socketType = 'tcp' as const
export const socketTypeName = 'TCP' as const

export function createMockClient(port: number | string) {
  return new TCPSocketMockClient(+(port))
}

export function createMockServer(port: number | string) {
  return new TCPSocketMockServer(+(port))
}
