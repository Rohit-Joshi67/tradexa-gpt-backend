import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, Clock, Tag } from 'lucide-react'
import { listArticles } from '../api/articles'
import { apiErrorMessage } from '../api/client'

function formatDate(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export default function BlogsList() {
  const [articles, setArticles] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Finance Blogs | Tradexa GPT'
    let meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', 'Free trading articles on risk, discipline, and trading psychology from Tradexa GPT.')
  }, [])

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    listArticles({ page, size: 9 })
      .then((data) => {
        if (!alive) return
        setArticles(data?.content || [])
        setTotalPages(data?.totalPages || 0)
      })
      .catch((err) => {
        if (!alive) return
        setError(apiErrorMessage(err))
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [page])

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} /> Back to home
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
              <BookOpen size={20} className="text-indigo-300" />
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Finance Blogs</h1>
          </div>
          <p className="text-neutral-400 text-lg max-w-2xl">
            Free articles on risk, discipline, and trading psychology. New drops every week.
          </p>
        </motion.div>

        {loading && <p className="text-neutral-500 mt-12">Loading articles...</p>}
        {error && <p className="text-red-400 mt-12">{error}</p>}

        {!loading && !error && articles.length === 0 && (
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
            <p className="text-neutral-300 text-lg font-medium">No articles yet.</p>
            <p className="text-neutral-500 mt-2">The editorial desk is warming up — check back soon.</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {articles.map((article, i) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.3) }}
            >
              <Link
                to={`/blogs/${article.slug}`}
                className="block h-full rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all"
              >
                {(article.tags?.length > 0) && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2.5 py-1">
                        <Tag size={10} /> {tag}
                      </span>
                    ))}
                  </div>
                )}
                <h2 className="text-xl font-bold leading-snug mb-2">{article.title}</h2>
                {article.excerpt && <p className="text-neutral-400 text-sm leading-relaxed mb-4 line-clamp-3">{article.excerpt}</p>}
                <div className="flex items-center gap-4 text-xs text-neutral-500 mt-auto">
                  {article.author && <span>{article.author}</span>}
                  {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} /> {article.readingMinutes} min read
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-5 py-2.5 rounded-full border border-white/15 text-sm font-medium disabled:opacity-40 hover:bg-white/5 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-neutral-500">
              Page {page + 1} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-5 py-2.5 rounded-full border border-white/15 text-sm font-medium disabled:opacity-40 hover:bg-white/5 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
