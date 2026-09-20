import { Link } from 'react-router-dom'

export function BrandMark({ size = 34 }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, borderRadius: size * 0.32, fontSize: size * 0.55 }}
      className="grid place-items-center font-display font-bold text-[#04120c] shrink-0"
    >
      <span
        className="grid place-items-center w-full h-full"
        style={{
          borderRadius: 'inherit',
          background: 'linear-gradient(135deg, #34d399 0%, #0ecb81 55%, #0a9b66 100%)',
          boxShadow: '0 4px 16px rgba(14,203,129,.35)',
        }}
      >
        T
      </span>
    </span>
  )
}

export function Brand({ size = 34, compact = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Tradexa GPT home">
      <BrandMark size={size} />
      {!compact && (
        <span className="font-display font-bold text-[17px] tracking-tight text-[var(--color-ink)]">
          Tradexa <span className="text-[var(--color-profit)]">GPT</span>
        </span>
      )}
    </Link>
  )
}
