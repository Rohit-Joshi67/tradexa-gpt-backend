import api, { unwrap } from './client'

// All endpoints return the backend envelope { success, message, data, timestamp }.
// `unwrap` resolves to the inner `data` object.

export function getMe() {
  return unwrap(api.get('/api/v1/me'))
}

export function createSubscription(interval) {
  return unwrap(api.post('/api/v1/billing/subscribe', { interval }))
}

export function verifyPayment(payload) {
  return unwrap(api.post('/api/v1/billing/verify', payload))
}

export function cancelSubscription() {
  return unwrap(api.post('/api/v1/billing/cancel'))
}

export function getBillingStatus() {
  return unwrap(api.get('/api/v1/billing/status'))
}
