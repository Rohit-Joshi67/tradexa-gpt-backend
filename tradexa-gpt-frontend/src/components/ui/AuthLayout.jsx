import { Link } from 'react-router-dom'
import { ShieldCheck, TrendingUp, BrainCircuit } from 'lucide-react'
import { Brand } from './Brand'
import Candles from './Candles'

/** Split-screen auth layout: form left, trading visual right. */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-screen !p-0">
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_30%_40%,#000_20%,transparent_75%)]" />
      <div className="bg-glow w-[480px] h-[380px] bg-[rgba(14,203,129,.07)] top-[-120px] left-[-120px]" />

      <div className="relative w-full min-h-screen grid lg:grid-cols-2">
        {/* form side */}
        <div className="flex items-center justify-center px-6 py-14">
          <div className="w-full max-w-[420px]">
            <Link to="/" className="inline-block mb-9" aria-label="Back to home">
              <Brand />
            </Link>
            <h1 className="font-display font-bold tracking-tight text-[30px] md:text-[34px] leading-tight mb-2.5">{title}</h1>
            {subtitle && <p className="text-[var(--color-muted)] text-[14.5px] leading-relaxed mb-8">{subtitle}</p>}
            {children}
            {footer && (
              <p className="mt-7 text-[13.5px] text-[var(--color-muted)] text-center">{footer}</p>
            )}
            <p className="mt-8 flex items-center justify-center gap-2 text-[12px] text-[var(--color-faint)]">
              <ShieldCheck size={13} /> Your data is private — journal entries are never shared.
            </p>
          </div>
        </div>

        {/* visual side */}
        <div className="hidden lg:flex relative items-center justify-center border-l border-[var(--color-line)] bg-[rgba(255,255,255,.012)] overflow-hidden p-12">
          <div className="absolute inset-0 bg-grid opacity-70" />
          <div className="bg-glow w-[420px] h-[420px] bg-[rgba(14,203,129,.08)] top-[10%] right-[-100px]" />
          <div className="relative w-full max-w-[480px]">
            <div className="panel overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,.5)]">
              <div className="panel-head">
                <span className="panel-title tnum">NIFTY 50 · 1D</span>
                <span className="badge badge-profit tnum">+0.84%</span>
              </div>
              <Candles className="w-full h-[240px] block" seed={23} />
              <div className="grid grid-cols-3 divide-x divide-[var(--color-line)] border-t border-[var(--color-line)]">
                {[
                  { l: 'Win rate', v: '68.4%' },
                  { l: 'Net P&L', v: '₹4.29L', c: 'text-[var(--color-profit)]' },
                  { l: 'Trades', v: '1,284' },
                ].map((s) => (
                  <div key={s.l} className="px-5 py-4">
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--color-faint)]">{s.l}</p>
                    <p className={`stat-num tnum text-[20px] mt-1 ${s.c || ''}`}>{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {[
                { icon: TrendingUp, t: 'Journal every trade from Zerodha & Dhan' },
                { icon: BrainCircuit, t: 'AI copilot finds your costliest habits' },
              ].map((r) => (
                <div key={r.t} className="flex items-center gap-3 text-[13.5px] text-[var(--color-muted)]">
                  <span className="grid place-items-center w-8 h-8 rounded-lg bg-[var(--color-profit-dim)] border border-[rgba(14,203,129,.3)] shrink-0">
                    <r.icon size={15} className="text-[var(--color-profit)]" />
                  </span>
                  {r.t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
