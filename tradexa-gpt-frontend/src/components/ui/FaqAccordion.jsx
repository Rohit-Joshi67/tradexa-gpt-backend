import { useState } from 'react'
import { Plus } from 'lucide-react'
import Reveal from './Reveal'

export default function FaqAccordion({ items, className = '' }) {
  const [open, setOpen] = useState(0)
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {items.map((it, i) => {
        const isOpen = open === i
        return (
          <Reveal key={i} delay={Math.min(i * 60, 240)}>
            <div className={`panel overflow-hidden transition-colors ${isOpen ? '!border-[var(--color-line2)]' : ''}`}>
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 cursor-pointer"
              >
                <span className="font-display font-semibold text-[15.5px] tracking-tight">{it.q}</span>
                <span
                  className={`grid place-items-center w-8 h-8 rounded-full border border-[var(--color-line2)] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-45 bg-[var(--color-profit-dim)] border-[rgba(14,203,129,.4)]' : ''}`}
                >
                  <Plus size={15} className={isOpen ? 'text-[var(--color-profit)]' : 'text-[var(--color-muted)]'} />
                </span>
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-[14.5px] text-[var(--color-muted)] leading-relaxed">{it.a}</p>
                </div>
              </div>
            </div>
          </Reveal>
        )
      })}
    </div>
  )
}
