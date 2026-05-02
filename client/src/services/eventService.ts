import api from 'src/lib/eventsAPI'
import type { AcledEvent, FetchEventsParams } from '../types/events'

export const getEvents = async ({ year, month, country }: FetchEventsParams): Promise<AcledEvent[]> => {
  try {
    const params: FetchEventsParams = {}

    if (country) {
      params.country = country
    }

    if (year) {
      params.year = year
    }

    if (month) {
      params.month = month
    }

    const response = await api.get(`/search`, {
      params,
    })

    return response.data
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}
