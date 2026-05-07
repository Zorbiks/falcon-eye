import api from 'src/lib/eventsAPI'
import type { AcledEvent, SearchEventsParams } from '../types/events'

type ApiMessageResponse = {
  message: string
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
  const hasCompleteSearchParams = Boolean(region && country && eventType && from && to)

  if (!hasCompleteSearchParams) {
    console.error('Incomplete search params. region, country, eventType, from, and to are all required.')
    return []
  }

  try {
    const response = await api.get<AcledEvent[] | ApiMessageResponse>(`/search`, {
      params: {
        region,
        country,
        'event-type': eventType,
        from,
        to,
      },
    })

    return toEventArray(response.data)
  } catch (error) {
    console.error('Error searching events:', error)
    return []
  }
}
