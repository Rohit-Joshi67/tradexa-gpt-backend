import { useEffect, useState } from 'react'
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, LayoutDashboard, Receipt, BarChart3, Upload, Bot, Newspaper, Crown, Newspaper as CmsIcon } from 'lucide-react'
import { getSymbols } from '../api/analytics'
import { useAuth } from '../context/AuthContext'
import { usePlan } from '../context/PlanContext'
import { formatPercent, initials, pnlClass } from '../utils/format'
import { Brand } from './ui/Brand'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/trades', label: 'Trades', icon: Receipt },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/copilot', label: 'Copilot', icon: Bot },
  { to: '/blogs', label: 'Blog', icon: Newspaper },
  { to: '/pricing', label: 'Pricing', icon: Crown },
]

const linkClass = ({ isActive }) =>
  `flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13.5px] font-semibold transition-colors whitespace-nowrap ${
    isActive
      ? 'text-[var(--color-ink)] bg-[rgba(14,203,129,.12)]'
      : 'text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[rgba(255,255,255,.05)]'
  }`

export default function AppShell() {
  const { user, logout } = useAuth()
  const { plan } = usePlan()
  const navigate = useNavigate()
  const [ticker, setTicker] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let alive = true
    getSymbols()
      .then((rows) => {
        if (!alive) return
        setTicker(
          (rows || []).slice(0, 8).map((row) => ({
            label: row.symbol,
            value: `${formatPercent(row.winRate)} · ${row.totalPnl}`,
            tone: pnlClass(row.totalPnl),
          })),
        )
      })
      .catch(() => {
        if (alive) setTicker([])
      })
    return () => {
      alive = false
    }
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="sticky top-0 z-40 bg-[rgba(8,10,13,.86)] backdrop-blur-xl border-b border-[var(--color-line)]">
        <div className="flex items-center gap-4 h-[64px] px-5 lg:px-8 max-w-[1440px] mx-auto">
          <Link to="/dashboard" className="shrink-0" aria-label="Tradexa GPT dashboard">
            <Brand />
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-4" aria-label="Primary">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={to === '/dashboard'} className={linkClass}>
                <Icon size={14} className="opacity-70" /> {label}
              </NavLink>
            ))}
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin/articles" className={linkClass}>
                <CmsIcon size={14} className="opacity-70" /> CMS
              </NavLink>
            )}
          </nav>

          <div className="flex-1" />

          {plan === 'PRO' ? (
            <span className="badge badge-gold hidden sm:inline-flex">
              <Crown size={11} /> Pro
            </span>
          ) : (
            <Link to="/pricing" className="badge badge-gold hidden sm:inline-flex hover:border-[var(--color-gold)] transition-colors">
              <Crown size={11} /> Go Pro
            </Link>
          )}

          <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-[var(--color-line)]">
            <span className="grid place-items-center w-8 h-8 rounded-full bg-[var(--color-panel3)] border border-[var(--color-line2)] text-[12px] font-bold text-[var(--color-ink)]">
              {initials(user?.name)}
            </span>
            <span className="text-[13.5px] font-semibold max-w-[140px] truncate">{user?.name}</span>
            <button onClick={handleLogout} className="btn btn-ghost !px-3 !py-1.5 !text-[12.5px]" title="Log out" aria-label="Log out">
              <LogOut size={14} />
            </button>
          </div>

          <button
            className="lg:hidden grid place-items-center w-10 h-10 rounded-xl border border-[var(--color-line)] text-[var(--color-muted)]"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

        {/* mobile menu */}
        {menuOpen && (
          <nav className="lg:hidden border-t border-[var(--color-line)] px-5 py-4 grid gap-1 bg-[rgba(8,10,13,.97)]" aria-label="Mobile">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={to === '/dashboard'} className={linkClass} onClick={() => setMenuOpen(false)}>
                <Icon size={15} className="opacity-70" /> {label}
              </NavLink>
            ))}
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin/articles" className={linkClass} onClick={() => setMenuOpen(false)}>
                <CmsIcon size={15} className="opacity-70" /> CMS
              </NavLink>
            )}
            <div className="flex items-center gap-3 pt-3 mt-2 border-t border-[var(--color-line)]">
              <span className="grid place-items-center w-9 h-9 rounded-full bg-[var(--color-panel3)] border border-[var(--color-line2)] text-[13px] font-bold">
                {initials(user?.name)}
              </span>
              <span className="text-[14px] font-semibold flex-1 truncate">{user?.name}</span>
              <button onClick={handleLogout} className="btn btn-ghost !px-3 !py-1.5 !text-[12.5px]">
                <LogOut size={14} /> Log out
              </button>
            </div>
          </nav>
        )}

        {/* personal pulse ticker */}
        <div className="border-t border-[var(--color-line)] bg-[rgba(255,255,255,.012)] overflow-hidden">
          <div className="flex items-center gap-6 px-5 lg:px-8 h-[34px] max-w-[1440px] mx-auto overflow-x-auto no-scrollbar whitespace-nowrap text-[12px]">
            <span className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--color-faint)] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-profit)] animate-pulse" /> Pulse
            </span>
            {ticker.length === 0 ? (
              <span className="text-[var(--color-faint)]">Your journal is live · add trades to populate this pulse</span>
            ) : (
              ticker.map((item) => (
                <span key={item.label} className="flex items-center gap-1.5 text-[var(--color-muted)]">
                  <b className="text-[var(--color-ink)] font-bold">{item.label}</b>
                  <span className={`tnum ${item.tone === 'negative' ? 'text-[var(--color-loss)]' : item.tone === 'positive' ? 'text-[var(--color-profit)]' : 'text-[var(--color-muted)]'}`}>
                    {item.value}
                  </span>
                </span>
              ))
            )}
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  )
}
