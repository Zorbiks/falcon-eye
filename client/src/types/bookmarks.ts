import { AuthUser } from './auth'

export interface EventBookmarkResponse {
  rowKey: string
  week: string | null
  region: string | null
  country: string | null
  admin1: string | null
  eventType: string | null
  subEventType: string | null
  fatalities: number | null
  latitude: number | null
  longitude: number | null
  disorderType: string | null
  events: number | null
  popExposure: number | null
  critical: boolean | null
  id: number
  createdAt: string
}

export interface NewsBookmarkResponse {
  id: number
  createdAt: string
  link: string
  title: string | null
  description: string | null
  source: string | null
  publishedAt: string | null
  imageUrl: string | null
}

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

export type UserProfileDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AuthUser
  onLogout: () => void
  onOpenBookmarks: () => void
}

export type UserBookmarksDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export type UserAccountMenuProps = {
  user: AuthUser
  onLogout: () => void
}
