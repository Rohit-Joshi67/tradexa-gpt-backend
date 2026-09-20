import api, { unwrap } from './client'

// All endpoints return the backend envelope { success, message, data, timestamp }.
// `unwrap` resolves to the inner `data` object.

// Public (free, ad-supported) read API — no login required.
export function listArticles({ page = 0, size = 9, tag, category } = {}) {
  const params = { page, size }
  if (tag) params.tag = tag
  if (category) params.category = category
  return unwrap(api.get('/api/v1/articles', { params }))
}

/** Top `limit` published articles ordered by viewCount desc. */
export function getTopArticles(limit = 5) {
  return unwrap(api.get('/api/v1/articles/top', { params: { limit } }))
}

export function getArticle(slug) {
  return unwrap(api.get(`/api/v1/articles/${encodeURIComponent(slug)}`))
}

/**
 * Record one view for an article. Public, no auth. Fire-and-forget:
 * never throws and never blocks rendering — callers don't await this.
 */
export function recordArticleView(slug) {
  if (!slug) return Promise.resolve()
  return unwrap(api.post(`/api/v1/articles/${encodeURIComponent(slug)}/view`)).catch(() => {
    // view counting is best-effort; a failed beacon must not break the page
  })
}

// Admin CMS API — requires ROLE_ADMIN (enforced server-side).
export function adminListArticles({ page = 0, size = 20 } = {}) {
  return unwrap(api.get('/api/v1/admin/articles', { params: { page, size } }))
}

export function adminGetArticle(id) {
  return unwrap(api.get(`/api/v1/admin/articles/${id}`))
}

export function adminCreateArticle(payload) {
  return unwrap(api.post('/api/v1/admin/articles', payload))
}

export function adminUpdateArticle(id, payload) {
  return unwrap(api.put(`/api/v1/admin/articles/${id}`, payload))
}

export function adminDeleteArticle(id) {
  return unwrap(api.delete(`/api/v1/admin/articles/${id}`))
}

export function adminPublishArticle(id) {
  return unwrap(api.patch(`/api/v1/admin/articles/${id}/publish`))
}

export function adminUnpublishArticle(id) {
  return unwrap(api.patch(`/api/v1/admin/articles/${id}/unpublish`))
}
