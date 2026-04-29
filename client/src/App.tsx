import React, { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from 'react-router-dom'
import { createRouter } from './router'
import { AuthProvider, GlobalProvider } from './context'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

export default function App() {
  const queryClient = useMemo(() => new QueryClient({}), [])
  return (
    <AuthProvider>
      <GlobalProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={createRouter()} />
          <ReactQueryDevtools />
        </QueryClientProvider>
      </GlobalProvider>
    </AuthProvider>
  )
}
