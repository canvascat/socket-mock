import type { Buffer } from 'node:buffer'
import { MessageResolver } from './message-resolver'

export class DefaultResolver extends MessageResolver {
  output = (buffer: Buffer<ArrayBufferLike>, callback: (content: string) => void) => {
    callback(buffer.toString())
  }

  input = (content: string): any => content
}
