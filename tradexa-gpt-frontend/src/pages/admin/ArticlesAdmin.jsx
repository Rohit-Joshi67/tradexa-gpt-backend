import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus, Trash2, FileText } from 'lucide-react'
import {
  adminCreateArticle,
  adminDeleteArticle,
  adminGetArticle,
  adminListArticles,
  adminPublishArticle,
  adminUnpublishArticle,
  adminUpdateArticle,
} from '../../api/articles'
import { apiErrorMessage } from '../../api/client'
import { CATEGORIES, categoryLabel } from '../../lib/articles'

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  author: '',
  category: 'TRADING',
  tags: '',
  metaTitle: '',
  metaDescription: '',
  ogImage: '',
  status: 'DRAFT',
}

function slugSuggestion(title) {
  return (title || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 170)
}

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export default function ArticlesAdmin() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminListArticles({ page: 0, size: 50 })
      setArticles(data?.content || [])
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function startCreate() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function startEdit(id) {
    setNotice('')
    try {
      const data = await adminGetArticle(id)
      setEditingId(id)
      setForm({
        title: data.title || '',
        slug: data.slug || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        author: data.author || '',
        category: data.category || 'TRADING',
        tags: (data.tags || []).join(', '),
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        ogImage: data.ogImage || '',
        status: data.status || 'DRAFT',
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(apiErrorMessage(err))
    }
  }

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function onSave(event) {
    event.preventDefault()
    setSaving(true)
    setNotice('')
    setError('')
    try {
      const payload = {
        ...form,
        slug: form.slug.trim() || undefined,
      }
      if (editingId) {
        await adminUpdateArticle(editingId, payload)
        setNotice('Article updated.')
      } else {
        await adminCreateArticle(payload)
        setNotice('Article created as draft.')
      }
      setEditingId(null)
      setForm({ ...EMPTY_FORM })
      await load()
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Delete this article permanently?')) return
    try {
      await adminDeleteArticle(id)
      setNotice('Article deleted.')
      await load()
    } catch (err) {
      setError(apiErrorMessage(err))
    }
  }

  async function onTogglePublish(article) {
    try {
      if (article.status === 'PUBLISHED') await adminUnpublishArticle(article.id)
      else await adminPublishArticle(article.id)
      await load()
    } catch (err) {
      setError(apiErrorMessage(err))
    }
  }

  return (
    <div className="page">
      <div className="wrap">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors mb-6"
        >
          <ArrowLeft size={15} /> Back to dashboard
        </Link>
      </div>

      <div className="page-head">
        <div>
          <span className="eyebrow">Admin</span>
          <h1>Article CMS</h1>
          <p className="mut text-[14px] mt-1.5">Draft, edit, and publish free articles.</p>
        </div>
        <button type="button" onClick={startCreate} className="btn btn-profit shrink-0">
          <Plus size={16} /> New article
        </button>
      </div>

      <div className="wrap">

        {notice && <div className="alert alert-ok mb-6">{notice}</div>}
        {error && <div className="alert alert-error mb-6">{error}</div>}

        {/* Editor */}
        <form onSubmit={onSave} className="panel mb-10">
          <div className="panel-head">
            <span className="panel-title flex items-center gap-2.5">
              <FileText size={16} className="text-[var(--color-profit)]" />
              {editingId ? 'Edit article' : 'New article'}
            </span>
            <span className={`badge ${form.status === 'PUBLISHED' ? 'badge-profit' : 'badge-line'}`}>
              {form.status === 'PUBLISHED' ? 'Published' : 'Draft'}
            </span>
          </div>
          <div className="panel-body space-y-5">
            <div>
              <label className="label" htmlFor="aa-title">Title *</label>
              <input
                id="aa-title"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                required
                maxLength={220}
                placeholder="Why Position Sizing Beats Stock Picking"
                className="field"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="label" htmlFor="aa-slug">Slug (auto from title if blank)</label>
                <div className="flex gap-2">
                  <input
                    id="aa-slug"
                    value={form.slug}
                    onChange={(e) => set('slug', e.target.value)}
                    maxLength={180}
                    placeholder={slugSuggestion(form.title) || 'my-article-slug'}
                    className="field flex-1 tnum"
                  />
                  <button
                    type="button"
                    onClick={() => set('slug', slugSuggestion(form.title))}
                    className="btn btn-ghost btn-sm shrink-0"
                  >
                    Auto
                  </button>
                </div>
              </div>
              <div>
                <label className="label" htmlFor="aa-author">Author</label>
                <input
                  id="aa-author"
                  value={form.author}
                  onChange={(e) => set('author', e.target.value)}
                  maxLength={120}
                  placeholder="Tradexa Editorial"
                  className="field"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="aa-excerpt">Excerpt</label>
              <input
                id="aa-excerpt"
                value={form.excerpt}
                onChange={(e) => set('excerpt', e.target.value)}
                maxLength={400}
                placeholder="One-line summary shown on cards and in search results."
                className="field"
              />
            </div>

            <div>
              <label className="label" htmlFor="aa-content">Content (Markdown) *</label>
              <textarea
                id="aa-content"
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
                required
                rows={14}
                placeholder={'# Heading\n\nWrite in **Markdown**. Rendered safely on the reader page.'}
                className="field font-mono !text-[13px] !leading-relaxed min-h-[320px]"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <label className="label" htmlFor="aa-tags">Tags (comma-separated)</label>
                <input
                  id="aa-tags"
                  value={form.tags}
                  onChange={(e) => set('tags', e.target.value)}
                  maxLength={300}
                  placeholder="risk, psychology"
                  className="field"
                />
              </div>
              <div>
                <label className="label" htmlFor="aa-category">Category *</label>
                <select
                  id="aa-category"
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  className="field"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="aa-status">Status</label>
                <select
                  id="aa-status"
                  value={form.status}
                  onChange={(e) => set('status', e.target.value)}
                  className="field"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>

            <details className="rounded-xl border border-[var(--color-line)] px-4 py-3 bg-[rgba(255,255,255,.012)]">
              <summary className="text-[13.5px] font-semibold text-[var(--color-muted)] cursor-pointer hover:text-[var(--color-ink)] transition-colors">
                SEO fields (optional)
              </summary>
              <div className="grid md:grid-cols-2 gap-5 mt-5">
                <div>
                  <label className="label" htmlFor="aa-metatitle">Meta title</label>
                  <input
                    id="aa-metatitle"
                    value={form.metaTitle}
                    onChange={(e) => set('metaTitle', e.target.value)}
                    maxLength={220}
                    className="field"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="aa-ogimage">OG image URL</label>
                  <input
                    id="aa-ogimage"
                    value={form.ogImage}
                    onChange={(e) => set('ogImage', e.target.value)}
                    maxLength={500}
                    placeholder="https://…"
                    className="field tnum"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label" htmlFor="aa-metadesc">Meta description</label>
                  <input
                    id="aa-metadesc"
                    value={form.metaDescription}
                    onChange={(e) => set('metaDescription', e.target.value)}
                    maxLength={400}
                    className="field"
                  />
                </div>
              </div>
            </details>

            <div className="flex flex-wrap gap-3 pt-1">
              <button type="submit" disabled={saving} className="btn btn-profit">
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create article'}
              </button>
              {editingId && (
                <button type="button" onClick={startCreate} className="btn btn-ghost">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>

        {/* List */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-[18px] tracking-tight">All articles</h2>
          <span className="badge badge-line tnum">{articles.length} total</span>
        </div>

        <div className="panel overflow-x-auto">
          {loading ? (
            <p className="mut text-[13.5px] p-6">Loading…</p>
          ) : articles.length === 0 ? (
            <div className="empty-wrap">
              <span className="grid place-items-center w-14 h-14 rounded-2xl bg-[rgba(255,255,255,.04)] border border-[var(--color-line)] mx-auto mb-4 text-[var(--color-muted)]">
                <FileText size={24} />
              </span>
              <h3>No articles yet</h3>
              <p className="text-[13.5px] max-w-md">Create the first one with the editor above.</p>
            </div>
          ) : (
            <table className="data-table min-w-[760px]">
              <thead>
                <tr>
                  <th className="!text-left">Title</th>
                  <th className="!text-left">Slug</th>
                  <th className="!text-left">Read</th>
                  <th className="!text-left">Category</th>
                  <th className="!text-left">Status</th>
                  <th className="!text-left">Updated</th>
                  <th className="!text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <span className="block max-w-[280px] truncate">{article.title}</span>
                      {article.excerpt && (
                        <span className="block max-w-[280px] truncate text-[12px] font-normal text-[var(--color-faint)] mt-0.5">
                          {article.excerpt}
                        </span>
                      )}
                    </td>
                    <td className="tnum whitespace-nowrap">/{article.slug}</td>
                    <td className="tnum whitespace-nowrap">
                      {article.readingMinutes != null ? `${article.readingMinutes} min` : '—'}
                    </td>
                    <td className="whitespace-nowrap">
                      <span className="badge badge-line !text-[10.5px]">
                        {categoryLabel(article.category)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${article.status === 'PUBLISHED' ? 'badge-profit' : 'badge-line'}`}>
                        {article.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="tnum whitespace-nowrap">
                      {formatDate(article.publishedAt || article.updatedAt)}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onTogglePublish(article)}
                          className="btn btn-ghost btn-sm"
                        >
                          {article.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(article.id)}
                          className="btn btn-ghost btn-sm !px-2.5"
                          aria-label="Edit article"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(article.id)}
                          className="btn btn-danger btn-sm !px-2.5"
                          aria-label="Delete article"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
