import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { getSymbols } from '../api/analytics'
import { useAuth } from '../context/AuthContext'
import { usePlan } from '../context/PlanContext'
import { formatPercent, initials, pnlClass } from '../utils/format'

export default function AppShell() {
  const { user, logout } = useAuth()
  const { plan } = usePlan()
  const navigate = useNavigate()
  const [ticker, setTicker] = useState([])

  useEffect(() => {
    let alive = true
    getSymbols()
      .then((rows) => {
        if (!alive) return
        setTicker(
          (rows || []).slice(0, 8).map((row) => ({
            label: row.symbol,
            value: `${formatPercent(row.winRate)} Â· ${row.totalPnl}`,
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

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark">T</span>
            Tradexa GPT
          </div>
          <nav className="nav-links">
            <NavLink to="/dashboard" end>Dashboard</NavLink>
            <NavLink to="/trades">Trades</NavLink>
            <NavLink to="/analytics">Analytics</NavLink>
            <NavLink to="/upload">Upload</NavLink>
            <NavLink to="/copilot">Copilot</NavLink>
            <NavLink to="/blogs">Blog</NavLink>
            <NavLink to="/pricing">Pricing</NavLink>
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin/articles">CMS</NavLink>
            )}
          </nav>
          <div className="user-chip">
            {plan === 'PRO' && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 rounded-full px-2.5 py-1">
                Pro
              </span>
            )}
            <div className="avatar">{initials(user?.name)}</div>
            <strong>{user?.name}</strong>
            <button
              className="ghost-btn"
              type="button"
              onClick={async () => {
                await logout()
                navigate('/login')
              }}
            >
              Logout
            </button>
          </div>
        </div>
        <div className="ticker">
          {ticker.length === 0 ? (
            <span>Your journal is live Â· add trades to populate this pulse</span>
          ) : (
            ticker.map((item) => (
              <span key={item.label}>
                {item.label}
                <b className={item.tone}>{item.value}</b>
              </span>
            ))
          )}
        </div>
      </header>
      <Outlet />
    </div>
  )
}
