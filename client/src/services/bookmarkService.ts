import api from 'src/lib/bookmarksAPI'
import type { FeedItem } from 'src/types/feed'
import type { AcledEvent } from 'src/types/events'
import type { EventBookmarkResponse, NewsBookmarkResponse } from 'src/types/bookmarks'

export const fetchMyEventBookmarks = async (): Promise<EventBookmarkResponse[]> => {
  try {
    const response = await api.get<EventBookmarkResponse[]>('/events')
    return response.data
  } catch (error) {
    console.error('Error fetching event bookmarks:', error)
    return []
  }
}

export const addEventBookmark = async (event: AcledEvent): Promise<EventBookmarkResponse | null> => {
  try {
    const response = await api.post<EventBookmarkResponse>('/events', event)
    return response.data
  } catch (error) {
    console.error('Error adding event bookmark:', error)
    return null
  }
}

export const removeEventBookmark = async (rowKey: string): Promise<boolean> => {
  try {
    await api.delete('/events', {
      data: { rowKey },
    })
    return true
  } catch (error) {
    console.error('Error removing event bookmark:', error)
    return false
  }
}

export const fetchMyNewsBookmarks = async (): Promise<NewsBookmarkResponse[]> => {
  try {
    const response = await api.get<NewsBookmarkResponse[]>('/news')
    return response.data
  } catch (error) {
    console.error('Error fetching news bookmarks:', error)
    return []
  }
}

export const addNewsBookmark = async (newsItem: FeedItem): Promise<NewsBookmarkResponse | null> => {
  try {
    const response = await api.post<NewsBookmarkResponse>('/news', newsItem)
    return response.data
  } catch (error) {
    console.error('Error adding news bookmark:', error)
    return null
  }
}

export const removeNewsBookmark = async (link: string): Promise<boolean> => {
  try {
    await api.delete('/news', {
      data: { link },
    })
    return true
  } catch (error) {
    console.error('Error removing news bookmark:', error)
    return false
  }
}
