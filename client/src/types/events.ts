export interface AcledEvent {
  rowKey: string
  week: string
  region: string
  country: string
  admin1: string
  eventType: string
  subEventType: string
  disorderType: string
  events: number
  popExposure: number
  critical: boolean
  fatalities: number
  latitude: number
  longitude: number
}

export interface FetchEventsByDateRangeParams {
  startYear: number
  endYear: number
  startMonth: number
  endMonth: number
  country?: string
}

export interface FetchAllEventsParams {
  year: number
  month: number
  country?: string
}

export type EventRegionFilter = 'All' | 'Middle East' | 'North Africa'

export interface EventFilters {
  region: EventRegionFilter
  country: string
  eventTypes: string[]
  startDate: Date | null
  endDate: Date | null
}
