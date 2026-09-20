import { AlertTriangle } from 'lucide-react'

const TEXT = 'RISK DISCLAIMER: TRADING INVOLVES SIGNIFICANT RISK. FOR EDUCATIONAL PURPOSES ONLY. DO NOT RISK MONEY YOU CANNOT AFFORD TO LOSE.'

export default function HorizontalDisclaimer() {
  const items = Array.from({ length: 8 })
  return (
    <div className="w-full bg-[var(--color-loss-dim)] border-y border-[rgba(246,70,93,.25)] py-3 overflow-hidden" aria-label="Risk disclaimer">
      <div className="marquee-track">
        {items.map((_, i) => (
          <span key={i} className="flex items-center gap-3 text-[12px] font-bold uppercase text-[var(--color-loss)] tracking-[0.18em] whitespace-nowrap px-6 shrink-0">
            <AlertTriangle size={14} className="shrink-0" />
            {TEXT}
          </span>
        ))}
        {items.map((_, i) => (
          <span key={`b-${i}`} aria-hidden="true" className="flex items-center gap-3 text-[12px] font-bold uppercase text-[var(--color-loss)] tracking-[0.18em] whitespace-nowrap px-6 shrink-0">
            <AlertTriangle size={14} className="shrink-0" />
            {TEXT}
          </span>
        ))}
      </div>
    </div>
  )
}
