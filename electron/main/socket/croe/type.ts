import type * as socket from './socket'
import type * as websocket from './websocket'

export interface MockServerEventMap {
  /** 服务器关闭 */
  close: [address: string]
  /** 服务器错误 */
  error: [Error]
  /** 服务器监听 */
  listening: [address: string]
  /** 客户端连接 */
  connect: [id: string]
  /** 客户端断开连接 */
  disconnect: [id: string]
  /** 收到客户端发送消息 */
  message: [id: string, message: string]
  /** 广播消息到所有客户端 */
  broadcast: [message: string]
}

export interface MockClientEventMap {
  /** 客户端连接成功 */
  connect: []
  /** 客户端关闭 */
  disconnect: []
  /** 客户端连接失败 */
  error: [Error]
  /** 收到服务端发送消息 */
  message: [message: string]
  /** 发送消息到服务器 */
  send: [message: string]
}

export type SocketType = typeof socket.socketType | typeof websocket.socketType

export type MockType = 'server' | 'client'

export type MockKey<T extends MockType = MockType> = `${T}:${SocketType}:${string}`
