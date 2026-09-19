import api, { unwrap } from './client'

export function login(email, password) {
  return unwrap(api.post('/api/v1/auth/login', { email, password }))
}

export function register(name, email, password) {
  return unwrap(api.post('/api/v1/auth/register', { name, email, password }))
}

export function refreshSession() {
  return unwrap(api.post('/api/v1/auth/refresh'))
}

export function logout() {
  return unwrap(api.post('/api/v1/auth/logout'))
}

export function forgotPassword(email) {
  return unwrap(api.post('/api/v1/auth/forgot-password', { email }))
}

export function resetPassword(token, newPassword) {
  return unwrap(api.post('/api/v1/auth/reset-password', { token, newPassword }))
}

export function verifyEmail(token) {
  return unwrap(api.post('/api/v1/auth/verify-email', { token }))
}
