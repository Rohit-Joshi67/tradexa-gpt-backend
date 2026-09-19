import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
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

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  author: '',
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
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 170)
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
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Article CMS</h1>
            <p className="text-neutral-400 mt-1">Draft, edit, and publish free articles.</p>
          </div>
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"
          >
            <Plus size={16} /> New article
          </button>
        </div>

        {notice && <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{notice}</div>}
        {error && <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        {/* Editor */}
        <form onSubmit={onSave} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 mb-10 space-y-4">
          <h2 className="text-lg font-bold">{editingId ? 'Edit article' : 'New article'}</h2>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Title *</label>
            <input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              required
              maxLength={220}
              placeholder="Why Position Sizing Beats Stock Picking"
              className="w-full rounded-xl bg-neutral-900 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Slug (auto from title if blank)</label>
              <div className="flex gap-2">
                <input
                  value={form.slug}
                  onChange={(e) => set('slug', e.target.value)}
                  maxLength={180}
                  placeholder={slugSuggestion(form.title) || 'my-article-slug'}
                  className="flex-1 rounded-xl bg-neutral-900 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60"
                />
                <button
                  type="button"
                  onClick={() => set('slug', slugSuggestion(form.title))}
                  className="px-3 py-2 rounded-xl border border-white/15 text-xs font-medium hover:bg-white/5"
                >
                  Auto
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Author</label>
              <input
                value={form.author}
                onChange={(e) => set('author', e.target.value)}
                maxLength={120}
                placeholder="Tradexa Editorial"
                className="w-full rounded-xl bg-neutral-900 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Excerpt</label>
            <input
              value={form.excerpt}
              onChange={(e) => set('excerpt', e.target.value)}
              maxLength={400}
              placeholder="One-line summary shown on cards and in search results."
              className="w-full rounded-xl bg-neutral-900 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Content (Markdown) *</label>
            <textarea
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
              required
              rows={14}
              placeholder={'# Heading\n\nWrite in **Markdown**. Rendered safely on the reader page.'}
              className="w-full rounded-xl bg-neutral-900 border border-white/10 px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-indigo-500/60"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Tags (comma-separated)</label>
              <input
                value={form.tags}
                onChange={(e) => set('tags', e.target.value)}
                maxLength={300}
                placeholder="risk, psychology"
                className="w-full rounded-xl bg-neutral-900 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className="w-full rounded-xl bg-neutral-900 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
          </div>

          <details className="rounded-xl border border-white/10 px-4 py-3">
            <summary className="text-sm font-medium text-neutral-300 cursor-pointer">SEO fields (optional)</summary>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Meta title</label>
                <input value={form.metaTitle} onChange={(e) => set('metaTitle', e.target.value)} maxLength={220}
                  className="w-full rounded-xl bg-neutral-900 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">OG image URL</label>
                <input value={form.ogImage} onChange={(e) => set('ogImage', e.target.value)} maxLength={500} placeholder="https://..."
                  className="w-full rounded-xl bg-neutral-900 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Meta description</label>
                <input value={form.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} maxLength={400}
                  className="w-full rounded-xl bg-neutral-900 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60" />
              </div>
            </div>
          </details>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-full bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Save changes' : 'Create article'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={startCreate}
                className="px-6 py-2.5 rounded-full border border-white/15 text-sm font-medium hover:bg-white/5"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* List */}
        <h2 className="text-lg font-bold mb-4">All articles</h2>
        {loading && <p className="text-neutral-500">Loading...</p>}
        {!loading && articles.length === 0 && <p className="text-neutral-500">No articles yet — create the first one above.</p>}
        <div className="space-y-3">
          {articles.map((article) => (
            <div key={article.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{article.title}</p>
                <p className="text-xs text-neutral-500 mt-1">
                  /{article.slug} · {article.readingMinutes} min
                  {article.publishedAt && ` · published ${new Date(article.publishedAt).toLocaleDateString('en-IN')}`}
                </p>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest rounded-full px-2.5 py-1 border ${
                article.status === 'PUBLISHED'
                  ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
                  : 'text-neutral-400 bg-white/5 border-white/15'
              }`}>
                {article.status}
              </span>
              <button
                type="button"
                onClick={() => onTogglePublish(article)}
                className="px-4 py-1.5 rounded-full border border-white/15 text-xs font-medium hover:bg-white/5"
              >
                {article.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
              </button>
              <button
                type="button"
                onClick={() => startEdit(article.id)}
                className="p-2 rounded-full border border-white/15 hover:bg-white/5"
                aria-label="Edit"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(article.id)}
                className="p-2 rounded-full border border-red-500/30 text-red-300 hover:bg-red-500/10"
                aria-label="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
