import type { MockKey, MockType, SocketType } from './type'

export function normalizeMockKey<T extends MockType>(mockKey: MockKey<T>) {
  const chunks = mockKey.split(':')
  const mockType = chunks[0] as T
  const socketType = chunks[1] as SocketType
  const name = chunks.slice(2).join(':')
  return { mockType, socketType, name }
}

export function safeJsonParse(str: string): any {
  try {
    return JSON.parse(str)
  }
  catch {
    return void 0
  }
}
