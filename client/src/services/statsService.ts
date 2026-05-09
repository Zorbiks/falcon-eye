import api from 'src/lib/eventsAPI'
import type { AdminRiskStats, CountryStats, EventTypeStats, RegionCountryStats, YearStats } from 'src/types/stats'

type ApiMessageResponse = {
  message: string
}

const isMessageResponse = (payload: unknown): payload is ApiMessageResponse => {
  return typeof payload === 'object' && payload !== null && 'message' in payload
}

const toArrayResponse = <T>(payload: T[] | ApiMessageResponse): T[] => {
  if (Array.isArray(payload)) {
    return payload
  }

  return []
}

const toObjectResponse = <T>(payload: T | ApiMessageResponse): T | null => {
  if (isMessageResponse(payload)) {
    return null
  }

  return payload
}

const buildDateParams = (start?: string, end?: string) => {
  const params: Record<string, string> = {}

  if (start) {
    params.start = start
  }

  if (end) {
    params.end = end
  }

  return params
}

export const getCountryStats = async (country: string): Promise<CountryStats | null> => {
  try {
    const response = await api.get<CountryStats | ApiMessageResponse>(`/stats/${encodeURIComponent(country)}`)
    return toObjectResponse(response.data)
  } catch (error) {
    console.error('Error fetching country stats:', error)
    return null
  }
}

export const getCountryStatsByYear = async (country: string, start?: string, end?: string): Promise<YearStats[]> => {
  try {
    const response = await api.get<YearStats[] | ApiMessageResponse>(`/stats/${encodeURIComponent(country)}/by-year`, {
      params: buildDateParams(start, end),
    })

    return toArrayResponse(response.data)
  } catch (error) {
    console.error('Error fetching year stats:', error)
    return []
  }
}

export const getCountryStatsByEventType = async (
  country: string,
  start?: string,
  end?: string,
): Promise<EventTypeStats[]> => {
  try {
    const response = await api.get<EventTypeStats[] | ApiMessageResponse>(
      `/stats/${encodeURIComponent(country)}/by-type`,
      {
        params: buildDateParams(start, end),
      },
    )

    return toArrayResponse(response.data)
  } catch (error) {
    console.error('Error fetching event type stats:', error)
    return []
  }
}

export const getCountryRiskStats = async (country: string, start?: string, end?: string): Promise<AdminRiskStats[]> => {
  try {
    const response = await api.get<AdminRiskStats[] | ApiMessageResponse>(
      `/stats/${encodeURIComponent(country)}/risk`,
      {
        params: buildDateParams(start, end),
      },
    )

    return toArrayResponse(response.data)
  } catch (error) {
    console.error('Error fetching risk stats:', error)
    return []
  }
}

export const getRegionCountryStats = async (region: string): Promise<RegionCountryStats[]> => {
  try {
    const response = await api.get<RegionCountryStats[] | ApiMessageResponse>(
      `/stats/region/${encodeURIComponent(region)}`,
    )
    return toArrayResponse(response.data)
  } catch (error) {
    console.error('Error fetching region stats:', error)
    return []
  }
}
