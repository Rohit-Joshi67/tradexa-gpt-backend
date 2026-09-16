import api, { unwrap } from './client'

export function getTrades() {
  return unwrap(api.get('/api/v1/trades'))
}

export function createTrade(payload) {
  return unwrap(api.post('/api/v1/trades', payload))
}

export function updateTrade(id, payload) {
  return unwrap(api.put(`/api/v1/trades/${id}`, payload))
}

export function deleteTrade(id) {
  return unwrap(api.delete(`/api/v1/trades/${id}`))
}
