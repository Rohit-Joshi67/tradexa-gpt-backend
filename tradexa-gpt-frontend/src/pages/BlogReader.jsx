import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { ArrowLeft, Clock, Tag } from 'lucide-react'
import { getArticle } from '../api/articles'
import { apiErrorMessage } from '../api/client'
import AdSlot, { useAdSenseScript } from '../components/AdSlot'

const AD_SLOT_ID = import.meta.env.VITE_ADSENSE_SLOT_ARTICLE || ''

function setMeta(name, content, attr = 'name') {
  if (!content) return () => {}
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  const created = !el
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  const prev = el.getAttribute('content')
  el.setAttribute('content', content)
  return () => {
    if (created) el.remove()
    else if (prev != null) el.setAttribute('content', prev)
  }
}

function formatDate(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export default function BlogReader() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')

  useAdSenseScript()

  useEffect(() => {
    let alive = true
    setLoading(true)
    setNotFound(false)
    setError('')
    getArticle(slug)
      .then((data) => {
        if (alive) setArticle(data)
      })
      .catch((err) => {
        if (!alive) return
        if (err?.response?.status === 404) setNotFound(true)
        else setError(apiErrorMessage(err))
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [slug])

  // Per-article SEO: title, description, Open Graph.
  useEffect(() => {
    if (!article) return
    const prevTitle = document.title
    document.title = article.metaTitle || `${article.title} | Tradexa GPT`
    const cleanups = [
      setMeta('description', article.metaDescription || article.excerpt),
      setMeta('og:title', article.metaTitle || article.title, 'property'),
      setMeta('og:description', article.metaDescription || article.excerpt, 'property'),
      setMeta('og:type', 'article', 'property'),
    ]
    if (article.ogImage) cleanups.push(setMeta('og:image', article.ogImage, 'property'))
    return () => {
      document.title = prevTitle
      cleanups.forEach((fn) => fn())
    }
  }, [article])

  const html = useMemo(() => {
    if (!article?.content) return ''
    const raw = marked.parse(article.content, { breaks: true })
    return DOMPurify.sanitize(raw)
  }, [article])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <p className="text-neutral-500">Loading article...</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold mb-3">Article not found</h1>
        <p className="text-neutral-400 mb-8">This one may have been moved or unpublished.</p>
        <Link to="/blogs" className="px-8 py-3 rounded-full bg-white text-black font-medium hover:bg-neutral-200 transition-colors">
          Browse all articles
        </Link>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <p className="text-red-400 mb-6">{error || 'Something went wrong.'}</p>
        <Link to="/blogs" className="text-neutral-300 hover:text-white">Back to articles</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <Link to="/blogs" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} /> All articles
        </Link>

        <header className="mb-8">
          {(article.tags?.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2.5 py-1">
                  <Tag size={10} /> {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">{article.title}</h1>
          {article.excerpt && <p className="text-neutral-400 text-lg leading-relaxed mb-5">{article.excerpt}</p>}
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            {article.author && <span className="font-medium text-neutral-300">{article.author}</span>}
            {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
            <span className="inline-flex items-center gap-1">
              <Clock size={14} /> {article.readingMinutes} min read
            </span>
          </div>
        </header>

        <AdSlot slot={AD_SLOT_ID} className="my-8" />

        <article className="article-body" dangerouslySetInnerHTML={{ __html: html }} />

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-neutral-400 mb-4">Want to find leaks like these in your own trades?</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/pricing" className="px-6 py-3 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
              Go Pro — unlock the copilot
            </Link>
            <Link to="/blogs" className="px-6 py-3 rounded-full border border-white/15 text-sm font-medium hover:bg-white/5 transition-colors">
              Read more articles
            </Link>
          </div>
        </div>

        <p className="text-xs text-neutral-600 mt-10 leading-relaxed">
          Disclaimer: articles are educational content, not financial advice. Trading involves risk — read our risk disclaimer before acting on anything here.
        </p>
      </div>
    </div>
  )
}
