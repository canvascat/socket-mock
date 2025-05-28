import type { IMail } from '@/mail/data'

import { create } from 'zustand'
import { mails } from '@/mail/data'

interface Config {
  selected: IMail['id'] | null
  setSelected: (id: IMail['id']) => void
}

export const useMailStore = create<Config>(set => ({
  selected: mails[0].id,
  setSelected: id => set({ selected: id }),
}))
