import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePlan } from '../context/PlanContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Lock, Calculator, TrendingUp, AlertTriangle, Activity, Check } from 'lucide-react'
import { edgeValidate } from '../api/copilot'
import { apiErrorMessage } from '../api/client'
import SiteNav from '../components/ui/SiteNav'
import SiteFooter from '../components/ui/SiteFooter'
import PageHero from '../components/ui/PageHero'

const PATH_COLORS = ['#4c8dff', '#0ecb81', '#f0b90b', '#f6465d', '#8b7cf6']

/* ------------------------------------------------------------------ */
/* Client-side preview math — mirrors backend MonteCarloService so the */
/* free preview uses the exact same formulas as the Pro simulation.   */
/* ------------------------------------------------------------------ */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function round2(v) {
  return Math.round(v * 100) / 100
}

function percentile(sorted, pct) {
  if (sorted.length === 0) return 0
  if (sorted.length === 1) return sorted[0]
  const rank = (pct / 100) * (sorted.length - 1)
  const lo = Math.floor(rank)
  const hi = Math.ceil(rank)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (rank - lo)
}

/** Pure edge statistics — no randomness, identical to backend. */
function edgeStatsJS(winRatePct, avgWin, avgLoss, fees, trades) {
  const w = winRatePct / 100
  const l = 1 - w
  const gross = w * avgWin - l * avgLoss
  const netExpectancy = gross - fees
  const profitFactor = (l * avgLoss) === 0 ? 99.0 : (w * avgWin) / (l * avgLoss)
  const breakEvenWinRatePct =
    (avgLoss + fees) === 0 && (avgWin + avgLoss + 2 * fees) === 0
      ? 0
      : ((avgLoss + fees) / (avgWin + avgLoss + 2 * fees)) * 100
  const edgePct = avgLoss === 0 ? 0 : (netExpectancy / avgLoss) * 100
  const payoffRatio = avgLoss === 0 ? 0 : avgWin / avgLoss
  const kelly = payoffRatio === 0 ? 0 : w - l / payoffRatio
  return {
    netExpectancy,
    profitFactor,
    breakEvenWinRatePct,
    edgePct,
    expectedRPer100: edgePct,
    payoffRatio,
    kellyPct: kelly * 100,
    halfKellyPct: kelly > 0 ? kelly * 100 * 0.5 : 0,
    prob5LossesPct: Math.pow(l, 5) * 100,
    prob10LossesPct: Math.pow(l, 10) * 100,
    expectedLosingStreak: l === 0 || trades <= 1 ? 0 : Math.log(trades) / Math.log(1 / l),
  }
}

/** Lightweight deterministic Monte Carlo for the free preview. */
function simulatePreview({ winRatePct, avgWin, avgLoss, fees, trades, paths, capital, seed }) {
  const rng = mulberry32(seed)
  const w = winRatePct / 100
  const curves = []
  const finals = []
  const maxDDs = []
  for (let p = 0; p < paths; p++) {
    const curve = []
    let equity = capital
    let peak = capital
    let maxDd = 0
    curve.push(round2(equity))
    for (let t = 0; t < trades; t++) {
      const win = rng() < w
      equity += win ? avgWin - fees : -avgLoss - fees
      if (equity > peak) peak = equity
      const dd = peak === 0 ? 0 : ((peak - equity) / peak) * 100
      if (dd > maxDd) maxDd = dd
      curve.push(round2(equity))
    }
    curves.push(curve)
    finals.push(equity)
    maxDDs.push(maxDd)
  }
  finals.sort((a, b) => a - b)
  maxDDs.sort((a, b) => a - b)
  const ruinLine = capital * 0.2
  return {
    stats: edgeStatsJS(winRatePct, avgWin, avgLoss, fees, trades),
    mcStats: {
      probProfitPct: (finals.filter((f) => f > capital).length * 100) / paths,
      medianFinal: round2(percentile(finals, 50)),
      p5Final: round2(percentile(finals, 5)),
      p95Final: round2(percentile(finals, 95)),
      medianMaxDrawdownPct: round2(percentile(maxDDs, 50)),
      probRuinPct: (finals.filter((f) => f < ruinLine).length * 100) / paths,
    },
    paths: curves,
  }
}

