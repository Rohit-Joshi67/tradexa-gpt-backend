import { Link } from 'react-router-dom'
import { Brand } from './Brand'

const COLS = [
  {
    title: 'Product',
    links: [
      { to: '/tradexa-gpt', label: 'Tradexa-GPT' },
      { to: '/tools/edge-validator', label: 'Edge Validator' },
      { to: '/dashboard', label: 'Trade Journal' },
      { to: '/pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { to: '/blogs', label: 'Finance Blogs' },
      { to: '/vision', label: 'Our Vision' },
      { to: '/about', label: 'About Us' },
      { to: '/faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '/privacy', label: 'Privacy Policy' },
      { to: '/terms', label: 'Terms of Service' },
      { to: '/risk-disclaimer', label: 'Risk Disclaimer' },
      { to: '/contact', label: 'Contact Us' },
    ],
  },
]

export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-line)] bg-[#040506]">
      <div className="wrap py-16 grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Brand />
          <p className="text-[var(--color-muted)] text-[14.5px] leading-relaxed mt-5 max-w-xs">
            The quant copilot for disciplined traders. Journal, analytics and an AI coach that finds your edge leaks.
          </p>
          <div className="flex items-center gap-2 mt-6">
            <span className="badge badge-line"><span className="dot live text-[var(--color-profit)]" /> Systems live</span>
          </div>
        </div>
        {COLS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h4 className="font-display font-semibold text-[13px] uppercase tracking-[0.14em] text-[var(--color-faint)] mb-5">
              {col.title}
            </h4>
            <ul className="space-y-3">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-[14.5px] text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-[var(--color-line)]">
        <div className="wrap py-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <p className="text-[12.5px] text-[var(--color-faint)]">© 2026 Tradexa GPT. All rights reserved.</p>
          <p className="text-[12.5px] text-[var(--color-faint)] max-w-2xl md:text-right leading-relaxed">
            Educational tools only — nothing here is financial advice. Trading involves risk; never trade money you can't afford to lose.
          </p>
        </div>
      </div>
    </footer>
  )
}
