'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchAllEvents, fetchEventsByDateRange } from '../services/eventService'
import { fetchNewsFeed } from '../services/feedService'
import type { AcledEvent, EventFilters, EventRegionFilter } from '../types/events'
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
  error: string | null
  country: string | null
  setCountry: (country: string | null) => void
  fetchEvents: () => Promise<void>
  eventFilters: EventFilters
  applyEventFilters: (filters: EventFilters) => Promise<void>
  resetEventFilters: () => Promise<void>
  feedData: FeedItem[] | []
  isFeedLoading: boolean
  hasFeedLoaded: boolean
  feedError: string | null
  fetchFeed: () => Promise<void>
  bookmarks: BookmarkItem[]
  toggleBookmark: (bookmark: Omit<BookmarkItem, 'savedAt'>) => void
  isBookmarked: (id: string) => boolean
}

const GlobalContext = createContext<GlobalContextValue | undefined>(undefined)

const defaultEventFilters: EventFilters = {
  region: 'All',
  country: 'All',
  eventTypes: [],
  startDate: null,
  endDate: null,
}

const regionCountryMap: Record<Exclude<EventRegionFilter, 'All'>, string[]> = {
  'Middle East': [
    'Bahrain',
    'Iran',
    'Iraq',
    'Israel',
    'Jordan',
    'Kuwait',
    'Lebanon',
    'Oman',
    'Palestine',
    'Qatar',
    'Saudi Arabia',
    'Syria',
    'Turkey',
    'United Arab Emirates',
    'Yemen',
  ],
  'North Africa': ['Algeria', 'Egypt', 'Libya', 'Morocco', 'Mauritania', 'Sudan', 'Tunisia', 'Western Sahara'],
}

const isDateRangeSelected = (filters: EventFilters) => Boolean(filters.startDate || filters.endDate)

const normalizeEventType = (value: string) => value.trim().toLowerCase()

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [events, setEvents] = useState<AcledEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [eventFilters, setEventFilters] = useState<EventFilters>(defaultEventFilters)

  const [feedData, setFeedData] = useState<FeedItem[] | []>([])
  const [isFeedLoading, setIsFeedLoading] = useState(true)
  const [hasFeedLoaded, setHasFeedLoaded] = useState(false)
  const [feedError, setFeedError] = useState<string | null>(null)
  const [bookmarks, setBookmarks] = useLocalStorageState<BookmarkItem[]>('falcon-eye-bookmarks', [])

  const getCurrentEventPeriod = () => {
    const now = new Date()

    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    }
  }

  const resolveCountryFilter = (filters: EventFilters) => {
    if (filters.country !== 'All') {
      return filters.country
    }

    if (filters.region === 'All') {
      return undefined
    }

    return undefined
  }

  const filterEventsLocally = (items: AcledEvent[], filters: EventFilters) => {
    const selectedEventTypes = new Set(filters.eventTypes.map(normalizeEventType))
    const regionCountries = filters.region === 'All' ? null : new Set(regionCountryMap[filters.region])

    return items.filter((event) => {
      const matchesRegion = !regionCountries || regionCountries.has(event.country)
      const matchesEventType =
        selectedEventTypes.size === 0 || selectedEventTypes.has(normalizeEventType(event.eventType))

      return matchesRegion && matchesEventType
    })
  }

  const fetchEvents = async (filters: EventFilters = eventFilters) => {
    setIsLoading(true)
    setError(null)

    try {
      const resolvedCountry = resolveCountryFilter(filters)
      const hasDateRange = isDateRangeSelected(filters)

      const response = hasDateRange
        ? await fetchEventsByDateRange(
            (filters.startDate ?? filters.endDate ?? new Date()).getFullYear(),
            (filters.endDate ?? filters.startDate ?? new Date()).getFullYear(),
            (filters.startDate ?? filters.endDate ?? new Date()).getMonth() + 1,
            (filters.endDate ?? filters.startDate ?? new Date()).getMonth() + 1,
            resolvedCountry,
          )
        : await fetchAllEvents({
            ...getCurrentEventPeriod(),
            country: resolvedCountry,
          })

      setEvents(filterEventsLocally(response, filters))
    } catch (fetchError) {
      console.error('Failed to fetch map events:', fetchError)
      setError('Failed to fetch map events.')
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }

  const applyEventFilters = useCallback(async (filters: EventFilters) => {
    setEventFilters(filters)
    await fetchEvents(filters)
  }, [])

  const resetEventFilters = useCallback(async () => {
    setEventFilters(defaultEventFilters)
    await fetchEvents(defaultEventFilters)
  }, [])

  const setCountry = useCallback((country: string | null) => {
    setEventFilters((current) => ({
      ...current,
      country: country ?? 'All',
    }))
  }, [])

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
  }, [])

  useEffect(() => {
    fetchFeed()
  }, [])

  const value = useMemo(
    () => ({
      events,
      isLoading,
      error,
      country: eventFilters.country === 'All' ? null : eventFilters.country,
      setCountry,
      fetchEvents,
      eventFilters,
      applyEventFilters,
      resetEventFilters,
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
      eventFilters,
      error,
      bookmarks,
      events,
      feedData,
      feedError,
      hasFeedLoaded,
      isFeedLoading,
      isLoading,
      isBookmarked,
      applyEventFilters,
      resetEventFilters,
      fetchEvents,
      fetchFeed,
      toggleBookmark,
      setCountry,
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
