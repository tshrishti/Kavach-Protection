import axios from 'axios'

const apiBaseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
})

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.message)
    return Promise.reject(error)
  }
)

export const getStats = () => api.get('/stats')
export const getLogs = () => api.get('/logs')
export const getBenchmark = () => api.get('/benchmark')
export const getAttackStatus = () => api.get('/attack-status')
export const getTrafficTimeline = () => api.get('/traffic/timeline')
export const getSettings = () => api.get('/settings')
export const updateSettings = (settings) => api.post('/settings', settings)

export default api