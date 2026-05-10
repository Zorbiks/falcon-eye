export interface BookmarkEvent {
  rowKey: string
  week: string
  region: string
  country: string
  admin1: string
  eventType: string
  subEventType: string
  fatalities: number | null
  latitude: number | null
  longitude: number | null
  disorderType: string
  events: number | null
  popExposure: number | null
}

export interface BookmarkResponse {
  id: number
  rowKey: string
  createdAt: string
  event?: BookmarkEvent | null
}
