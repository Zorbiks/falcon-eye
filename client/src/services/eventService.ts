import axios from 'src/lib/axios'
import type { AcledEvent, FetchEventsByDateRangeParams } from '../types/events'
import data from 'src/data/event-mock.json'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// Fetch all events in a specific date range
export const fetchEventsByDateRange = async (
  startYear: number,
  endYear: number,
  startMonth: number,
  endMonth: number,
  country?: string,
): Promise<AcledEvent[]> => {
  try {
    const params: FetchEventsByDateRangeParams = {
      startMonth,
      endMonth,
      startYear,
      endYear,
    }

    if (country) {
      params.country = country
    }

    const response = await axios.get(`${API_BASE_URL}/events/search`, {
      params,
    })
    return response.data
  } catch (error) {
    console.error('Error fetching HBase events:', error)
    return []
  }
}

// Fetch all recent events
export const fetchAllEvents = async (country?: string): Promise<AcledEvent[]> => {
  try {
    const response = await axios.get(`/events/recent`, {
      params: country ? { country } : {},
    })

    return response.data
  } catch (error) {
    console.error('Error fetching all recent events:', error)
    return []
  }
}
