import axios from 'src/lib/axios'
import type { FeedItem } from '../types/feed'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const fetchNewsFeed = async (): Promise<FeedItem[] | null> => {
  try {
   const response =  await axios.get(`/news/feed`)
   return response.data
  } catch (error) {
    console.error('Error fetching news feed from API. Returning mock data:', error)
    return null
  }
}

export default fetchNewsFeed
