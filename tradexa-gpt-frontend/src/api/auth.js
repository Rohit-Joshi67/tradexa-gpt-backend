import api, { unwrap } from './client'

export function login(email, password) {
  return unwrap(api.post('/api/v1/auth/login', { email, password }))
}

export function register(name, email, password) {
  return unwrap(api.post('/api/v1/auth/register', { name, email, password }))
}
