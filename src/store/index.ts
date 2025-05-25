import type { SocketItem } from '@main/socket/manager'
import { normalizeMockKey } from '@main/socket/croe/util'
import { create } from 'zustand'
import { ipc } from '@/lib/electron'

interface SocketStore {
  clientItems: SocketItem[]
  serverItems: SocketItem[]
  updateClientItems: () => Promise<void>
  updateServerItems: () => Promise<void>
}

export const useSocketStore = create<SocketStore>(set => ({
  clientItems: [],
  serverItems: [],
  updateClientItems: async () => {
    const clientItems = await ipc.invoke.getClientItems()
    console.debug('updateClientItems', clientItems)
    set({ clientItems })
  },
  updateServerItems: async () => {
    const serverItems = await ipc.invoke.getServerItems()
    console.debug('updateServerItems', serverItems)
    set({ serverItems })
  },
}))

ipc.subscribe((message) => {
  console.debug(message)
  const { name, type, args } = message
  const { mockType } = normalizeMockKey(name)
  const key = mockType === 'client' ? 'clientItems' : 'serverItems'
  const items = useSocketStore.getState()[key]
  const index = items.findIndex(item => item.key === name)
  if (index === -1)
    return
  const logs = [...items[index].logs, name, type, ...args.filter(Boolean).map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg.toString())]
  items[index] = { ...items[index], logs }
  useSocketStore.setState(() => ({
    [key]: items,
  }))
})
