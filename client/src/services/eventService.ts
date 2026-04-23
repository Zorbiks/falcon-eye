import axios from 'axios'
import type { AcledEvent, FetchEventsByDateRangeParams } from '../types/events'
import data from 'src/data/event-mock.json'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

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

// Fetch all events
export const fetchAllEvents = async (country?: string): Promise<AcledEvent[]> => {
  return data
  try {
    const response = await axios.get(`${API_BASE_URL}/events`, {
      params: country ? { country } : {},
    })
    return response.data
  } catch (error) {
    console.error('Error fetching all HBase events:', error)
    return []
  }
}
