/**
 * Blog category definitions shared across the blog homepage, article
 * reader, and admin CMS. Backend stores the enum string in ArticleDTO.category.
 */
export const CATEGORIES = [
  {
    id: 'TRADING',
    label: 'Trading',
    blurb: 'Setups, risk management, and the psychology of live markets.',
    badge: 'badge-profit',
  },
  {
    id: 'INVESTING',
    label: 'Investing',
    blurb: 'Long-term wealth building, portfolios, and market cycles.',
    badge: 'badge-info',
  },
  {
    id: 'BUSINESS_CASE_STUDIES',
    label: 'Business Case Studies',
    blurb: 'How real companies won, lost, and what traders can steal from them.',
    badge: 'badge-gold',
  },
  {
    id: 'PERSONAL_FINANCE',
    label: 'Personal Finance',
    blurb: 'Money basics: budgeting, saving, and beginner-friendly finance.',
    badge: 'badge-line',
  },
]

const BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))

export function getCategory(id) {
  return (id && BY_ID[id]) || null
}

/** Human label for a stored category id; falls back gracefully. */
export function categoryLabel(id) {
  if (!id) return 'Article'
  return getCategory(id)?.label || 'Article'
}

/** Badge CSS class for a stored category id; falls back to neutral. */
export function categoryBadgeClass(id) {
  return getCategory(id)?.badge || 'badge-line'
}
