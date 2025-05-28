import type { StateStorage } from 'zustand/middleware'
import type { SocketMockMessageItem } from '@/types'
import Store from 'electron-store'

const store = new Store<{ messageTemplate: SocketMockMessageItem[] }>()

export const persistStorage: StateStorage = {
  getItem: name => store.get(name),
  removeItem: name => store.delete(name),
  setItem: (name, value) => store.set(name, value),
}