function NumberSlider({ name, label, value, min, max, step = 1, onChange, accent = 'var(--color-profit)', valueClass = '' }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="label !mb-0" htmlFor={`ev-${name}`}>{label}</label>
        <span className={`stat-num tnum text-[15px] ${valueClass || 'text-[var(--color-ink)]'}`}>{value}</span>
      </div>
      <input
        id={`ev-${name}`}
        type="range"
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full cursor-pointer"
        style={{ accentColor: accent }}
        aria-label={label}
      />
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        step={step}
        className="field tnum !py-2.5 mt-1"
        aria-label={`${label} value`}
      />
    </div>
  )
}

export default function TradingEdgeValidator() {
  const { isAuthenticated } = useAuth()
  const { plan } = usePlan()
  const isPro = plan === 'PRO'

  const [inputs, setInputs] = useState({
    winRate: 45,
    avgWin: 500,
    avgLoss: 250,
    trades: 100,
    fees: 2,
    riskPerTrade: 1,
    capital: 10000,
  })
  const [seed, setSeed] = useState(42)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [evError, setEvError] = useState('')
  const debounceRef = useRef(null)

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: Number(e.target.value) })
  }

  // Pro: full Monte Carlo runs on the backend. Debounced.
  useEffect(() => {
    if (!isPro) return
    setLoading(true)
    setEvError('')
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      edgeValidate({
        winRate: inputs.winRate,
        avgWin: inputs.avgWin,
        avgLoss: inputs.avgLoss,
        fees: inputs.fees,
        trades: inputs.trades,
        paths: 5,
        capital: inputs.capital,
        seed,
      })
        .then(setResult)
        .catch((err) => {
          if (err?.response?.status !== 402) setEvError(apiErrorMessage(err))
          setResult(null)
        })
        .finally(() => setLoading(false))
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [inputs, seed, isPro])

  // Free: instant client-side preview with the same formulas.
  const preview = useMemo(() => {
    if (isPro) return null
    return simulatePreview({
      winRatePct: inputs.winRate,
      avgWin: inputs.avgWin,
      avgLoss: inputs.avgLoss,
      fees: inputs.fees,
      trades: inputs.trades,
      paths: 5,
      capital: inputs.capital,
      seed,
    })
  }, [inputs, seed, isPro])

  const data = isPro ? result : preview
  const stats = data?.stats || {}
  const mcStats = data?.mcStats || {}

  const chartData = useMemo(() => {
    if (!data?.paths?.length) return []
    const n = data.paths[0].length
    return Array.from({ length: n }, (_, i) => {
      const row = { trade: i }
      data.paths.forEach((p, pi) => { row[`p${pi + 1}`] = p[i] })
      return row
    })
  }, [data])

  const netExpectancy = stats.netExpectancy ?? 0
  const profitFactor = stats.profitFactor ?? 0
  const breakEvenPct = stats.breakEvenWinRatePct ?? 0
  const edge = stats.edgePct ?? 0
  const expectedReturn = netExpectancy * inputs.trades
  const expectedR = stats.expectedRPer100 ?? 0
  const payoffRatio = stats.payoffRatio ?? 0
  const halfKelly = stats.halfKellyPct ?? 0

  const verdict = !data ? null : netExpectancy > 0 && profitFactor > 1.2
    ? { cls: 'badge-profit', text: 'Edge found' }
    : netExpectancy > 0
      ? { cls: 'badge-gold', text: 'Marginal edge' }
      : { cls: 'badge-loss', text: 'No edge' }

  const renderDeepPanels = () => (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title flex items-center gap-2">
              <AlertTriangle size={15} className="text-[var(--color-gold)]" /> Drawdown &amp; survival
            </span>
          </div>
          <ul className="panel-body !py-2">
            <li className="flex justify-between items-center gap-4 py-4 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-muted)] text-[14px]">Expected losing streak ({inputs.trades} trades)</span>
              <span className="stat-num tnum text-[16px] text-[var(--color-ink)] whitespace-nowrap">{Number(stats.expectedLosingStreak ?? 0).toFixed(1)} trades</span>
            </li>
            <li className="flex justify-between items-center gap-4 py-4 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-muted)] text-[14px]">Prob of 5 consecutive losses</span>
              <span className="stat-num tnum text-[16px] text-[var(--color-gold)] whitespace-nowrap">{Number(stats.prob5LossesPct ?? 0).toFixed(2)}%</span>
            </li>
            <li className="flex justify-between items-center gap-4 py-4 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-muted)] text-[14px]">Prob of 10 consecutive losses</span>
              <span className="stat-num tnum text-[16px] text-[var(--color-loss)] whitespace-nowrap">{Number(stats.prob10LossesPct ?? 0).toFixed(2)}%</span>
            </li>
            <li className="flex justify-between items-center gap-4 py-4 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-muted)] text-[14px]">Prob of ruin (&lt;20% capital)</span>
              <span className="stat-num tnum text-[16px] text-[var(--color-loss)] whitespace-nowrap">{Number(mcStats.probRuinPct ?? 0).toFixed(1)}%</span>
            </li>
            <li className="flex justify-between items-center gap-4 py-4">
              <span className="text-[var(--color-muted)] text-[14px]">Max suggested risk (half-Kelly)</span>
              <span className="stat-num tnum text-[16px] text-[var(--color-info)] whitespace-nowrap">
                {halfKelly > 0 ? Number(halfKelly).toFixed(2) + '%' : 'N/A'}
              </span>
            </li>
          </ul>
        </div>

        <div className="panel">
          <div className="panel-head">
            <span className="panel-title flex items-center gap-2">
              <TrendingUp size={15} className="text-[var(--color-profit)]" /> Strategy performance
            </span>
          </div>
          <ul className="panel-body !py-2">
            <li className="flex justify-between items-center gap-4 py-4 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-muted)] text-[14px]">Expected return ({inputs.trades} trades)</span>
              <span className={`stat-num tnum text-[16px] whitespace-nowrap ${expectedReturn > 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
                ₹{Number(expectedReturn).toFixed(2)}
              </span>
            </li>
            <li className="flex justify-between items-center gap-4 py-4 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-muted)] text-[14px]">Expected R per 100 trades</span>
              <span className="stat-num tnum text-[16px] text-[var(--color-ink)] whitespace-nowrap">+{Number(expectedR).toFixed(2)} R</span>
            </li>
            <li className="flex justify-between items-center gap-4 py-4 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-muted)] text-[14px]">Payoff ratio (reward/risk)</span>
              <span className="stat-num tnum text-[16px] text-[var(--color-ink)] whitespace-nowrap">{Number(payoffRatio).toFixed(2)} : 1</span>
            </li>
            <li className="flex justify-between items-center gap-4 py-4 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-muted)] text-[14px]">Median outcome ({inputs.trades} trades)</span>
              <span className="stat-num tnum text-[16px] text-[var(--color-ink)] whitespace-nowrap">₹{Number(mcStats.medianFinal ?? 0).toFixed(2)}</span>
            </li>
            <li className="flex justify-between items-center gap-4 py-4">
              <span className="text-[var(--color-muted)] text-[14px]">Mathematical edge</span>
              <span className={`stat-num tnum text-[16px] whitespace-nowrap ${edge > 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
                {Number(edge).toFixed(2)}%
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="panel flex flex-col min-h-[400px]">
        <div className="panel-head">
          <span className="panel-title flex items-center gap-2">
            <Activity size={15} className="text-[var(--color-info)]" /> Monte Carlo simulation ({inputs.trades} trades)
          </span>
          {isPro && (
            <button onClick={() => setSeed(Date.now() % 100000)} className="btn btn-ghost btn-sm">
              Run again
            </button>
          )}
        </div>
        <div className="panel-body flex-1 min-h-[320px]">
          {isPro && loading && chartData.length === 0 ? (
            <div className="h-full min-h-[320px] flex items-center justify-center text-[var(--color-faint)] text-[14px]">
              Running simulation…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="trade" stroke="#2a323d" tick={{ fill: '#5b6470', fontSize: 12 }} tickLine={false} />
                <YAxis stroke="#2a323d" tick={{ fill: '#5b6470', fontSize: 12 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b0e11', border: '1px solid var(--color-line)', borderRadius: 12 }}
                  labelStyle={{ color: '#9aa5b1' }}
                  itemStyle={{ color: '#edf2f0' }}
                />
                {data?.paths?.map((_, pi) => (
                  <Line key={pi} type="monotone" dataKey={`p${pi + 1}`}
                    stroke={PATH_COLORS[pi % PATH_COLORS.length]}
                    strokeWidth={2} dot={false} opacity={0.6} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </>
  )

  return (
    <div>
      <SiteNav />

      <PageHero
        kicker={isPro ? 'Pro tool' : 'Free preview'}
        title={<>Trading Edge <span className="grad-text">Validator</span></>}
        lede="You have a strategy, but do you actually have an edge? Let the math decide."
      />

      <main className="wrap-wide pb-20">
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* inputs */}
          <div className="lg:col-span-4">
            <div className="panel lg:sticky lg:top-24">
              <div className="panel-head">
                <span className="panel-title flex items-center gap-2">
                  <Calculator size={16} className="text-[var(--color-info)]" /> Strategy inputs
                </span>
              </div>
              <div className="panel-body space-y-5">
                <NumberSlider name="winRate" label="Win rate (%)" value={inputs.winRate} min={0} max={100} onChange={handleChange} />
                <div className="grid grid-cols-2 gap-4">
                  <NumberSlider name="avgWin" label="Avg winner (₹)" value={inputs.avgWin} min={0} max={5000} step={10} onChange={handleChange} accent="var(--color-profit)" valueClass="text-[var(--color-profit)]" />
                  <NumberSlider name="avgLoss" label="Avg loser (₹)" value={inputs.avgLoss} min={0} max={5000} step={10} onChange={handleChange} accent="var(--color-loss)" valueClass="text-[var(--color-loss)]" />
                </div>
                <NumberSlider name="trades" label="Trades to simulate" value={inputs.trades} min={10} max={1000} step={10} onChange={handleChange} />
                <NumberSlider name="fees" label="Fees / slippage (₹)" value={inputs.fees} min={0} max={500} onChange={handleChange} />
                <NumberSlider name="riskPerTrade" label="Risk per trade (%)" value={inputs.riskPerTrade} min={0.25} max={5} step={0.25} onChange={handleChange} accent="var(--color-gold)" />
                <NumberSlider name="capital" label="Capital (₹)" value={inputs.capital} min={1000} max={1000000} step={1000} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* results */}
          <div className="lg:col-span-8 space-y-6">
            {verdict && (
              <div className="flex items-center gap-3">
                <span className={`badge ${verdict.cls}`}>{verdict.text}</span>
                <span className="text-[13px] text-[var(--color-faint)]">
                  {isPro ? 'Based on backend Monte Carlo' : 'Instant client-side preview'} · {inputs.trades} trades
                </span>
              </div>
            )}

            {data && (
              <div className="grid md:grid-cols-3 gap-4">
                <div className="panel p-6 relative overflow-hidden">
                  <div className="bg-glow w-32 h-32 bg-[rgba(14,203,129,.08)] -top-10 -right-10" />
                  <span className="text-[11.5px] font-bold text-[var(--color-faint)] uppercase tracking-[0.13em] block mb-3">Net expectancy</span>
                  <span className={`stat-num tnum text-[34px] leading-none ${netExpectancy > 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
                    {netExpectancy > 0 ? '+' : ''}{Number(netExpectancy).toFixed(2)}
                  </span>
                  <span className="text-[13px] text-[var(--color-faint)] block mt-2">Per trade average (₹)</span>
                </div>
                <div className="panel p-6">
                  <span className="text-[11.5px] font-bold text-[var(--color-faint)] uppercase tracking-[0.13em] block mb-3">Profit factor</span>
                  <span className={`stat-num tnum text-[34px] leading-none ${profitFactor > 1.2 ? 'text-[var(--color-profit)]' : 'text-[var(--color-gold)]'}`}>
                    {Number(profitFactor).toFixed(2)}
                  </span>
                  <span className="text-[13px] text-[var(--color-faint)] block mt-2">Gross win / gross loss</span>
                </div>
                <div className="panel p-6">
                  <span className="text-[11.5px] font-bold text-[var(--color-faint)] uppercase tracking-[0.13em] block mb-3">Breakeven win %</span>
                  <span className="stat-num tnum text-[34px] leading-none text-[var(--color-ink)]">
                    {Number(breakEvenPct).toFixed(1)}%
                  </span>
                  <span className="text-[13px] text-[var(--color-faint)] block mt-2">To stay profitable</span>
                </div>
              </div>
            )}

            {isPro ? (
              <>
                {evError && (
                  <div className="alert alert-error">{evError}</div>
                )}
                {renderDeepPanels()}
              </>
            ) : (
              /* Free preview: real results blurred behind the mystery lock panel */
              <div className="relative">
                <div className="blur-[7px] select-none pointer-events-none" aria-hidden="true">
                  {renderDeepPanels()}
                </div>
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="panel p-8 md:p-10 text-center max-w-md !border-[rgba(240,185,11,.35)] bg-[linear-gradient(180deg,rgba(240,185,11,.07),var(--color-panel))] shadow-2xl">
                    <span className="grid place-items-center w-14 h-14 rounded-2xl bg-[var(--color-gold-dim)] border border-[rgba(240,185,11,.35)] mx-auto mb-5">
                      <Lock size={26} className="text-[var(--color-gold)]" />
                    </span>
                    <h3 className="font-display font-bold text-[22px] tracking-tight mb-2">Unlock the full simulation</h3>
                    <p className="text-[var(--color-muted)] text-[14px] leading-relaxed mb-6">
                      The preview above is real math. Pro unlocks the deep Monte Carlo analysis behind this blur:
                    </p>
                    <ul className="text-left text-[13.5px] text-[var(--color-muted)] space-y-2.5 mb-7 max-w-[310px] mx-auto">
                      <li className="flex items-start gap-2.5">
                        <Check size={16} className="text-[var(--color-profit)] shrink-0 mt-[2px]" />
                        10,000-path server simulation with equity curves
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check size={16} className="text-[var(--color-profit)] shrink-0 mt-[2px]" />
                        Risk of ruin &amp; survival probabilities
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check size={16} className="text-[var(--color-profit)] shrink-0 mt-[2px]" />
                        Drawdown &amp; losing-streak analysis
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check size={16} className="text-[var(--color-profit)] shrink-0 mt-[2px]" />
                        Median, best &amp; worst-case outcomes
                      </li>
                    </ul>
                    {isAuthenticated ? (
                      <Link to="/pricing" className="btn btn-gold btn-lg w-full">Upgrade to Pro</Link>
                    ) : (
                      <Link to="/login" className="btn btn-gold btn-lg w-full">Log in to unlock</Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            <p className="text-[12.5px] text-[var(--color-faint)] leading-relaxed max-w-3xl">
              Educational math only — simulations project your assumptions forward; they are not a guarantee of
              future results. Trading involves significant risk; never risk money you cannot afford to lose.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
