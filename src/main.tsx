import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from 'react-router'
import { Layout } from './components/layout'
import routes from './routes'
import { useSocketStore } from './store'
import './index.css'

const router = createBrowserRouter([{
  path: '/',
  element: (
    <Layout>
      <Outlet />
    </Layout>
  ),
  children: [
    {
      index: true,
      element: <Navigate replace to="/server/list" />,
    },
    ...routes,
  ],
}])



async function setup() {
  const socketStore = useSocketStore.getState()
  await Promise.all([socketStore.updateServerItems(), socketStore.updateClientItems()])
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
  postMessage({ payload: 'removeLoading' }, '*')
}

setup()
