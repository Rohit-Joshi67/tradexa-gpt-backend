import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function FloatingDisclaimer() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 z-50 animate-[float-in_.5s_cubic-bezier(.22,.8,.3,1)_both]">
      <div className="bg-[rgba(10,14,20,.92)] backdrop-blur-xl border border-[var(--color-line2)] p-4 rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,.55)] flex items-start gap-3.5 max-w-md">
        <span className="grid place-items-center w-9 h-9 rounded-xl bg-[var(--color-gold-dim)] border border-[rgba(240,185,11,.35)] shrink-0">
          <AlertTriangle size={17} className="text-[var(--color-gold)]" />
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="text-[13.5px] font-bold text-[var(--color-ink)] mb-1">Risk disclaimer</h4>
          <p className="text-[12.5px] text-[var(--color-muted)] leading-relaxed">
            Trading involves significant risk. The tools here are for educational and informational purposes only.
            Never risk money you cannot afford to lose.
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-[var(--color-faint)] hover:text-[var(--color-ink)] transition-colors shrink-0"
          aria-label="Dismiss disclaimer"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
