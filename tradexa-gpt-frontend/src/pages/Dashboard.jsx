import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts'
import { Crown, Plus, IndianRupee, Trophy, Scale, Receipt, Activity, TrendingUp, PieChart, Tag } from 'lucide-react'
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

const TOOLTIP_PROPS = {
  contentStyle: {
    background: '#10141a',
    border: '1px solid #28303b',
    borderRadius: 12,
    fontSize: 13,
    color: '#edf2f0',
    boxShadow: '0 12px 32px rgba(0,0,0,.5)',
  },
  labelStyle: { color: '#9aa5b1', fontSize: 12, marginBottom: 4 },
  itemStyle: { color: '#edf2f0', fontFamily: 'ui-monospace, Menlo, Consolas, monospace', fontSize: 13, padding: 0 },
}

const AXIS_TICK = { fill: '#636d79', fontSize: 11 }

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
    <section className="panel">
      <div className="panel-head">
        <span className="panel-title flex items-center gap-2">
          {isPro ? <Crown size={15} className="text-[var(--color-gold)]" /> : null}
          Subscription
        </span>
        {loading ? (
          <span className="neutral text-[13px]">Loading…</span>
        ) : isPro ? (
          <span className="badge badge-gold">
            <Crown size={11} /> Tradexa Pro
          </span>
        ) : (
          <Link to="/pricing" className="text-[13.5px] font-semibold text-[var(--color-gold)] hover:underline">
            Upgrade to Pro
          </Link>
        )}
      </div>
      <div className="panel-body">
        {message ? <div className="alert alert-ok mb-4">{message}</div> : null}
        {error ? <div className="alert alert-error mb-4">{error}</div> : null}

        {isPro ? (
          <>
            <p className="neutral text-[14px] m-0">
              {cancelAtEnd ? 'Ends on' : 'Renews on'}{' '}
              <strong className="text-[var(--color-ink)]">{formatRenewalDate(subscription?.currentEnd)}</strong>
              {cancelAtEnd ? ' — no further charges.' : '.'}
            </p>
            {confirming ? (
              <div className="flex flex-wrap gap-3 items-center mt-4">
                <span className="text-[13.5px] neutral">Cancel at the end of the billing period?</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={working}
                  onClick={() => setConfirming(false)}
                >
                  Keep Pro
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  disabled={working}
                  onClick={handleCancel}
                >
                  {working ? 'Cancelling…' : 'Confirm cancel'}
                </button>
              </div>
            ) : cancelAtEnd ? null : (
              <div className="mt-4">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(true)}>
                  Cancel subscription
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="neutral text-[14px] m-0">
            You're on the <strong className="text-[var(--color-ink)]">Free</strong> plan.
            {trialActive && trialEndsAt
              ? ` Your 3-day journal trial is active until ${formatRenewalDate(trialEndsAt)}.`
              : ''}
            {' '}<Link to="/pricing" className="text-[var(--color-gold)] hover:underline font-semibold">See Pro plans</Link>
          </p>
        )}
      </div>
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
  const rr = avgLoss === 0 ? '—' : `${formatNumber(avgWin / avgLoss, 1)}:1`
  const pnl = Number(summary?.totalPnl || 0)
  const expectancy = Number(summary?.expectancy || 0)

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Overview</div>
          <h1>Trading desk</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select className="field" style={{ width: 'auto' }} defaultValue="indian" aria-label="Market">
            <option value="indian">Indian</option>
          </select>
          <select className="field" style={{ width: 'auto' }} defaultValue="all" aria-label="Range">
            <option value="all">All trades</option>
          </select>
          <Link className="btn btn-profit btn-sm" to="/trades"><Plus size={15} /> New Trade</Link>
        </div>
      </div>

      {error ? (
        <div className="wrap-wide mb-5">
          <div className="alert alert-error">{error}</div>
        </div>
      ) : null}

      <div className="wrap-wide mb-5">
        <SubscriptionCard />
      </div>

      <section className="wrap-wide grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KpiCard label="HIGHEST P&L" value={formatMoney(summary?.totalPnl)} hint="Net across your journal" tone={pnl >= 0 ? 'profit' : 'loss'} icon={<IndianRupee size={17} />} />
        <KpiCard label="WIN RATE" value={formatPercent(summary?.winRate)} hint={`${summary?.winningTrades || 0} winning trades`} tone="profit" icon={<Trophy size={17} />} />
        <KpiCard label="AVG. RISK/REWARD" value={rr} hint="Average win vs average loss" tone="gold" icon={<Scale size={17} />} />
        <KpiCard label="TRADES" value={summary?.totalTrades || 0} hint="Your private ledger" tone="neutral" icon={<Receipt size={17} />} />
      </section>

      <section className="wrap-wide panel mb-5">
        <div className="panel-head">
          <span className="panel-title">Confidence Index</span>
          <span className="neutral text-[12.5px]">Derived from win rate, expectancy and skew</span>
        </div>
        <div className="panel-body">
          <div className="flex items-baseline justify-between mb-3">
            <span className="stat-num tnum text-[26px]">{Math.round(confidence)}<span className="text-[15px] text-[var(--color-faint)]">/100</span></span>
            <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-faint)]">
              {confidence >= 66 ? <span className="positive">Strong</span> : confidence >= 40 ? <span className="text-[var(--color-gold)]">Developing</span> : <span className="negative">Fragile</span>}
            </span>
          </div>
          <div
            className="relative h-3 rounded-full"
            style={{ background: 'linear-gradient(90deg, #f6465d 0%, #f0b90b 50%, #0ecb81 100%)' }}
            role="img"
            aria-label={`Confidence index ${Math.round(confidence)} out of 100`}
          >
            <span
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#edf2f0] border-[3px] border-[#0b0e11] shadow-[0_2px_10px_rgba(0,0,0,.6)]"
              style={{ left: `${confidence}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-faint)]">
            <span>0</span><span>50</span><span>100</span>
          </div>
        </div>
      </section>

      <section className="wrap-wide grid lg:grid-cols-2 gap-5 mb-5">
        <article className="panel">
          <div className="panel-head">
            <span className="panel-title">Cumulative P&L</span>
          </div>
          <div className="p-4">
            {charts.cumulative.length === 0 ? (
              <EmptyState icon={<Activity size={30} />} title="No trades yet" body="Log a trade to see the equity curve." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={charts.cumulative} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                  <defs>
                    <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ecb81" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0ecb81" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS_TICK} minTickGap={28} />
                  <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} width={48}
                    tickFormatter={(v) => (Math.abs(v) >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`)} />
                  <Tooltip {...TOOLTIP_PROPS} formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'P&L']} />
                  <Area type="monotone" dataKey="pnl" stroke="#0ecb81" strokeWidth={2.5}
                    fill="url(#pnlFill)" dot={false} activeDot={{ r: 4, fill: '#0ecb81', stroke: '#0b0e11' }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>
        <article className="panel">
          <div className="panel-head">
            <span className="panel-title">Top Trades</span>
            <Link to="/trades" className="text-[13px] font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">View All</Link>
          </div>
          {charts.top.length === 0 ? (
            <EmptyState icon={<Trophy size={30} />} title="No top trades yet" body="Start trading to see your best performers." />
          ) : (
            <table className="data-table">
              <tbody>
                {charts.top.map((trade) => (
                  <tr key={trade.id}>
                    <td className="tnum">{trade.symbol}</td>
                    <td>
                      <span className={`badge ${trade.side === 'BUY' || trade.side === 'LONG' ? 'badge-buy' : 'badge-sell'}`}>
                        {trade.side}
                      </span>
                    </td>
                    <td className={`${pnlClass(trade.pnl)} tnum`}>{formatMoney(trade.pnl)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>
      </section>

      <section className="wrap-wide grid lg:grid-cols-2 gap-5 mb-5">
        <article className="panel">
          <div className="panel-head">
            <span className="panel-title">Win / Loss Distribution</span>
          </div>
          <div className="panel-body">
            {!summary?.totalTrades ? (
              <EmptyState icon={<PieChart size={30} />} title="No trade outcomes yet" body="Once you start trading, your wins and losses will appear here." />
            ) : (
              <div className="space-y-4">
                <p className="text-[13.5px] neutral m-0">
                  Winning <b className="positive tnum">{summary.winningTrades}</b> · Losing <b className="negative tnum">{summary.losingTrades}</b>
                </p>
                <div className="flex h-4 rounded-full overflow-hidden bg-[rgba(255,255,255,.04)]">
                  <div style={{ flex: summary.winningTrades || 1, background: '#0ecb81' }} />
                  <div style={{ flex: summary.losingTrades || 1, background: '#f6465d' }} />
                </div>
                <p className="text-[12.5px] mut tnum m-0">{formatPercent(summary.winRate)} win rate</p>
              </div>
            )}
          </div>
        </article>
        <article className="panel">
          <div className="panel-head">
            <span className="panel-title">Expectancy</span>
          </div>
          <div className="panel-body">
            <div className={`stat-num tnum text-[32px] leading-none mb-2 ${expectancy >= 0 ? 'positive' : 'negative'}`}>
              {formatMoney(summary?.expectancy)}
            </div>
            <p className="neutral text-[13.5px] m-0">Expected rupees per trade after win and loss rates.</p>
          </div>
        </article>
      </section>

      <section className="wrap-wide grid lg:grid-cols-2 gap-5">
        <article className="panel">
          <div className="panel-head">
            <span className="panel-title">Most Common Mistakes</span>
          </div>
          <EmptyState icon={<Tag size={30} />} title="No tagged mistakes yet" body="Keep the discipline — tags will land here in a later release." />
        </article>
        <article className="panel">
          <div className="panel-head">
            <span className="panel-title">Daily P&L</span>
          </div>
          <div className="p-4">
            {charts.daily.length === 0 ? (
              <EmptyState icon={<TrendingUp size={30} />} title="No daily series yet" body="Closed trades will stack here by day." />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={charts.daily} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS_TICK} minTickGap={28} />
                  <Tooltip {...TOOLTIP_PROPS} formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'P&L']}
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]} maxBarSize={26}>
                    {charts.daily.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl < 0 ? '#f6465d' : '#0ecb81'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>
      </section>
    </main>
  )
}
