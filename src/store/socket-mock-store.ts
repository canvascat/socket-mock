import type { MockKey } from '@main/socket/core/type'
import type { SocketMockItem } from '@/types'
import { normalizeMockKey } from '@main/socket/core/util'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { persistStorage } from './persist-storage'

interface SocketMockStore {
  items: SocketMockItem[]
  add: (mockKey: MockKey) => void
}

export const useSocketMockStore = create<SocketMockStore>()(persist(
  set => ({
    items: [],
    add: mockKey => set(({ items }) => {
      if (items.some(item => item.mockKey === mockKey))
        return { items }
      const { socketType, mockType } = normalizeMockKey(mockKey)
      items = [{ mockKey, socketType, mockType, running: false, messages: [] }, ...items]
      return { items }
    }),
  }),
  {
    name: 'socketmock',
    storage: createJSONStorage(() => persistStorage),
  },
))
