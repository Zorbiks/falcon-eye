'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchAllEvents } from '../services/eventService'
import { fetchNewsFeed } from '../services/feedService'
import type { AcledEvent } from '../types/events'
import type { FeedItem } from '../types/feed'
import useLocalStorageState from 'src/hooks/use-localstorage-state'

export type BookmarkItem = {
  id: string
  kind: 'event' | 'feed'
  title: string
  subtitle: string
  savedAt: string
}

type GlobalContextValue = {
  events: AcledEvent[]
  isLoading: boolean
  hasEventsLoaded: boolean
  error: string | null
  country: string | null
  setCountry: (country: string | null) => void
  fetchEvents: () => Promise<void>
  feedData: FeedItem[]
  isFeedLoading: boolean
  hasFeedLoaded: boolean
  feedError: string | null
  fetchFeed: () => Promise<void>
  bookmarks: BookmarkItem[]
  toggleBookmark: (bookmark: Omit<BookmarkItem, 'savedAt'>) => void
  isBookmarked: (id: string) => boolean
}

const GlobalContext = createContext<GlobalContextValue | undefined>(undefined)

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [events, setEvents] = useState<AcledEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasEventsLoaded, setHasEventsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [country, setCountry] = useState<string | null>(null)

  const [feedData, setFeedData] = useState<FeedItem[]>([])
  const [isFeedLoading, setIsFeedLoading] = useState(true)
  const [hasFeedLoaded, setHasFeedLoaded] = useState(false)
  const [feedError, setFeedError] = useState<string | null>(null)
  const [bookmarks, setBookmarks] = useLocalStorageState<BookmarkItem[]>('falcon-eye-bookmarks', [])

  const fetchEvents = async () => {
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
  }

  const fetchFeed = async () => {
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
  }

  const isBookmarked = useCallback((id: string) => bookmarks.some((bookmark) => bookmark.id === id), [bookmarks])

  const toggleBookmark = useCallback(
    (bookmark: Omit<BookmarkItem, 'savedAt'>) => {
      setBookmarks((currentBookmarks) => {
        const existingBookmark = currentBookmarks.find((item) => item.id === bookmark.id)

        if (existingBookmark) {
          return currentBookmarks.filter((item) => item.id !== bookmark.id)
        }

        return [
          ...currentBookmarks,
          {
            ...bookmark,
            savedAt: new Date().toISOString(),
          },
        ]
      })
    },
    [setBookmarks],
  )

  useEffect(() => {
    fetchEvents()
  }, [country])

  useEffect(() => {
    fetchFeed()
  }, [])

  const value = useMemo(
    () => ({
      events,
      isLoading,
      hasEventsLoaded,
      error,
      country,
      setCountry,
      fetchEvents,
      feedData,
      isFeedLoading,
      hasFeedLoaded,
      feedError,
      fetchFeed,
      bookmarks,
      toggleBookmark,
      isBookmarked,
    }),
    [
      country,
      error,
      bookmarks,
      events,
      feedData,
      feedError,
      hasEventsLoaded,
      hasFeedLoaded,
      isFeedLoading,
      isLoading,
      isBookmarked,
      fetchEvents,
      fetchFeed,
      toggleBookmark,
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
