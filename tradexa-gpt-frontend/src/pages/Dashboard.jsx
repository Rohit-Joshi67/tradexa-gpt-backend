import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getSummary } from '../api/analytics'
import { getTrades } from '../api/trades'
import EmptyState from '../components/EmptyState'
import KpiCard from '../components/KpiCard'
import { formatDate, formatMoney, formatNumber, formatPercent, pnlClass } from '../utils/format'

function buildCharts(trades) {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.exitTime || a.entryTime) - new Date(b.exitTime || b.entryTime),
  )
  let running = 0
  const cumulative = sorted.map((trade) => {
    running += Number(trade.pnl || 0)
    return {
      label: formatDate(trade.exitTime || trade.entryTime),
      pnl: Number(running.toFixed(2)),
    }
  })

  const byDay = new Map()
  sorted.forEach((trade) => {
    const key = formatDate(trade.exitTime || trade.entryTime)
    byDay.set(key, (byDay.get(key) || 0) + Number(trade.pnl || 0))
  })
  const daily = [...byDay.entries()].map(([label, pnl]) => ({ label, pnl: Number(pnl.toFixed(2)) }))

  const top = [...trades]
    .sort((a, b) => Number(b.pnl || 0) - Number(a.pnl || 0))
    .slice(0, 5)

  return { cumulative, daily, top }
}

function confidenceFrom(summary) {
  if (!summary?.totalTrades) return 8
  const win = Number(summary.winRate || 0)
  const expectancy = Number(summary.expectancy || 0)
  const skew = Number(summary.skewness || 0)
  const score = Math.max(4, Math.min(96, win * 0.7 + (expectancy > 0 ? 18 : 4) + Math.max(-8, Math.min(8, skew))))
  return score
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [trades, setTrades] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getSummary(), getTrades()])
      .then(([stats, rows]) => {
        setSummary(stats)
        setTrades(rows || [])
      })
      .catch(() => setError('Could not load dashboard data.'))
  }, [])

  const charts = useMemo(() => buildCharts(trades), [trades])
  const confidence = confidenceFrom(summary)
  const avgWin = Number(summary?.averageProfit || 0)
  const avgLoss = Math.abs(Number(summary?.averageLoss || 0))
  const rr = avgLoss === 0 ? '—' : `${formatNumber(avgWin / avgLoss, 1)}:1`

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Overview</div>
          <h1>Trading desk</h1>
        </div>
        <div className="filters">
          <select defaultValue="indian" aria-label="Market">
            <option value="indian">Indian</option>
          </select>
          <select defaultValue="all" aria-label="Range">
            <option value="all">All trades</option>
          </select>
          <Link className="primary-btn" to="/trades">+ New Trade</Link>
        </div>
      </div>

      {error ? <div className="alert" style={{ width: 'min(1240px, calc(100% - 32px))', margin: '0 auto 16px' }}>{error}</div> : null}

      <section className="kpi-grid">
        <KpiCard label="HIGHEST P&L" value={formatMoney(summary?.totalPnl)} hint="Net across your journal" tone="green" icon="₹" />
        <KpiCard label="WIN RATE" value={formatPercent(summary?.winRate)} hint={`${summary?.winningTrades || 0} winning trades`} tone="mint" icon="🏆" />
        <KpiCard label="AVG. RISK/REWARD" value={rr} hint="Average win vs average loss" tone="lilac" icon="◎" />
        <KpiCard label="TRADES" value={summary?.totalTrades || 0} hint="Your private ledger" tone="peach" icon="▣" />
      </section>

      <section className="card" style={{ width: 'min(1240px, calc(100% - 32px))', margin: '0 auto 16px' }}>
        <div className="card-title">
          <h3>Confidence Index</h3>
          <span className="neutral">Derived from win rate, expectancy and skew</span>
        </div>
        <div className="confidence">
          <span className="confidence-dot" style={{ left: `${confidence}%` }} />
        </div>
      </section>

      <section className="grid-2">
        <article className="card">
          <div className="card-title">
            <h3>Cumulative P&L</h3>
          </div>
          {charts.cumulative.length === 0 ? (
            <EmptyState icon="📈" title="No trades yet" body="Log a trade to see the equity curve." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={charts.cumulative}>
                <defs>
                  <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eef2f0" vertical={false} />
                <XAxis dataKey="label" tickLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="pnl" stroke="#16a34a" fill="url(#pnlFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </article>
        <article className="card">
          <div className="card-title">
            <h3>Top Trades</h3>
            <Link to="/trades">View All</Link>
          </div>
          {charts.top.length === 0 ? (
            <EmptyState icon="🏆" title="No top trades yet" body="Start trading to see your best performers." />
          ) : (
            <table className="table">
              <tbody>
                {charts.top.map((trade) => (
                  <tr key={trade.id}>
                    <td>{trade.symbol}</td>
                    <td>{trade.side}</td>
                    <td className={pnlClass(trade.pnl)}>{formatMoney(trade.pnl)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>
      </section>

      <section className="grid-2">
        <article className="card">
          <div className="card-title"><h3>Win / Loss Distribution</h3></div>
          {!summary?.totalTrades ? (
            <EmptyState icon="⚖️" title="No trade outcomes yet" body="Once you start trading, your wins and losses will appear here." />
          ) : (
            <div className="stack">
              <p>Winning {summary.winningTrades} · Losing {summary.losingTrades}</p>
              <div style={{ display: 'flex', height: 16, borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ flex: summary.winningTrades || 1, background: '#22c55e' }} />
                <div style={{ flex: summary.losingTrades || 1, background: '#f87171' }} />
              </div>
            </div>
          )}
        </article>
        <article className="card">
          <div className="card-title"><h3>Expectancy</h3></div>
          <div className="kpi-value">{formatMoney(summary?.expectancy)}</div>
          <p className="neutral">Expected rupees per trade after win and loss rates.</p>
        </article>
      </section>

      <section className="grid-2" style={{ marginTop: 16 }}>
        <article className="card">
          <div className="card-title"><h3>Most Common Mistakes</h3></div>
          <EmptyState icon="✅" title="No tagged mistakes yet" body="Keep the discipline — tags will land here in a later release." />
        </article>
        <article className="card">
          <div className="card-title"><h3>Daily P&L</h3></div>
          {charts.daily.length === 0 ? (
            <EmptyState icon="📊" title="No daily series yet" body="Closed trades will stack here by day." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charts.daily}>
                <CartesianGrid stroke="#eef2f0" vertical={false} />
                <XAxis dataKey="label" tickLine={false} />
                <Tooltip />
                <Bar dataKey="pnl" radius={[8, 8, 0, 0]} fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </article>
      </section>
    </main>
  )
}
