import api from 'src/lib/eventsAPI'
import type { AcledEvent, SearchEventsParams } from '../types/events'

type ApiMessageResponse = {
  message: string
}

type AdvancedEventSearchParams = {
  region: string
  country: string
  eventTypes: string[]
  from: string
  to: string
}

const toEventArray = (payload: AcledEvent[] | ApiMessageResponse): AcledEvent[] => {
  if (Array.isArray(payload)) {
    return payload
  }

  return []
}

// Recent
export const getRecentEvents = async (): Promise<AcledEvent[]> => {
  try {
    const response = await api.get<AcledEvent[] | ApiMessageResponse>(`/recent`)
    return toEventArray(response.data)
  } catch (error) {
    console.error('Error fetching recent events:', error)
    return []
  }
}

// by country
export const getCountryEvents = async (country: string): Promise<AcledEvent[]> => {
  try {
    const response = await api.get<AcledEvent[] | ApiMessageResponse>(`/country/${encodeURIComponent(country)}`)
    return toEventArray(response.data)
  } catch (error) {
    console.error('Error fetching events by country:', error)
    return []
  }
}

// search
export const searchEvents = async ({
  region,
  country,
  eventType,
  from,
  to,
}: SearchEventsParams): Promise<AcledEvent[]> => {
  const normalizedRegion = region.trim()
  const normalizedCountry = country.trim()
  const normalizedEventType = eventType.trim()
  const normalizedFrom = from.trim()
  const normalizedTo = to.trim()
  const hasCompleteSearchParams = Boolean(
    normalizedRegion && normalizedCountry && normalizedEventType && normalizedFrom && normalizedTo,
  )

  if (!hasCompleteSearchParams) {
    console.error('Incomplete search params. region, country, eventType, from, and to are all required.')
    return []
  }

  try {
    const response = await api.get<AcledEvent[] | ApiMessageResponse>(`/search`, {
      params: {
        region: normalizedRegion,
        country: normalizedCountry,
        'event-type': normalizedEventType,
        from: normalizedFrom,
        to: normalizedTo,
      },
    })

    return toEventArray(response.data)
  } catch (error) {
    console.error('Error searching events:', error)
    return []
  }
}

export const searchEventsByAdvancedFilters = async ({
  region,
  country,
  eventTypes,
  from,
  to,
}: AdvancedEventSearchParams): Promise<AcledEvent[]> => {
  const normalizedRegion = region.trim() || 'all'
  const normalizedCountry = country.trim() || 'all'
  const normalizedFrom = from.trim()
  const normalizedTo = to.trim()
  const normalizedEventTypes = Array.from(new Set(eventTypes.map((eventType) => eventType.trim()).filter(Boolean)))
  const eventTypesToQuery = normalizedEventTypes.length > 0 ? normalizedEventTypes : ['all']

  if (!normalizedFrom || !normalizedTo) {
    console.error('Incomplete advanced filter params. from and to are required.')
    return []
  }

  try {
    const responses = await Promise.all(
      eventTypesToQuery.map((eventType) =>
        searchEvents({
          region: normalizedRegion,
          country: normalizedCountry,
          eventType,
          from: normalizedFrom,
          to: normalizedTo,
        }),
      ),
    )

    const dedupedEvents = new Map<string, AcledEvent>()

    responses.flat().forEach((event) => {
      dedupedEvents.set(event.rowKey, event)
    })

    return Array.from(dedupedEvents.values())
  } catch (error) {
    console.error('Error searching events with advanced filters:', error)
    return []
  }
}
