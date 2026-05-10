import api from 'src/lib/bookmarksAPI'
import type { BookmarkResponse } from 'src/types/bookmarks'

export const fetchMyBookmarks = async (): Promise<BookmarkResponse[]> => {
  try {
    const response = await api.get<BookmarkResponse[]>('/')
    return response.data
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    return []
  }
}

export const addBookmark = async (rowKey: string): Promise<BookmarkResponse | null> => {
  try {
    const response = await api.post<BookmarkResponse>('/', { rowKey })
    return response.data
  } catch (error) {
    console.error('Error adding bookmark:', error)
    return null
  }
}

export const removeBookmark = async (rowKey: string): Promise<boolean> => {
  try {
    await api.delete('/', {
      data: { rowKey },
    })
    return true
  } catch (error) {
    console.error('Error removing bookmark:', error)
    return false
  }
}
