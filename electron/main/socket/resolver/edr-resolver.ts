import { Buffer } from 'node:buffer'
import { safeJsonParse } from '../util'
import { MessageResolver } from './message-resolver'

interface RequestParams {
  id?: string
  /** 消息标识 */
  action: string
  /** 消息数据 */
  data?: any
}

export class EDRResolver extends MessageResolver {
  output = (chunk: Buffer<ArrayBufferLike>, callback: (content: string) => void) => {
    let buffer = chunk
    while (buffer.length > 12) {
      if (buffer.toString('utf8', 0, 8) !== 'IPC__MSG') {
        this.logger.error(`invalid magic, buffer content: ${buffer.toString('utf8', 0, 8)}`)
        break
      }

      const msg_len = buffer.readUInt32LE(8)
      if (buffer.length < 12 + msg_len) {
        this.logger.error(`invalid msg len, msg_len content: ${msg_len}`)
        break
      }

      const msgStr = buffer.slice(12, 12 + msg_len).toString()
      this.logger.info(msgStr, 'RECEIVE')
      let msg: RequestParams = safeJsonParse(msgStr)
      msg = { ...msg, data: safeJsonParse(msg.data) }
      callback(JSON.stringify(msg))
      buffer = buffer.slice(12 + msg_len)
    }
  }

  input = (params: string) => {
    const { id, action, data } = JSON.parse(params) as RequestParams
    const req = { action, data: typeof data === 'string' ? data : JSON.stringify(data ?? {}), id: id ?? '' }

    // 1. 拼装参数
    const paramsStr = JSON.stringify(req)
    const header = Buffer.from('IPC__MSG', 'utf8')

    // 2. 创建 4 字节的 Buffer 来存储 req 的长度（小端字节序）
    const lengthBuffer = Buffer.alloc(4)
    lengthBuffer.writeUInt32LE(Buffer.byteLength(paramsStr, 'utf8'))

    // 3. 创建 Buffer 来存储 req 的内容
    const contentBuffer = Buffer.from(paramsStr, 'utf8')

    // 4. 拼接所有部分
    const messageBuffer = Buffer.concat([header, lengthBuffer, contentBuffer])
    this.logger.info(`${messageBuffer.toString()}`, 'WRITE')
    return messageBuffer
  }
}
