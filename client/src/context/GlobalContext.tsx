'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchAllEvents } from '../services/eventService'
import { fetchNewsFeed } from '../services/feedService'
import type { AcledEvent } from '../types/events'
import type { FeedItem } from '../types/feed'
import mockEventsData from 'src/data/event-mock.json'
import mockFeedData from 'src/data/feed-mock.json'

type GlobalContextValue = {
  events: AcledEvent[]
  isLoading: boolean
  hasEventsLoaded: boolean
  error: string | null
  country: string | null
  setCountry: (country: string | null) => void
  refetchEvents: () => Promise<void>
  feedData: FeedItem[]
  isFeedLoading: boolean
  hasFeedLoaded: boolean
  feedError: string | null
  refetchFeed: () => Promise<void>
}

const GlobalContext = createContext<GlobalContextValue | undefined>(undefined)

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [events, setEvents] = useState<AcledEvent[]>(mockEventsData)
  const [isLoading, setIsLoading] = useState(false)
  const [hasEventsLoaded, setHasEventsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [country, setCountry] = useState<string | null>(null)

  const [feedData, setFeedData] = useState<FeedItem[]>(mockFeedData)
  const [isFeedLoading, setIsFeedLoading] = useState(false)
  const [hasFeedLoaded, setHasFeedLoaded] = useState(false)
  const [feedError, setFeedError] = useState<string | null>(null)

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
      setHasEventsLoaded(true)
    }
  }, [country])

  const refetchFeed = useCallback(async () => {
    setIsFeedLoading(true)
    setFeedError(null)

    try {
      const response = await fetchNewsFeed()
      setFeedData(response)
    } catch (fetchError) {
      console.error('Failed to fetch feed data:', fetchError)
      setFeedError('Failed to fetch feed data.')
      setFeedData([])
    } finally {
      setIsFeedLoading(false)
      setHasFeedLoaded(true)
    }
  }, [])

  useEffect(() => {
    void refetchEvents()
  }, [refetchEvents])

  useEffect(() => {
    void refetchFeed()
  }, [refetchFeed])

  const value = useMemo(
    () => ({
      events,
      isLoading,
      hasEventsLoaded,
      error,
      country,
      setCountry,
      refetchEvents,
      feedData,
      isFeedLoading,
      hasFeedLoaded,
      feedError,
      refetchFeed,
    }),
    [
      country,
      error,
      events,
      feedData,
      feedError,
      hasEventsLoaded,
      hasFeedLoaded,
      isFeedLoading,
      isLoading,
      refetchEvents,
      refetchFeed,
    ],
  )

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
}

export const useGlobalData = () => {
  const context = useContext(GlobalContext)

  if (!context) {
    throw new Error('useGlobalData must be used within a GlobalProvider')
  }

  return context
}
