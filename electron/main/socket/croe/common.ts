import type { MockClientEventMap, MockServerEventMap } from './type'
import EventEmitter from 'node:events'
import log from 'electron-log/main'
import process from 'node:process'

// windows 命名管道
// export const PIPE_NAME =  '//./pipe/agent_cli';

export const PIPE_NAME = process.platform === 'win32' ? '\\\\.\\pipe\\agent_cli' : '\0agent_cli'

export abstract class MockServer extends EventEmitter<MockServerEventMap> {
  protected logger = log.scope(this.constructor.name)
  /** 关闭服务器 */
  abstract close(): void
  /** 发送消息 */
  abstract send(id: string, message: string): void
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
