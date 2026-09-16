import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { getSymbols } from '../api/analytics'
import { useAuth } from '../context/AuthContext'
import { formatPercent, initials, pnlClass } from '../utils/format'

export default function AppShell() {
  const { user, logout } = useAuth()
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
            Tradexa
          </div>
          <nav className="nav-links">
            <NavLink to="/dashboard" end>Dashboard</NavLink>
            <NavLink to="/trades">Trades</NavLink>
            <NavLink to="/analytics">Analytics</NavLink>
            <NavLink to="/upload">Upload</NavLink>
          </nav>
          <div className="user-chip">
            <div className="avatar">{initials(user?.name)}</div>
            <strong>{user?.name}</strong>
            <button
              className="ghost-btn"
              type="button"
              onClick={() => {
                logout()
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
