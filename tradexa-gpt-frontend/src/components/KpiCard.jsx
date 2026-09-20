const TONES = {
  profit: {
    icon: 'bg-[var(--color-profit-dim)] text-[var(--color-profit)] border-[rgba(14,203,129,.3)]',
    value: 'text-[var(--color-profit)]',
  },
  loss: {
    icon: 'bg-[var(--color-loss-dim)] text-[var(--color-loss)] border-[rgba(246,70,93,.3)]',
    value: 'text-[var(--color-loss)]',
  },
  gold: {
    icon: 'bg-[var(--color-gold-dim)] text-[var(--color-gold)] border-[rgba(240,185,11,.35)]',
    value: 'text-[var(--color-gold)]',
  },
  neutral: {
    icon: 'bg-[rgba(255,255,255,.04)] text-[var(--color-muted)] border-[var(--color-line2)]',
    value: 'text-[var(--color-ink)]',
  },
}

export default function KpiCard({ label, value, hint, tone = 'neutral', icon }) {
  const t = TONES[tone] || TONES.neutral
  return (
    <article className="panel p-5 group">
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <p className="text-[11.5px] font-bold uppercase tracking-[0.13em] text-[var(--color-faint)]">{label}</p>
        {icon && (
          <span className={`grid place-items-center w-9 h-9 rounded-xl border transition-transform group-hover:scale-105 ${t.icon}`}>
            {icon}
          </span>
        )}
      </div>
      <p className={`stat-num tnum text-[32px] leading-none mb-2 ${t.value}`}>{value}</p>
      {hint && <p className="text-[12.5px] text-[var(--color-muted)] leading-relaxed">{hint}</p>}
    </article>
  )
}
