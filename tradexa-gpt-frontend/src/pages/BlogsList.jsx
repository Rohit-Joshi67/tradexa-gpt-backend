import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Clock, Eye, Search, TrendingUp, X } from 'lucide-react'
import { getTopArticles, listArticles } from '../api/articles'
import { apiErrorMessage } from '../api/client'
import { CATEGORIES, categoryBadgeClass, categoryLabel } from '../lib/articles'
import SiteNav from '../components/ui/SiteNav'
import SiteFooter from '../components/ui/SiteFooter'
import PageHero from '../components/ui/PageHero'
import SectionHead from '../components/ui/SectionHead'
import Reveal from '../components/ui/Reveal'
import EmptyState from '../components/EmptyState'
import AdSlot, { useAdSenseScript } from '../components/AdSlot'

const TOP_AD_SLOT = import.meta.env.VITE_ADSENSE_SLOT_BLOGS_TOP || ''
const BOTTOM_AD_SLOT = import.meta.env.VITE_ADSENSE_SLOT_BLOGS_BOTTOM || ''
const PAGE_SIZE = 9

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

const compactNum = new Intl.NumberFormat('en-IN', { notation: 'compact' })
function formatViews(n) {
  if (n == null) return '0'
  try {
    return compactNum.format(n)
  } catch {
    return String(n)
  }
}

function Meta({ article }) {
  return (
    <div className="mt-auto flex items-center gap-3 text-[12px] text-[var(--color-faint)]">
      {article.author && <span className="font-medium text-[var(--color-muted)] truncate">{article.author}</span>}
      {article.publishedAt && <span className="tnum shrink-0">{formatDate(article.publishedAt)}</span>}
      {article.readingMinutes != null && (
        <span className="inline-flex items-center gap-1 shrink-0 tnum">
          <Clock size={12} /> {article.readingMinutes} min
        </span>
      )}
      <span className="inline-flex items-center gap-1 shrink-0 tnum">
        <Eye size={12} /> {formatViews(article.viewCount)}
      </span>
      <ArrowRight size={15} className="ml-auto shrink-0 text-[var(--color-faint)] group-hover:text-[var(--color-profit)] group-hover:translate-x-1 transition-all" />
    </div>
  )
}

function ArticleCard({ article, index = 0 }) {
  return (
    <Reveal delay={Math.min(index * 60, 300)}>
      <Link
        to={`/blogs/${article.slug}`}
        className="panel group flex flex-col h-full p-6 hover:!border-[rgba(14,203,129,.35)] hover:-translate-y-1 transition-all duration-300"
      >
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`badge ${categoryBadgeClass(article.category)} !text-[10.5px]`}>
            {categoryLabel(article.category)}
          </span>
          {article.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="badge badge-line !text-[10.5px]">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="font-display font-bold text-[19px] leading-snug tracking-tight mb-2.5 group-hover:text-[var(--color-profit)] transition-colors">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-[var(--color-muted)] text-[13.5px] leading-relaxed mb-5 line-clamp-3">
            {article.excerpt}
          </p>
        )}
        <Meta article={article} />
      </Link>
    </Reveal>
  )
}

function MostReadCard({ article, rank }) {
  return (
    <Link
      to={`/blogs/${article.slug}`}
      className="panel group flex items-stretch gap-4 p-5 hover:!border-[rgba(240,185,11,.35)] transition-all duration-300"
    >
      <span className="font-display font-bold text-[34px] leading-none text-[var(--color-gold)]/80 tnum shrink-0 w-10 text-center">
        {rank}
      </span>
      <span className="min-w-0 flex flex-col">
        <span className={`badge ${categoryBadgeClass(article.category)} !text-[10px] self-start mb-2`}>
          {categoryLabel(article.category)}
        </span>
        <span className="font-display font-semibold text-[15px] leading-snug tracking-tight mb-2 group-hover:text-[var(--color-profit)] transition-colors line-clamp-2">
          {article.title}
        </span>
        <span className="mt-auto inline-flex items-center gap-1.5 text-[11.5px] text-[var(--color-faint)] tnum">
          <Eye size={12} /> {formatViews(article.viewCount)} reads
        </span>
      </span>
    </Link>
  )
}

function PageNumbers({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  const windowSize = 5
  let start = Math.max(0, Math.min(page - 2, totalPages - windowSize))
  const pages = []
  for (let i = start; i < Math.min(totalPages, start + windowSize); i++) pages.push(i)
  return (
    <div className="flex items-center gap-1.5">
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-label={`Go to page ${p + 1}`}
          aria-current={p === page ? 'page' : undefined}
          className={`min-w-9 h-9 px-2 rounded-lg text-[13px] font-semibold tnum transition-colors ${
            p === page
              ? 'bg-[var(--color-profit-dim)] text-[var(--color-profit)] border border-[rgba(14,203,129,.4)]'
              : 'text-[var(--color-muted)] hover:text-[var(--color-ink)] border border-transparent hover:border-[var(--color-line)]'
          }`}
        >
          {p + 1}
        </button>
      ))}
    </div>
  )
}

