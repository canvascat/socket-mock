import type { LucideIcon } from 'lucide-react'
import type { NonIndexRouteObject } from 'react-router'
import {
  Database,
  Laptop,
  Server,
  Workflow,
} from 'lucide-react'
import { SocketClientDetail, SocketClientList, SocketServerList } from '@/pages'
import Demo from './demo'

export interface IRouteObject extends NonIndexRouteObject {
  title?: string
  icon?: LucideIcon
  children?: IRouteObject[]
  hideInSidebar?: boolean
}

const routes: IRouteObject[] = [
  {
    title: 'Server',
    icon: Server,
    children: [
      {
        title: 'List',
        path: '/server/list',
        element: <SocketServerList />,
      },
      {
        title: 'Detail',
        path: '/server/:id',
        element: <Demo title="Detail" description="Detail" />,
        hideInSidebar: true,
      },
    ],
  },
  {
    title: 'Client',
    icon: Laptop,
    children: [
      {
        title: 'List',
        path: '/client/list',
        element: <SocketClientList />,
      },
      {
        title: 'Detail',
        path: '/client/:id',
        element: <SocketClientDetail />,
        hideInSidebar: true,
      },
    ],
  },
  {
    title: 'Data',
    icon: Database,
    children: [
      {
        title: 'List',
        path: '/data/list',
        element: <Demo title="List" description="List" />,
      },
      {
        title: 'Detail',
        path: '/data/:id',
        element: <Demo title="Detail" description="Detail" />,
        hideInSidebar: true,
      },
    ],
  },
  {
    title: 'flow',
    icon: Workflow,
    children: [
      {
        title: 'flow',
        path: '/flow',
        element: <Demo title="flow" description="flow" />,
      },
    ],
  },
]

export default routes
