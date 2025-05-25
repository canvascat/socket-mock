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
  /** 客户端发送消息 */
  message: [id: string, message: string]
  send: [id: string, message: string]
}

export interface MockClientEventMap {
  /** 客户端连接成功 */
  connect: []
  /** 客户端关闭 */
  disconnect: []
  /** 客户端连接失败 */
  error: [Error]
  /** 客户端发送消息 */
  message: [message: string]
  send: [message: string]
}

export type SocketType = 'socket' | 'websocket'

export type MockType = 'server' | 'client'

export type MockKey<T extends MockType = MockType> = `${T}:${SocketType}:${string}`
