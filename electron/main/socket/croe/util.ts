import type { IncomingMessage } from 'node:http'
import type { MockKey, MockType, SocketType } from './type'

export function normalizeMockKey<T extends MockType>(mockKey: MockKey<T>) {
  const chunks = mockKey.split(':')
  const mockType = chunks[0] as T
  const socketType = chunks[1] as SocketType
  const name = chunks.slice(2).join(':')
  return { mockType, socketType, name }
}

export function any2string(value: any) {
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return value.toString()
}

export function incomingMessage2string(message: IncomingMessage): string {
  return message.headers['content-length'] ? message.read().toString('utf-8') : ''
}
