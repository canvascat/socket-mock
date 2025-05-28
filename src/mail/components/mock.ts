import {
  AlertCircle,
  Archive,
  ArchiveX,
  File,
  Inbox,
  MessagesSquare,
  Send,
  ShoppingCart,
  Trash2,
  Users2,
} from 'lucide-react'

export const links = [
  {
    title: 'Inbox',
    icon: Inbox,
    variant: 'default',
  },
  {
    title: 'Drafts',
    icon: File,
    variant: 'ghost',
  },
  {
    title: 'Sent',
    icon: Send,
    variant: 'ghost',
  },
  {
    title: 'Junk',
    icon: ArchiveX,
    variant: 'ghost',
  },
  {
    title: 'Trash',
    icon: Trash2,
    variant: 'ghost',
  },
  {
    title: 'Archive',
    icon: Archive,
    variant: 'ghost',
  },

  {
    title: 'Social',
    label: '972',
    icon: Users2,
    variant: 'ghost',
  },
  {
    title: 'Updates',
    label: '342',
    icon: AlertCircle,
    variant: 'ghost',
  },
  {
    title: 'Forums',
    label: '128',
    icon: MessagesSquare,
    variant: 'ghost',
  },
  {
    title: 'Shopping',
    label: '8',
    icon: ShoppingCart,
    variant: 'ghost',
  },
  {
    title: 'Promotions',
    label: '21',
    icon: Archive,
    variant: 'ghost',
  },
]
