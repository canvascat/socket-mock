import type { SocketItem } from '@main/socket/manager'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createStore } from 'zustand/vanilla'

export interface SocketStore {
  items: SocketItem[]
  addItem: (item: SocketItem) => Promise<void>
  removeItem: (key: SocketItem['key']) => Promise<void>
  updateItem: (key: SocketItem['key'], payload: Partial<Pick<SocketItem, 'running'>>) => Promise<void>
  addItemLogs: (key: SocketItem['key'], ...logs: SocketItem['logs']) => Promise<void>
  search: (filters: Partial<Pick<SocketItem, 'running' | 'socketType' | 'mockType'>>) => SocketItem[]
}

export const socketStore = createStore<SocketStore>()(
  subscribeWithSelector(immer(set => ({
    items: [],
    addItem: async (item: SocketItem) => {
      set((state) => {
        state.items.push(item)
      })
    },
    removeItem: async (key: SocketItem['key']) => {
      set((state) => {
        state.items = state.items.filter(item => item.key !== key)
      })
    },
    updateItem: async (key: SocketItem['key'], payload: Partial<Pick<SocketItem, 'running'>>) => {
      set((state) => {
        const item = state.items.find(item => item.key === key)
        if (!item)
          return
        Object.assign(item, payload)
      })
    },
    addItemLogs: async (key: SocketItem['key'], ...logs: SocketItem['logs']) => {
      set((state) => {
        const item = state.items.find(item => item.key === key)
        if (!item)
          return
        item.logs.push(...logs)
      })
    },
    search: (filters: Partial<Pick<SocketItem, 'running' | 'socketType' | 'mockType'>>) => {
      return state.items.filter((item) => {
        return Object.entries(filters).every(([key, value]) => {
          return item[key as keyof SocketItem] === value
        })
      })
    },
  }))),
)
