import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_NEWS_API_URL || 'http://localhost:8081'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/news`,
})

export default api
