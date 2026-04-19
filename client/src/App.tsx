import React, { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from 'react-router-dom'
import { createRouter } from './router'
import { AuthProvider } from './context'

export default function App() {
  const queryClient = useMemo(() => new QueryClient({}), [])
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={createRouter()} />
        <ReactQueryDevtools />
      </QueryClientProvider>
    </AuthProvider>
  )
}
