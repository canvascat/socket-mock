import type { Mail } from '@/mail/data'

import { create } from 'zustand'
import { mails } from '@/mail/data'

interface Config {
  selected: Mail['id'] | null
  setSelected: (id: Mail['id']) => void
}

export const useMailStore = create<Config>(set => ({
  selected: mails[0].id,
  setSelected: id => set({ selected: id }),
}))
