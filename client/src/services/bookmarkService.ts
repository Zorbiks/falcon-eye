import api from 'src/lib/bookmarksAPI'
import type { BookmarkResponse } from 'src/types/bookmarks'

export const fetchMyBookmarks = async (token: string): Promise<BookmarkResponse[]> => {
  try {
    const response = await api.get<BookmarkResponse[]>('', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    return []
  }
}
