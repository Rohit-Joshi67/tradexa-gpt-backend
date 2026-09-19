import api, { getAccessToken, unwrap } from './client'

const BASE = '/api/v1/copilot'

export function listConversations() {
  return unwrap(api.get(`${BASE}/conversations`))
}

export function createConversation() {
  return unwrap(api.post(`${BASE}/conversations`))
}

export function getMessages(conversationId) {
  return unwrap(api.get(`${BASE}/conversations/${conversationId}/messages`))
}

export function deleteConversation(conversationId) {
  return unwrap(api.delete(`${BASE}/conversations/${conversationId}`))
}

export function getQuota() {
  return unwrap(api.get(`${BASE}/quota`))
}

export function leakReport() {
  return unwrap(api.post(`${BASE}/leak-report`))
}

export function preTrade(payload) {
  return unwrap(api.post(`${BASE}/pre-trade`, payload))
}

export function edgeValidate(payload) {
  return unwrap(api.post(`${BASE}/edge-validate`, payload))
}

function apiBase() {
  return import.meta.env.VITE_API_URL || ''
}

/**
 * Streaming chat over SSE (POST, so EventSource won't do).
 * Events from the server: `conversation` (id), `token` (text chunk),
 * `done` (tokens used), `error` (message).
 */
export async function streamChat({ conversationId, message, onConversation, onToken, onDone, onError, signal }) {
  const attempt = async (retried) => {
    const response = await fetch(`${apiBase()}${BASE}/chat`, {
      method: 'POST',
      credentials: 'include',
      signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
      },
      body: JSON.stringify({ conversationId, message }),
    })

    if (response.status === 401 && !retried) {
      // Mirror the axios interceptor: one silent refresh, then retry once.
      try {
        await api.post('/api/v1/auth/refresh')
        return attempt(true)
      } catch {
        throw new Error('Session expired. Please log in again.')
      }
    }

    if (!response.ok || !response.body) {
      let detail = ''
      try {
        const payload = await response.clone().json()
        detail = payload?.message || ''
      } catch { /* not JSON */ }
      const err = new Error(detail || `Copilot request failed (${response.status}).`)
      err.status = response.status
      throw err
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    const dispatch = (eventName, data) => {
      if (eventName === 'conversation') onConversation?.(data)
      else if (eventName === 'token') onToken?.(data)
      else if (eventName === 'done') onDone?.(data)
      else if (eventName === 'error') onError?.(new Error(data || 'The copilot hit a snag.'))
    }

    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      // SSE frames are separated by blank lines.
      let idx
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, idx)
        buffer = buffer.slice(idx + 2)
        let eventName = 'message'
        const dataLines = []
        for (const line of frame.split('\n')) {
          if (line.startsWith('event:')) eventName = line.slice(6).trim()
          // SSE: strip exactly one leading space after "data:".
          else if (line.startsWith('data:')) dataLines.push(line.slice(5).replace(/^ /, ''))
        }
        // SseEmitter joins multi-line data with \n; rejoin here.
        dispatch(eventName, dataLines.join('\n'))
      }
    }
  }

  return attempt(false)
}
