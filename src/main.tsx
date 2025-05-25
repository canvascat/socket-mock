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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

async function setup() {
  const socketStore = useSocketStore.getState()
  await Promise.all([socketStore.updateServerItems(), socketStore.updateClientItems()])
  postMessage({ payload: 'removeLoading' }, '*')
}

setup()
