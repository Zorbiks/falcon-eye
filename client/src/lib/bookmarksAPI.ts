import axios from 'axios'
import type { BookmarkResponse } from 'src/types/bookmarks'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/bookmarks`,
})

export async function fetchMyBookmarks(token: string) {
  const response = await api.get<BookmarkResponse[]>('', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}
