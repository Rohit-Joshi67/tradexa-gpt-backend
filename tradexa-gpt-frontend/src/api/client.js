import axios from 'axios'

const PROFILE_KEY = 'tradexa.profile'

// The access token lives in memory only — never in localStorage.
// The refresh token lives in an httpOnly cookie managed by the backend.
let accessToken = null
let refreshPromise = null

export function getStoredProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    localStorage.removeItem(PROFILE_KEY)
    return null
  }
}

export function storeProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function clearProfile() {
  localStorage.removeItem(PROFILE_KEY)
}

export function setAccessToken(token) {
  accessToken = token || null
}

export function getAccessToken() {
  return accessToken
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 60000,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

function isAuthRefreshCall(config) {
  return config?.url?.includes('/api/v1/auth/refresh')
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/api/v1/auth/refresh')
      .then((response) => {
        const token = response.data?.data?.token
        if (!token) throw new Error('Refresh did not return a token')
        setAccessToken(token)
        return token
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

function hardLogout() {
  setAccessToken(null)
  clearProfile()
  if (!window.location.pathname.startsWith('/login')) {
    window.location.assign('/login')
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error || {}

    if (response?.status === 401 && config && !config._retried && !isAuthRefreshCall(config)) {
      config._retried = true
      try {
        const token = await refreshAccessToken()
        config.headers.Authorization = `Bearer ${token}`
        return api(config)
      } catch {
        hardLogout()
      }
    } else if (response?.status === 401 && isAuthRefreshCall(config)) {
      hardLogout()
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
    return Object.values(payload.data).join(' \u00b7 ')
  }
  if (error.response?.status === 429) {
    return 'Too many attempts. Please wait a bit and try again.'
  }
  if (!error.response) {
    if (error.code === 'ECONNABORTED') return 'Request timed out. The server is processing your file \u2014 please try again in a moment.'
    return 'Cannot reach the backend server. Please try again later.'
  }
  return 'Something went wrong. Please try again.'
}

export default api
