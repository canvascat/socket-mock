import type { SocketMockMessageBase, SocketMockMessageItem } from '@/types'
import Store from 'electron-store'
import { JSONSchemaFaker } from 'json-schema-faker'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { persistStorage } from './persist-storage'

const store = new Store<{ templates: SocketMockMessageItem[] }>()

interface MessageTemplateStore {
  templates: SocketMockMessageItem[]
  addTemplate: (template: SocketMockMessageBase) => void
  updateTemplate: (id: string, template: Partial<SocketMockMessageItem>) => void
  deleteTemplate: (id: string) => void
  updateAll: (payload: SocketMockMessageBase[]) => void
}

function generateIPCMockMessage({ schemaType, schema, ...rest }: SocketMockMessageBase): SocketMockMessageItem {
  const mockData = schemaType === 'json-schema' ? JSONSchemaFaker.generate(schema) : schema
  return { schemaType, schema, ...rest, mockData, id: crypto.randomUUID() }
}

export const useMessageTemplateStore = create<MessageTemplateStore>()(persist(set => ({
  templates: store.get('templates') || [],
  addTemplate: payload => set(state => ({ templates: [...state.templates, generateIPCMockMessage(payload)] })),
  updateTemplate: (id, payload) => set(state => ({ templates: state.templates.map(t => t.id === id ? { ...t, ...payload } : t) })),
  deleteTemplate: id => set(state => ({ templates: state.templates.filter(t => t.id !== id) })),
  updateAll: payload => set(({ templates: payload.map(generateIPCMockMessage) })),
}), {
  name: 'messageTemplate',
  storage: createJSONStorage(() => persistStorage),
}))
