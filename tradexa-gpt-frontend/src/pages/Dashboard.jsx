import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts'
import { Crown } from 'lucide-react'
import { getSummary } from '../api/analytics'
import { getTrades } from '../api/trades'
import { apiErrorMessage } from '../api/client'
import { cancelSubscription } from '../api/billing'
import { usePlan } from '../context/PlanContext'
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

function formatRenewalDate(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function SubscriptionCard() {
  const { plan, subscription, trialActive, trialEndsAt, loading, refresh } = usePlan()
  const [confirming, setConfirming] = useState(false)
  const [working, setWorking] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleCancel() {
    setError('')
    setWorking(true)
    try {
      await cancelSubscription()
      await refresh()
      setConfirming(false)
      setMessage('Your Pro subscription will stay active until the renewal date, then end. No further charges.')
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setWorking(false)
    }
  }

  const isPro = plan === 'PRO'
  const cancelAtEnd = Boolean(subscription?.cancelAtPeriodEnd)

  return (
    <section className="card" style={{ width: 'min(1240px, calc(100% - 32px))', margin: '0 auto 16px' }}>
      <div className="card-title">
        <h3 className="flex items-center gap-2">
          {isPro ? <Crown className="w-4 h-4 text-indigo-400" /> : null}
          Subscription
        </h3>
        {loading ? (
          <span className="neutral">Loading…</span>
        ) : isPro ? (
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 rounded-full px-3 py-1">
            Tradexa Pro
          </span>
        ) : (
          <Link to="/pricing" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
            Upgrade to Pro
          </Link>
        )}
      </div>

      {message ? <div className="alert" style={{ marginBottom: 12 }}>{message}</div> : null}
      {error ? <div className="alert" style={{ marginBottom: 12 }}>{error}</div> : null}

      {isPro ? (
        <div className="stack" style={{ gap: 12 }}>
          <p className="neutral" style={{ margin: 0 }}>
            {cancelAtEnd ? 'Ends on' : 'Renews on'}{' '}
            <strong className="text-white">{formatRenewalDate(subscription?.currentEnd)}</strong>
            {cancelAtEnd ? ' — no further charges.' : '.'}
          </p>
          {confirming ? (
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm text-neutral-300">Cancel at the end of the billing period?</span>
              <button
                type="button"
                className="ghost-btn"
                disabled={working}
                onClick={() => setConfirming(false)}
              >
                Keep Pro
              </button>
              <button
                type="button"
                className="primary-btn"
                style={{ background: '#ef4444' }}
                disabled={working}
                onClick={handleCancel}
              >
                {working ? 'Cancelling…' : 'Confirm cancel'}
              </button>
            </div>
          ) : cancelAtEnd ? null : (
            <div>
              <button type="button" className="ghost-btn" onClick={() => setConfirming(true)}>
                Cancel subscription
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="neutral" style={{ margin: 0 }}>
          You're on the <strong className="text-white">Free</strong> plan.
          {trialActive && trialEndsAt
            ? ` Your 3-day journal trial is active until ${formatRenewalDate(trialEndsAt)}.`
            : ''}
          {' '}<Link to="/pricing" className="text-indigo-400 hover:text-indigo-300 font-semibold">See Pro plans</Link>
        </p>
      )}
    </section>
  )
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
  const rr = avgLoss === 0 ? 'â€”' : `${formatNumber(avgWin / avgLoss, 1)}:1`

  return (
    <motion.main initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration: 0.6}} className="page">
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

      <SubscriptionCard />

      <section className="kpi-grid">
        <KpiCard label="HIGHEST P&L" value={formatMoney(summary?.totalPnl)} hint="Net across your journal" tone="green" icon="â‚¹" />
        <KpiCard label="WIN RATE" value={formatPercent(summary?.winRate)} hint={`${summary?.winningTrades || 0} winning trades`} tone="mint" icon="ðŸ†" />
        <KpiCard label="AVG. RISK/REWARD" value={rr} hint="Average win vs average loss" tone="lilac" icon="â—Ž" />
        <KpiCard label="TRADES" value={summary?.totalTrades || 0} hint="Your private ledger" tone="peach" icon="â–£" />
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
            <EmptyState icon="ðŸ“ˆ" title="No trades yet" body="Log a trade to see the equity curve." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={charts.cumulative}>
                <defs>
                    <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="pnl" stroke="#10b981" fill="url(#pnlFill)" strokeWidth={3} />
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
            <EmptyState icon="ðŸ†" title="No top trades yet" body="Start trading to see your best performers." />
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
            <EmptyState icon="âš–ï¸" title="No trade outcomes yet" body="Once you start trading, your wins and losses will appear here." />
          ) : (
            <div className="stack">
              <p>Winning {summary.winningTrades} Â· Losing {summary.losingTrades}</p>
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
          <EmptyState icon="âœ…" title="No tagged mistakes yet" body="Keep the discipline â€” tags will land here in a later release." />
        </article>
        <article className="card">
          <div className="card-title"><h3>Daily P&L</h3></div>
          {charts.daily.length === 0 ? (
            <EmptyState icon="ðŸ“Š" title="No daily series yet" body="Closed trades will stack here by day." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charts.daily}>
                <CartesianGrid stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} />
                <Tooltip />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {charts.daily.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl < 0 ? "#ef4444" : "#10b981"} />
                    ))}
                  </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </article>
      </section>
    </motion.main>
  )
}



