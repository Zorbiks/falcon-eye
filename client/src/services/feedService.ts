import api from 'src/lib/newsAPI'
import type { FeedItem } from '../types/feed'

export const fetchNewsFeed = async (): Promise<FeedItem[] | []> => {
  try {
    const response = await api.get(`/`)
    return response.data
  } catch (error) {
    console.error('Error fetching news feed from API:', error)
  }
  return []
}

export default fetchNewsFeed
