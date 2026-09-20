import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { ArrowLeft, Clock, Tag, Crown, Eye } from 'lucide-react'
import { getArticle, recordArticleView } from '../api/articles'
import { apiErrorMessage } from '../api/client'
import { categoryBadgeClass, categoryLabel } from '../lib/articles'
import SiteNav from '../components/ui/SiteNav'
import SiteFooter from '../components/ui/SiteFooter'
import Reveal from '../components/ui/Reveal'
import AdSlot, { useAdSenseScript } from '../components/AdSlot'

const AD_SLOT_ID = import.meta.env.VITE_ADSENSE_SLOT_ARTICLE || ''
const MID_AD_SLOT = import.meta.env.VITE_ADSENSE_SLOT_ARTICLE_MID || ''
const BOTTOM_AD_SLOT = import.meta.env.VITE_ADSENSE_SLOT_ARTICLE_BOTTOM || ''

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

/** Split sanitized HTML at a </p> boundary near the middle for a mid-article ad. */
function splitMid(html) {
  const matches = [...html.matchAll(/<\/p>/gi)]
  if (matches.length < 4) return [html, '']
  const mid = matches[Math.floor(matches.length / 2)]
  const cut = mid.index + mid[0].length
  return [html.slice(0, cut), html.slice(cut)]
}

export default function BlogReader() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')

  useAdSenseScript()

  // Record one view per browser session per article. Guarded with
  // sessionStorage so React 18 StrictMode's double-mount doesn't double count.
  useEffect(() => {
    if (!slug) return
    const key = `tradexa:viewed:${slug}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {
      // storage unavailable — still fire once per mount
    }
    recordArticleView(slug)
  }, [slug])

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
      setMeta('article:published_time', article.publishedAt, 'property'),
      setMeta('article:section', categoryLabel(article.category), 'property'),
    ]
    if (article.ogImage) cleanups.push(setMeta('og:image', article.ogImage, 'property'))
    return () => {
      document.title = prevTitle
      cleanups.forEach((fn) => fn())
    }
  }, [article])

  // JSON-LD Article schema for SEO. Injected imperatively so it updates
  // per article without needing react-helmet-async.
  useEffect(() => {
    if (!article) return
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute('data-article-schema', 'true')
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt || '',
      datePublished: article.publishedAt || undefined,
      dateModified: article.updatedAt || article.publishedAt || undefined,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': typeof window !== 'undefined' ? window.location.href : undefined,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Tradexa GPT',
      },
    }
    if (article.author) {
      schema.author = { '@type': 'Person', name: article.author }
    }
    if (article.ogImage) {
      schema.image = [article.ogImage]
    }
    if (article.category) {
      schema.articleSection = categoryLabel(article.category)
    }
    script.textContent = JSON.stringify(schema)
    document.head.appendChild(script)
    return () => {
      script.remove()
    }
  }, [article])

  const html = useMemo(() => {
    if (!article?.content) return ''
    const raw = marked.parse(article.content, { breaks: true })
    return DOMPurify.sanitize(raw)
  }, [article])

  const [htmlTop, htmlBottom] = useMemo(() => splitMid(html), [html])

  if (loading) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <div className="wrap max-w-3xl mx-auto py-32 text-center">
          <p className="mut">Loading article…</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <div className="wrap max-w-2xl mx-auto py-32 text-center">
          <h1 className="font-display font-bold text-[36px] tracking-tight mb-3">Article not found</h1>
          <p className="mut mb-8">This one may have been moved or unpublished.</p>
          <Link to="/blogs" className="btn btn-profit">
            Browse all articles
          </Link>
        </div>
        <SiteFooter />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <div className="wrap max-w-2xl mx-auto py-32 text-center">
          <div className="alert alert-error mb-6">{error || 'Something went wrong.'}</div>
          <Link to="/blogs" className="btn btn-ghost">
            <ArrowLeft size={16} /> Back to articles
          </Link>
        </div>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <SiteNav />

      <article className="relative overflow-hidden">
        <div className="bg-glow w-[560px] h-[320px] bg-[rgba(14,203,129,.06)] -top-24 left-1/2 -translate-x-1/2" />
        <div className="wrap max-w-3xl mx-auto pt-[calc(68px+clamp(2.5rem,6vw,4.5rem))] pb-10 relative">
          <Reveal>
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors mb-8"
            >
              <ArrowLeft size={15} /> All articles
            </Link>

            <div className="flex flex-wrap gap-2 mb-5">
              {article.category && (
                <span className={`badge ${categoryBadgeClass(article.category)} !text-[10.5px]`}>
                  {categoryLabel(article.category)}
                </span>
              )}
              {article.tags?.map((tag) => (
                <span key={tag} className="badge badge-line !text-[10.5px]">
                  <Tag size={10} /> {tag}
                </span>
              ))}
            </div>

            <h1 className="font-display font-bold tracking-tight text-[34px] md:text-[46px] leading-[1.12] mb-5">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="lede mb-6">{article.excerpt}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13.5px] text-[var(--color-faint)] pb-8 border-b border-[var(--color-line)]">
              {article.author && <span className="font-semibold text-[var(--color-muted)]">{article.author}</span>}
              {article.publishedAt && <span className="tnum">{formatDate(article.publishedAt)}</span>}
              {article.readingMinutes != null && (
                <span className="inline-flex items-center gap-1.5 tnum">
                  <Clock size={14} /> {article.readingMinutes} min read
                </span>
              )}
              {article.viewCount != null && (
                <span className="inline-flex items-center gap-1.5 tnum">
                  <Eye size={14} /> {new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(article.viewCount)} reads
                </span>
              )}
            </div>
          </Reveal>
        </div>
      </article>

      <main className="wrap max-w-3xl mx-auto pb-24">
        <AdSlot slot={AD_SLOT_ID} className="mb-10" />

        <div className="article-body" dangerouslySetInnerHTML={{ __html: htmlTop }} />

        {htmlBottom && (
          <>
            <AdSlot slot={MID_AD_SLOT} className="my-10" />
            <div className="article-body" dangerouslySetInnerHTML={{ __html: htmlBottom }} />
          </>
        )}

        <AdSlot slot={BOTTOM_AD_SLOT} className="my-10" />

        <div className="panel mt-12 overflow-hidden">
          <div className="panel-body !p-8 md:!p-10 text-center relative">
            <div className="bg-glow w-[320px] h-[200px] bg-[rgba(14,203,129,.08)] -top-16 left-1/2 -translate-x-1/2" />
            <span className="relative grid place-items-center w-12 h-12 rounded-2xl bg-[var(--color-gold-dim)] border border-[rgba(240,185,11,.35)] mx-auto mb-5">
              <Crown size={22} className="text-[var(--color-gold)]" />
            </span>
            <h2 className="relative font-display font-bold text-[22px] tracking-tight mb-2.5">
              Want to find leaks like these in your own trades?
            </h2>
            <p className="relative mut text-[14.5px] mb-7 max-w-md mx-auto">
              The Tradexa-GPT copilot reads your journal and names the habits costing you money.
            </p>
            <div className="relative flex flex-wrap justify-center gap-3">
              <Link to="/pricing" className="btn btn-profit">
                Go Pro — unlock the copilot
              </Link>
              <Link to="/blogs" className="btn btn-ghost">
                Read more articles
              </Link>
            </div>
          </div>
        </div>

        <p className="text-[12px] text-[var(--color-faint)] mt-10 leading-relaxed">
          Disclaimer: articles are educational content, not financial advice. Trading involves risk — read our risk disclaimer before acting on anything here.
        </p>
      </main>

      <SiteFooter />
    </div>
  )
}
