import React from 'react'
import { createHashRouter, RouteObject } from 'react-router-dom'

// export const routerObjects: RouteObject[] = [
//   {
//     path: '/',
//     Component: ,
//   },
// ]

// export function createRouter(): ReturnType<typeof createHashRouter> {
//   const routeWrappers = routerObjects.map((router) => {
//     // @ts-ignore TODO: better type support
//     const getLayout = router.Component?.getLayout || getDefaultLayout
//     const Component = router.Component!
//     const page = getLayout(<Component />)
//     return {
//       ...router,
//       element: page,
//       Component: null,
//       ErrorBoundary: ErrorPage,
//     }
//   })
//   return createHashRouter(routeWrappers)
// }
