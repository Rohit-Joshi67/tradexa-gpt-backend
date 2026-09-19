const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

export function formatMoney(value) {
  const number = Number(value ?? 0)
  if (Number.isNaN(number)) return '₹0.00'
  return currency.format(number)
}

export function formatNumber(value, digits = 2) {
  const number = Number(value ?? 0)
  if (Number.isNaN(number)) return '0'
  return number.toLocaleString('en-IN', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })
}

export function formatPercent(value) {
  return `${formatNumber(value, 1)}%`
}

/**
 * Format an integer paise amount as rupees with Indian digit grouping.
 * e.g. formatPaise(199900) -> "₹1,999"
 */
export function formatPaise(paise) {
  const number = Number(paise ?? 0)
  if (Number.isNaN(number)) return '₹0'
  return (number / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  })
}

export function pnlClass(value) {
  const number = Number(value ?? 0)
  if (number > 0) return 'positive'
  if (number < 0) return 'negative'
  return 'neutral'
}

export function toDateTimeLocal(iso) {
  if (!iso) return ''
  return String(iso).slice(0, 16)
}

export function fromDateTimeLocal(value) {
  if (!value) return null
  return value.length === 16 ? `${value}:00` : value
}

export function formatDate(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  })
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
