import axios from 'axios'

const TOKEN_KEY = 'tradexa.session'

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(TOKEN_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    localStorage.removeItem(TOKEN_KEY)
    return null
  }
}

export function storeSession(session) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 60000,
})

api.interceptors.request.use((config) => {
  const session = getStoredSession()
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession()
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

export async function unwrap(promise) {
  const response = await promise
  return response.data?.data
}

export function apiErrorMessage(error) {
  const payload = error.response?.data
  if (payload?.message) return payload.message
  if (payload?.data && typeof payload.data === 'object') {
    return Object.values(payload.data).join(' · ')
  }
  if (!error.response) return 'Cannot reach the backend. Is it running on port 8080?'
  return 'Something went wrong. Please try again.'
}

export default api
