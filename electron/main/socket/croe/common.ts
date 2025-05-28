import type { MockClientEventMap, MockServerEventMap, SocketType } from './type'
import EventEmitter from 'node:events'
import log from 'electron-log/main'

export abstract class MockServer extends EventEmitter<MockServerEventMap> {
  protected logger = log.scope(this.constructor.name)
  /** 关闭服务器 */
  abstract close(): void
  /** 广播消息 */
  abstract broadcast(message: string): void;

  [Symbol.dispose]() {
    this.logger.debug('dispose')
    this.close()
  }
}

export abstract class MockClient extends EventEmitter<MockClientEventMap> {
  protected logger = log.scope(this.constructor.name)
  /** 关闭客户端 */
  abstract close(): void
  /** 发送消息 */
  abstract send(message: string): void;

  [Symbol.dispose]() {
    this.logger.debug('dispose')
    this.close()
  }
}

export interface SocketMockModule {
  /** socket类型 */
  socketType: SocketType
  /** socket类型名称 */
  socketTypeName: string
  /** 创建客户端 */
  createMockClient: (path: string) => MockClient
  /** 创建服务器 */
  createMockServer: (path: string) => MockServer
}
