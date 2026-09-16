import api, { unwrap } from './client'

export function getSummary() {
  return unwrap(api.get('/api/v1/analytics/summary'))
}

export function getSymbols() {
  return unwrap(api.get('/api/v1/analytics/symbols'))
}

export function getMarketHours() {
  return unwrap(api.get('/api/v1/analytics/market-hours'))
}
