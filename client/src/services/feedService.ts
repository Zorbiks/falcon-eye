import axios from 'src/lib/eventsAPI'
import type { FeedItem } from '../types/feed'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081'

export const fetchNewsFeed = async (): Promise<FeedItem[] | []> => {
  try {
    const response = await axios.get(`/news/feed`)
    return response.data
  } catch (error) {
    console.error('Error fetching news feed from API. Returning mock data:', error)
  }
  return []
}

export default fetchNewsFeed
