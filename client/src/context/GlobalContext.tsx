'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getRecentEvents, searchEventsByAdvancedFilters } from '../services/eventService'
import { fetchNewsFeed } from '../services/feedService'
import type { AcledEvent, EventFilters, EventRegionFilter } from '../types/events'
import type { FeedItem } from '../types/feed'
import useLocalStorageState from 'src/hooks/use-localstorage-state'
import { filterEventsClientSide, RangeOption } from '../lib/eventFilter'

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
  serverEvents: AcledEvent[]
  error: string | null
  country: string | null
  setCountry: (country: string | null) => void
  fetchEvents: () => Promise<void>
  eventFilters: EventFilters
  applyServerFilters: (filters: EventFilters) => Promise<void>
  applyEventFilters: (filters: EventFilters) => Promise<void>
  resetEventFilters: () => Promise<void>
  applyLocalFilters: (category: string, range?: RangeOption) => void
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
  'Northern Africa': ['Algeria', 'Egypt', 'Libya', 'Morocco', 'Mauritania', 'Sudan', 'Tunisia', 'Western Sahara'],
}

const normalizeEventType = (value: string) => value.trim().toLowerCase()
const formatDateForApi = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [events, setEvents] = useState<AcledEvent[]>([])
  const [serverEvents, setServerEvents] = useState<AcledEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [eventFilters, setEventFilters] = useState<EventFilters>(defaultEventFilters)

  const [feedData, setFeedData] = useState<FeedItem[] | []>([])
  const [isFeedLoading, setIsFeedLoading] = useState(true)
  const [hasFeedLoaded, setHasFeedLoaded] = useState(false)
  const [feedError, setFeedError] = useState<string | null>(null)
  const [bookmarks, setBookmarks] = useLocalStorageState<BookmarkItem[]>('falcon-eye-bookmarks', [])

  const filterEventsLocally = (items: AcledEvent[], filters: EventFilters) => {
    const selectedEventTypes = new Set(filters.eventTypes.map(normalizeEventType))
    const regionCountries = filters.region === 'All' ? null : new Set(regionCountryMap[filters.region])
    const selectedCountry = filters.country === 'All' ? null : filters.country

    return items.filter((event) => {
      const matchesRegion = !regionCountries || regionCountries.has(event.country)
      const matchesCountry = !selectedCountry || event.country === selectedCountry
      const matchesEventType =
        selectedEventTypes.size === 0 || selectedEventTypes.has(normalizeEventType(event.eventType))

      return matchesRegion && matchesCountry && matchesEventType
    })
  }

  const fetchServerEvents = useCallback(
    async (filters: EventFilters = eventFilters) => {
      setIsLoading(true)
      setError(null)

      try {
        const hasDateRange = Boolean(filters.startDate && filters.endDate)

        const response = hasDateRange
          ? await searchEventsByAdvancedFilters({
              region: filters.region === 'All' ? 'all' : filters.region,
              country: filters.country === 'All' ? 'all' : filters.country,
              eventTypes: filters.eventTypes,
              from: formatDateForApi(filters.startDate as Date),
              to: formatDateForApi(filters.endDate as Date),
            })
          : await getRecentEvents()

        setServerEvents(response)

        setEvents(hasDateRange ? response : filterEventsLocally(response, filters))
      } catch (fetchError) {
        console.error('Failed to fetch map events:', fetchError)
        setError('Failed to fetch map events.')
        setServerEvents([])
        setEvents([])
      } finally {
        setIsLoading(false)
      }
    },
    [eventFilters],
  )

  const applyServerFilters = useCallback(
    async (filters: EventFilters) => {
      setEventFilters(filters)
      await fetchServerEvents(filters)
    },
    [fetchServerEvents],
  )

  const applyEventFilters = applyServerFilters

  const resetEventFilters = useCallback(async () => {
    setEventFilters(defaultEventFilters)
    await fetchServerEvents(defaultEventFilters)
  }, [fetchServerEvents])

  const applyLocalFilters = useCallback(
    (category: string, range: RangeOption = 'All') => {
      setEvents(filterEventsClientSide(serverEvents, category, range))
    },
    [serverEvents],
  )

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
    fetchServerEvents()
  }, [fetchServerEvents])

  useEffect(() => {
    fetchFeed()
  }, [])

  const value = useMemo(
    () => ({
      events,
      serverEvents,
      isLoading,
      error,
      country: eventFilters.country === 'All' ? null : eventFilters.country,
      setCountry,
      fetchEvents: fetchServerEvents,
      eventFilters,
      applyServerFilters,
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
      applyLocalFilters,
    }),
    [
      eventFilters,
      error,
      bookmarks,
      events,
      serverEvents,
      feedData,
      feedError,
      hasFeedLoaded,
      isFeedLoading,
      isLoading,
      isBookmarked,
      applyServerFilters,
      applyEventFilters,
      resetEventFilters,
      fetchServerEvents,
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
