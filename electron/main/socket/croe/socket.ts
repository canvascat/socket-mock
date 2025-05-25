import net from 'node:net'
import { MockClient, MockServer } from './common'
import { any2string } from './util'

class SocketMockClient extends MockClient {
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
    this.client.write(message)
  }
}

export function createMockClient(path: string) {
  return new SocketMockClient(path)
}

class SocketMockServer extends MockServer {
  private server: net.Server
  private clients = new Map<string, net.Socket>()

  constructor(path: string) {
    super()
    this.server = net.createServer(this.onConnection)
    this.server.listen({
      path,
      exclusive: false,
    }, () => {
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

  private onConnection(socket: net.Socket) {
    console.debug('server 客户端已连接', socket.address())

    const id = socket.remotePort?.toString() ?? ''
    this.clients.set(id, socket)
    this.emit('connect', id)

    socket.on('data', (data) => {
      this.emit('message', id, data.toString())
    })
    socket.once('close', () => {
      console.debug('客户端断开连接')
      this.clients.delete(id)
      this.emit('disconnect', id)
    })
    socket.once('error', (err) => {
      console.error('连接错误:', err)
      socket.destroy()
    })
  }

  close() {
    this.server.close()
  }

  send(id: string, message: string) {
    this.clients.get(id)?.write(message)
  }

  broadcast(message: string) {
    this.clients.forEach(socket => socket.write(message))
  }
}

export function createMockServer(path: string) {
  return new SocketMockServer(path)
}
// const closeServer = setup()

// // 进程退出前，关闭服务器后再退出
// process.on('beforeExit', async () => {
//   console.debug('进程退出前，关闭服务器')
//   await closeServer()
//   process.exit(0)
// })
