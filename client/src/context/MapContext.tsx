'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchAllEvents } from '../services/eventService'
import type { AcledEvent } from '../types/events'
import mockData from 'src/data/mock.json'

type MapContextValue = {
  events: AcledEvent[]
  isLoading: boolean
  error: string | null
  country: string | null
  setCountry: (country: string | null) => void
  refetchEvents: () => Promise<void>
}

const MapContext = createContext<MapContextValue | undefined>(undefined)

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const [events, setEvents] = useState<AcledEvent[]>(mockData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [country, setCountry] = useState<string | null>(null)

  const refetchEvents = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetchAllEvents(country ?? undefined)
      setEvents(response)
    } catch (fetchError) {
      console.error('Failed to fetch map events:', fetchError)
      setError('Failed to fetch map events.')
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }, [country])

  useEffect(() => {
    void refetchEvents()
  }, [refetchEvents])

  const value = useMemo(
    () => ({
      events,
      isLoading,
      error,
      country,
      setCountry,
      refetchEvents,
    }),
    [country, error, events, isLoading, refetchEvents],
  )

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>
}

export const useMapData = () => {
  const context = useContext(MapContext)

  if (!context) {
    throw new Error('useMapData must be used within a MapProvider')
  }

  return context
}
