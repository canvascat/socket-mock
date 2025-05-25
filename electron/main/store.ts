import type { Schema } from 'electron-store'
import type { SocketItem } from './socket/manager'
import { app } from 'electron'
import Store from 'electron-store'

const socketSchema = {
  type: 'object',
  properties: {
    clientItems: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string' },
          logs: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    serverItems: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string' },
          logs: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
} satisfies Schema<Record<string, any>>['socket']

const socketDefaults = {
  clientItems: [] as Pick<SocketItem, 'key' | 'logs'>[],
  serverItems: [] as Pick<SocketItem, 'key' | 'logs'>[],
}

const schema = {
  socket: socketSchema,
} as const

const defaults = {
  socket: socketDefaults,
}

console.debug(app.getPath('userData'))

export const store = new Store<typeof defaults>({ schema, defaults })
