import { createBrowserRouter, RouteObject } from 'react-router-dom'
import Layout from 'src/layout'
import Home from 'src/components/pages/Home'
import ErrorPage from 'src/components/pages/ErrorPage'
import Login from 'src/components/pages/login'
import Signup from 'src/components/pages/signup'

export const routerObjects: RouteObject[] = [
  {
    path: '/',
    Component: Login,
  },
  {
    path: '/home',
    Component: Home,
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/signup',
    Component: Signup,
  },
]

export function createRouter(): ReturnType<typeof createBrowserRouter> {
  const routeWrappers = routerObjects.map((router) => {
    const Component = router.Component!
    const page = Layout(<Component />)
    return {
      ...router,
      element: page,
      Component: null,
      ErrorBoundary: ErrorPage,
    }
  })
  return createBrowserRouter(routeWrappers)
}