export default function BlogsList() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [activeTag, setActiveTag] = useState('')

  // Main paginated grid ("All articles")
  const [articles, setArticles] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Homepage sections (default view only)
  const [top, setTop] = useState([])
  const [latest, setLatest] = useState([])
  const [byCategory, setByCategory] = useState({})
  const [sectionsLoading, setSectionsLoading] = useState(true)

  const gridRef = useRef(null)
  useAdSenseScript()

  useEffect(() => {
    document.title = 'Finance Blogs | Tradexa GPT'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', 'Free trading and finance articles — trading, investing, business case studies, and personal finance from Tradexa GPT.')
  }, [])

  // Homepage sections: most read, latest 10, 3 latest per category.
  useEffect(() => {
    let alive = true
    setSectionsLoading(true)
    const jobs = [
      getTopArticles(5).then((d) => ({ kind: 'top', value: d?.data || d?.content || d || [] })),
      listArticles({ page: 0, size: 10 }).then((d) => ({ kind: 'latest', value: d?.content || [] })),
      ...CATEGORIES.map((c) =>
        listArticles({ page: 0, size: 3, category: c.id })
          .then((d) => ({ kind: `cat:${c.id}`, value: d?.content || [] }))
          .catch(() => ({ kind: `cat:${c.id}`, value: [] })),
      ),
    ]
    Promise.allSettled(jobs).then((results) => {
      if (!alive) return
      const byCat = {}
      for (const r of results) {
        if (r.status !== 'fulfilled') continue
        const { kind, value } = r.value || {}
        if (kind === 'top') setTop(Array.isArray(value) ? value : [])
        else if (kind === 'latest') setLatest(value)
        else if (kind?.startsWith('cat:')) byCat[kind.slice(4)] = value
      }
      setByCategory(byCat)
      setSectionsLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  // Main grid: server-side category/tag filter + pagination.
  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    listArticles({
      page,
      size: PAGE_SIZE,
      tag: activeTag || undefined,
      category: activeCategory || undefined,
    })
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
  }, [page, activeTag, activeCategory])

  const allTags = useMemo(
    () => [...new Set(articles.flatMap((a) => a.tags || []))].slice(0, 12),
    [articles],
  )

  const q = query.trim().toLowerCase()
  const visible = useMemo(() => {
    if (!q) return articles
    return articles.filter((a) =>
      [a.title, a.excerpt, a.author, (a.tags || []).join(' ')]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [articles, q])

  const isDefaultView = !activeCategory && !activeTag && !q

  function pickCategory(id) {
    setActiveCategory((prev) => (prev === id ? '' : id))
    setPage(0)
  }

  function pickTag(tag) {
    setActiveTag(tag)
    setPage(0)
  }

  function viewAllInCategory(id) {
    setActiveCategory(id)
    setActiveTag('')
    setPage(0)
    requestAnimationFrame(() => {
      gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function clearFilters() {
    setQuery('')
    setActiveCategory('')
    setActiveTag('')
    setPage(0)
  }

  return (
    <div className="min-h-screen">
      <SiteNav />

      <PageHero
        kicker="Learn"
        title="Finance library"
        lede="Free articles on trading, investing, business case studies, and personal finance. New drops every week."
      >
        <div className="relative w-full max-w-md mx-auto">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-faint)] pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            aria-label="Search articles"
            className="field !pl-11 !pr-10 !rounded-full text-center"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-faint)] hover:text-[var(--color-ink)] transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </PageHero>

      <AdSlot slot={TOP_AD_SLOT} className="wrap mb-10" />

      <main className="wrap pb-24">
        {/* Category filter tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6" role="tablist" aria-label="Filter by category">
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === ''}
            onClick={() => pickCategory('')}
            className={`badge cursor-pointer transition-colors ${activeCategory === '' ? 'badge-profit' : 'badge-line hover:!border-[#3a4450]'}`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === c.id}
              onClick={() => pickCategory(c.id)}
              className={`badge cursor-pointer transition-colors ${activeCategory === c.id ? 'badge-profit' : 'badge-line hover:!border-[#3a4450]'}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <button
              type="button"
              onClick={() => pickTag('')}
              className={`badge cursor-pointer transition-colors ${activeTag === '' ? 'badge-gold' : 'badge-line hover:!border-[#3a4450]'}`}
            >
              All tags
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => pickTag(activeTag === tag ? '' : tag)}
                className={`badge cursor-pointer transition-colors ${activeTag === tag ? 'badge-gold' : 'badge-line hover:!border-[#3a4450]'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Homepage sections — default view only */}
        {isDefaultView && (
          <>
            {/* Most read */}
            <section aria-label="Most read articles" className="mb-16 md:mb-20">
              <SectionHead
                align="left"
                kicker={{ text: 'Trending', gold: true }}
                title="Most read"
                lede="The pieces readers keep coming back to, ranked by reads."
              />
              {sectionsLoading ? (
                <p className="mut py-8">Loading most read…</p>
              ) : top.length === 0 ? (
                <p className="mut py-8">No reads recorded yet — be the first.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {top.slice(0, 5).map((article, i) => (
                    <Reveal key={article.id || article.slug} delay={Math.min(i * 70, 280)}>
                      <MostReadCard article={article} rank={i + 1} />
                    </Reveal>
                  ))}
                </div>
              )}
            </section>

            {/* Latest 10 */}
            <section aria-label="Latest articles" className="mb-16 md:mb-20">
              <SectionHead
                align="left"
                kicker="Fresh"
                title="Latest articles"
                lede="The 10 newest drops from the editorial desk."
              />
              {sectionsLoading ? (
                <p className="mut py-8">Loading latest articles…</p>
              ) : latest.length === 0 ? (
                <p className="mut py-8">Nothing published yet — check back soon.</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {latest.map((article, i) => (
                    <ArticleCard key={article.id || article.slug} article={article} index={i} />
                  ))}
                </div>
              )}
            </section>

            {/* Browse by category */}
            <section aria-label="Browse by category" className="mb-16 md:mb-20">
              <SectionHead
                align="left"
                kicker="Sections"
                title="Browse by category"
                lede="Pick your lane — every article is filed under one of four desks."
              />
              {CATEGORIES.map((c) => {
                const items = byCategory[c.id] || []
                return (
                  <div key={c.id} className="mb-12 last:mb-0">
                    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
                      <div>
                        <h3 className="font-display font-bold text-[20px] tracking-tight flex items-center gap-3">
                          <span className={`badge ${c.badge} !text-[11px]`}>{c.label}</span>
                        </h3>
                        <p className="mut text-[13.5px] mt-1.5">{c.blurb}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => viewAllInCategory(c.id)}
                        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-profit)] hover:underline"
                      >
                        View all <ArrowRight size={14} />
                      </button>
                    </div>
                    {sectionsLoading ? (
                      <p className="mut py-6">Loading…</p>
                    ) : items.length === 0 ? (
                      <p className="mut text-[13.5px] py-6">First {c.label.toLowerCase()} pieces are in the works.</p>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {items.map((article, i) => (
                          <ArticleCard key={article.id || article.slug} article={article} index={i} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </section>
          </>
        )}

        {/* All articles — paginated grid */}
        <section aria-label="All articles" ref={gridRef} className="scroll-mt-24">
          <SectionHead
            align="left"
            kicker="Archive"
            title={activeCategory ? `${categoryLabel(activeCategory)} articles` : 'All articles'}
            lede={
              activeCategory
                ? CATEGORIES.find((c) => c.id === activeCategory)?.blurb
                : 'The full archive — filter by category or tag, or search.'
            }
          />

          {loading && <p className="mut text-center py-12">Loading articles…</p>}
          {error && <div className="alert alert-error max-w-xl mx-auto">{error}</div>}

          {!loading && !error && visible.length === 0 && (
            <EmptyState
              icon={<BookOpen size={26} />}
              title={q || activeTag || activeCategory ? 'No articles match.' : 'No articles yet.'}
              body={q || activeTag || activeCategory ? 'Try a different search term, tag, or category.' : 'The editorial desk is warming up — check back soon.'}
            >
              {(q || activeTag || activeCategory) && (
                <button type="button" onClick={clearFilters} className="btn btn-ghost btn-sm">
                  Clear filters
                </button>
              )}
            </EmptyState>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map((article, i) => (
              <ArticleCard key={article.id || article.slug} article={article} index={i} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav aria-label="Article pages" className="flex items-center justify-center gap-4 mt-14 flex-wrap">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="btn btn-ghost btn-sm"
              >
                Previous
              </button>
              <PageNumbers page={page} totalPages={totalPages} onChange={setPage} />
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="btn btn-ghost btn-sm"
              >
                Next
              </button>
            </nav>
          )}
          {totalPages > 1 && (
            <p className="text-center text-[12.5px] text-[var(--color-faint)] tnum mt-4">
              Page {page + 1} of {totalPages}
            </p>
          )}
        </section>

        {/* Most-read callout */}
        {!isDefaultView && top.length > 0 && (
          <section aria-label="Most read" className="mt-16 md:mt-20">
            <div className="flex items-center gap-2.5 mb-6">
              <TrendingUp size={17} className="text-[var(--color-gold)]" />
              <h2 className="font-display font-bold text-[20px] tracking-tight">Most read right now</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {top.slice(0, 3).map((article, i) => (
                <MostReadCard key={article.id || article.slug} article={article} rank={i + 1} />
              ))}
            </div>
          </section>
        )}

        <AdSlot slot={BOTTOM_AD_SLOT} className="mt-14" />
      </main>

      <SiteFooter />
    </div>
  )
}
