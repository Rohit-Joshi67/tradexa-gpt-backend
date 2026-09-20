import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { usePlan } from '../../context/PlanContext'
import { Brand } from './Brand'

const LINKS = [
  { to: '/tradexa-gpt', label: 'Tradexa-GPT' },
  { to: '/tools/edge-validator', label: 'Edge Validator' },
  { to: '/blogs', label: 'Blogs' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/vision', label: 'Vision' },
]

export default function SiteNav() {
  const { isAuthenticated, authReady } = useAuth()
  const { plan } = usePlan()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [location.pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open ])

  return (
    <div className="nav-shell">
      <header className={`nav-bar transition-shadow ${scrolled ? 'shadow-[0_8px_30px_rgba(0,0,0,.45)]' : ''}`}>
        <div className="wrap flex items-center justify-between h-[68px]">
          <Brand />
          <nav className="hidden lg:flex items-center gap-8" aria-label="Primary">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {plan === 'PRO' && <span className="badge badge-gold hidden sm:inline-flex">Pro</span>}
            {!authReady ? null : isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-profit btn-sm">
                Dashboard <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline-flex nav-link font-semibold">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-profit btn-sm">
                  Get started <ArrowRight size={15} />
                </Link>
              </>
            )}
            <button
              className="lg:hidden btn btn-ghost btn-sm !px-3"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="lg:hidden fixed inset-0 top-[68px] z-40 bg-[rgba(6,8,9,.97)] backdrop-blur-xl">
          <nav className="wrap py-8 flex flex-col gap-1" aria-label="Mobile">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `font-display text-2xl font-semibold tracking-tight py-3 border-b border-[var(--color-line)] ${isActive ? 'text-[var(--color-profit)]' : 'text-[var(--color-ink)]'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            {!isAuthenticated && (
              <Link to="/login" className="font-display text-2xl font-semibold tracking-tight py-3 text-[var(--color-muted)]">
                Log in
              </Link>
            )}
            <div className="flex gap-3 mt-8">
              <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn btn-profit flex-1">
                {isAuthenticated ? 'Dashboard' : 'Get started'} <ArrowRight size={16} />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
