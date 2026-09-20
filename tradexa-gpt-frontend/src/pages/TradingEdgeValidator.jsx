import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePlan } from '../context/PlanContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Lock, Calculator, TrendingUp, AlertTriangle, Activity } from 'lucide-react'
import { edgeValidate } from '../api/copilot'
import { apiErrorMessage } from '../api/client'
import SiteNav from '../components/ui/SiteNav'
import SiteFooter from '../components/ui/SiteFooter'
import PageHero from '../components/ui/PageHero'

const PATH_COLORS = ['#4c8dff', '#0ecb81', '#f0b90b', '#f6465d', '#8b7cf6']

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

  // Monte Carlo + edge math now runs on the backend (Pro-only). Debounced.
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

  const stats = result?.stats || {}
  const mcStats = result?.mcStats || {}

  const chartData = useMemo(() => {
    if (!result?.paths?.length) return []
    const n = result.paths[0].length
    return Array.from({ length: n }, (_, i) => {
      const row = { trade: i }
      result.paths.forEach((p, pi) => { row[`p${pi + 1}`] = p[i] })
      return row
    })
  }, [result])

  const netExpectancy = stats.netExpectancy ?? 0
  const profitFactor = stats.profitFactor ?? 0
  const breakEvenPct = stats.breakEvenWinRatePct ?? 0
  const edge = stats.edgePct ?? 0
  const expectedReturn = netExpectancy * inputs.trades
  const expectedR = stats.expectedRPer100 ?? 0
  const payoffRatio = stats.payoffRatio ?? 0
  const halfKelly = stats.halfKellyPct ?? 0

  const verdict = !isPro || !result ? null : netExpectancy > 0 && profitFactor > 1.2
    ? { cls: 'badge-profit', text: 'Edge found' }
    : netExpectancy > 0
      ? { cls: 'badge-gold', text: 'Marginal edge' }
      : { cls: 'badge-loss', text: 'No edge' }

  return (
    <div>
      <SiteNav />

      <PageHero
        kicker="Free tool"
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
                <span className="text-[13px] text-[var(--color-faint)]">Based on backend Monte Carlo · {inputs.trades} trades</span>
              </div>
            )}

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

            {!isPro ? (
              <div className="panel p-8 md:p-10 text-center !border-[rgba(240,185,11,.35)] bg-[linear-gradient(180deg,rgba(240,185,11,.06),var(--color-panel))]">
                <span className="grid place-items-center w-16 h-16 rounded-2xl bg-[var(--color-gold-dim)] border border-[rgba(240,185,11,.35)] mx-auto mb-6">
                  <Lock size={28} className="text-[var(--color-gold)]" />
                </span>
                <h3 className="font-display font-bold text-[24px] tracking-tight mb-3">Unlock deep analytics</h3>
                <p className="text-[var(--color-muted)] text-[14.5px] leading-relaxed max-w-md mx-auto mb-8">
                  A Tradexa Pro subscription is required to run Monte Carlo simulations, view risk of ruin,
                  survival probabilities, and advanced distribution metrics.
                </p>
                {isAuthenticated ? (
                  <Link to="/pricing" className="btn btn-gold btn-lg">Upgrade to Pro</Link>
                ) : (
                  <Link to="/login" className="btn btn-gold btn-lg">Log in / Register</Link>
                )}
              </div>
            ) : (
              <>
                {evError && (
                  <div className="alert alert-error">{evError}</div>
                )}
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
                    <button onClick={() => setSeed(Date.now() % 100000)} className="btn btn-ghost btn-sm">
                      Run again
                    </button>
                  </div>
                  <div className="panel-body flex-1 min-h-[320px]">
                    {loading && chartData.length === 0 ? (
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
                          {result?.paths?.map((_, pi) => (
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
