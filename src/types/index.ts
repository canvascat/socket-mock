import type { ClientMessageType, IPCSendMesssageType, ServerMessageType } from '@main/socket'
import type { MockKey, MockType, SocketType } from '@main/socket/core/type'
import type { Schema } from 'json-schema-faker'

export interface SocketMockMessageBase {
  name: string
  description?: string
  schemaType: 'json-schema' | 'string'
  schema: Schema
}

export interface SocketMockMessageItem extends SocketMockMessageBase {
  id: string
  mockData: any // Generated mock data
}

export interface SocketMockItem {
  mockKey: MockKey
  socketType: SocketType
  mockType: MockType
  running?: boolean
  messages: MessageEntry<IPCSendMesssageType>[]
}

export interface SocketMockServerItem {
  mockKey: MockKey<'server'>
  socketType: SocketType
  mockType: 'server'
  running?: boolean
  messages: MessageEntry<ServerMessageType>[]
}

export interface SocketMockSClientItem {
  mockKey: MockKey<'client'>
  socketType: SocketType
  mockType: 'client'
  running?: boolean
  messages: MessageEntry<ClientMessageType>[]
}

export interface MessageEntry<T> {
  id: string
  timestamp: Date
  detail: T
}
