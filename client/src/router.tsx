import { createBrowserRouter, RouteObject } from 'react-router-dom'
import Layout from 'src/layout'
import Home from 'src/components/pages/Home'
import ErrorPage from 'src/components/pages/ErrorPage'
import Login from 'src/components/pages/login'
import Signup from 'src/components/pages/signup'

type AppRouteObject = RouteObject & {
  useLayout?: boolean
}

export const routerObjects: AppRouteObject[] = [
  {
    path: '/',
    Component: Login,
    useLayout: false,
  },
  {
    path: '/home',
    Component: Home,
    useLayout: true,
  },
  {
    path: '/login',
    Component: Login,
    useLayout: false,
  },
  {
    path: '/signup',
    Component: Signup,
    useLayout: false,
  },
]

export function createRouter(): ReturnType<typeof createBrowserRouter> {
  const routeWrappers = routerObjects.map((router) => {
    const Component = router.Component!
    const page = router.useLayout ? Layout(<Component />) : <Component />
    return {
      ...router,
      element: page,
      Component: null,
      ErrorBoundary: ErrorPage,
    }
  })
  return createBrowserRouter(routeWrappers)
}
