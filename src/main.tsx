import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  // Navigate,
  // Outlet,
  RouterProvider,
} from 'react-router'
// import { Layout } from './components/layout'
import MailPage from './mail/page'
// import routes from './routes'
import './index.css'

const router = createBrowserRouter([{
  path: '/',
  element: <MailPage />,
  // element: (
  //   <Layout>
  //     <Outlet />
  //   </Layout>
  // ),
  // children: [
  //   {
  //     index: true,
  //     element: <Navigate replace to="/server/list" />,
  //   },
  //   ...routes,
  // ],
}])

async function setup() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
  postMessage({ payload: 'removeLoading' }, '*')
}

setup()
