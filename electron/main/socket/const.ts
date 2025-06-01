import type { MockClientEventMap, MockServerEventMap } from './type'

export const SOCKET_SERVER_EVENT_NAMES = [
  'close',
  'error',
  'listening',
  'connect',
  'disconnect',
  'message',
  'broadcast',
] as const satisfies (keyof MockServerEventMap)[]

export const SOCKET_CLIENT_EVENT_NAMES = [
  'connect',
  'disconnect',
  'error',
  'message',
  'send',
] as const satisfies (keyof MockClientEventMap)[]
