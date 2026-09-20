const DEFAULT_ITEMS = [
  { s: 'NIFTY 50', p: '24,812.30', c: 0.84 },
  { s: 'BANKNIFTY', p: '52,140.75', c: -0.32 },
  { s: 'SENSEX', p: '81,224.10', c: 0.61 },
  { s: 'RELIANCE', p: '2,984.55', c: 1.24 },
  { s: 'HDFCBANK', p: '1,642.20', c: -0.18 },
  { s: 'TCS', p: '4,102.90', c: 0.47 },
  { s: 'INFY', p: '1,876.35', c: -0.92 },
  { s: 'BTC/USD', p: '97,420', c: 2.10 },
  { s: 'GOLD', p: '2,914.20', c: 0.35 },
  { s: 'USD/INR', p: '86.42', c: 0.08 },
]

/** Infinite CSS ticker tape. Pure CSS animation — zero JS cost after render. */
export default function TickerTape({ items = DEFAULT_ITEMS, className = '' }) {
  const row = (key) => (
    <div key={key} className="flex items-center shrink-0" aria-hidden={key === 'b'}>
      {items.map((it) => (
        <span key={`${key}-${it.s}`} className="flex items-center gap-2 px-7 whitespace-nowrap">
          <span className="font-display font-semibold text-[12.5px] tracking-[0.12em] text-[var(--color-faint)]">{it.s}</span>
          <span className="tnum font-mono text-[13px] text-[var(--color-muted)]">{it.p}</span>
          <span className={`tnum font-mono text-[12.5px] font-semibold ${it.c >= 0 ? 'tick-up' : 'tick-down'}`}>
            {it.c >= 0 ? '▲' : '▼'} {Math.abs(it.c).toFixed(2)}%
          </span>
        </span>
      ))}
    </div>
  )
  return (
    <div className={`marquee border-y border-[var(--color-line)] bg-[rgba(255,255,255,.015)] py-3 ${className}`} role="presentation">
      <div className="marquee-track">
        {row('a')}
        {row('b')}
      </div>
    </div>
  )
}
