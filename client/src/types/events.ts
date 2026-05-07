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

export interface FetchEventsParams {
  region?: string
  country?: string
  eventType?: string
  from?: string
  to?: string
}

export interface SearchEventsParams {
  region: string
  country: string
  eventType: string
  from: string
  to: string
}

export type EventRegionFilter = 'All' | 'Middle East' | 'North Africa'

export interface EventFilters {
  region: EventRegionFilter
  country: string
  eventTypes: string[]
  startDate: Date | null
  endDate: Date | null
}
