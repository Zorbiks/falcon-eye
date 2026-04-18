import { createHashRouter, RouteObject } from 'react-router-dom'
import Layout from 'src/layout'
import Home from 'src/components/pages/Home'
import ErrorPage from 'src/components/pages/ErrorPage'

export const routerObjects: RouteObject[] = [
  {
    path: '/',
    Component: Home,
  },
]

export function createRouter(): ReturnType<typeof createHashRouter> {
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
  return createHashRouter(routeWrappers)
}
