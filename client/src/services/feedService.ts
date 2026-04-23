import axios from 'axios'
import type { FeedItem } from '../types/feed'
import mockFeedResponse from 'src/data/feed-mock.json'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const fetchNewsFeed = async (): Promise<FeedItem[]> => {
  return mockFeedResponse
  try {
    await axios.get(`${API_BASE_URL}/news/feed`)
  } catch (error) {
    console.error('Error fetching news feed from API. Returning mock data:', error)
  }

  return mockFeedResponse
}

export default fetchNewsFeed
