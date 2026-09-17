import { useEffect, useState, useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, LineChart, Line } from 'recharts'
import { getMarketHours, getSummary, getSymbols } from '../api/analytics'
import EmptyState from '../components/EmptyState'
import { formatMoney, formatNumber, formatPercent, pnlClass } from '../utils/format'
import { Activity, AlertTriangle, TrendingUp } from 'lucide-react'

export default function Analytics() {
  const [summary, setSummary] = useState(null)
  const [symbols, setSymbols] = useState([])
  const [hours, setHours] = useState([])

  useEffect(() => {
    Promise.all([getSummary(), getSymbols(), getMarketHours()]).then(([stats, symbolRows, hourRows]) => {
      setSummary(stats)
      setSymbols(symbolRows || [])
      setHours(hourRows || [])
    })
  }, [])

  // Edge Math
  const edgeMath = useMemo(() => {
    if (!summary) return null;
    const W = (summary.winRate || 0) / 100;
    const L = 1 - W;
    const AW = Number(summary.averageProfit || 0);
    const AL = Math.abs(Number(summary.averageLoss || 0));
    const trades = summary.totalTrades || 0;
    
    const grossExpectancy = (W * AW) - (L * AL);
    const profitFactor = (L * AL) === 0 ? 99 : (W * AW) / (L * AL);
    const breakEvenWinRate = AL / (AW + AL);
    const edge = AL === 0 ? 0 : (grossExpectancy / AL) * 100;
    const expectedR100 = AL === 0 ? 0 : (grossExpectancy / AL) * 100;
    
    const probLoss = (n) => Math.pow(L, n) * 100;
    const expectedLosingStreak = L === 0 || trades <= 1 ? 0 : Math.log(trades) / Math.log(1 / L);
    const payoffRatio = AL === 0 ? 0 : AW / AL;
    const kelly = payoffRatio === 0 ? 0 : W - (L / payoffRatio);
    const maxSuggestedRisk = kelly > 0 ? kelly * 100 * 0.5 : 0;

    // Monte Carlo
    const mcData = [];
    let paths = [10000, 10000, 10000, 10000, 10000];
    for (let i = 0; i <= 100; i++) {
      if (i === 0) {
        mcData.push({ trade: 0, p1: paths[0], p2: paths[1], p3: paths[2], p4: paths[3], p5: paths[4] });
        continue;
      }
      for (let p = 0; p < 5; p++) {
        paths[p] += Math.random() < W ? AW : -AL;
      }
      mcData.push({ trade: i, p1: paths[0], p2: paths[1], p3: paths[2], p4: paths[3], p5: paths[4] });
    }

    return { grossExpectancy, profitFactor, breakEvenWinRate, edge, expectedR100, probLoss, expectedLosingStreak, payoffRatio, maxSuggestedRisk, mcData };
  }, [summary]);

  return (
    <main className="page space-y-8">
      <div className="page-head">
        <div>
          <div className="eyebrow">Edge</div>
          <h1>Statistical analytics</h1>
        </div>
      </div>

      <section className="kpi-grid">
        <article className="card kpi green"><div className="kpi-label">MEAN</div><div className="kpi-value">{formatMoney(summary?.meanPnl)}</div></article>
        <article className="card kpi mint"><div className="kpi-label">MEDIAN</div><div className="kpi-value">{formatMoney(summary?.medianPnl)}</div></article>
        <article className="card kpi lilac"><div className="kpi-label">VARIANCE</div><div className="kpi-value">{formatNumber(summary?.variance, 2)}</div></article>
        <article className="card kpi peach"><div className="kpi-label">SKEWNESS</div><div className="kpi-value">{formatNumber(summary?.skewness, 2)}</div></article>
        <article className="card kpi green"><div className="kpi-label">COEFF OF VAR</div><div className="kpi-value">{formatNumber(summary?.coefficientOfVariation, 2)}%</div></article>
      </section>

      <section className="grid-2">
        <article className="card">
          <div className="card-title"><h3>Market hours</h3></div>
          {hours.length === 0 ? (
            <EmptyState icon="dY '" title="No hourly profile yet" body="Trades with entry times will bucket into sessions." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={hours}>
                <CartesianGrid stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="hourLabel" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalPnl" radius={[4, 4, 0, 0]}>
                  {hours.map((entry, index) => (
                    <Cell key={"cell-" + index} fill={entry.totalPnl < 0 ? "#ef4444" : "#10b981"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </article>
        <article className="card">
          <div className="card-title"><h3>By symbol</h3></div>
          <table className="table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Win rate</th>
                <th>PnL</th>
              </tr>
            </thead>
            <tbody>
              {symbols.map((row) => (
                <tr key={row.symbol}>
                  <td>{row.symbol}</td>
                  <td>{formatPercent(row.winRate)}</td>
                  <td className={pnlClass(row.totalPnl)}>{formatMoney(row.totalPnl)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>

      {/* Trading Edge Integration */}
      {edgeMath && summary && summary.totalTrades > 0 && (
        <section className="space-y-6 pt-6 border-t border-white/10">
          <div className="mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="text-emerald-400" /> Realized Trading Edge</h2>
            <p className="text-neutral-400">Calculated using your actual trading journal data.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Net Expectancy</span>
              <span className={"text-3xl font-bold " + (edgeMath.grossExpectancy > 0 ? "text-emerald-400" : "text-red-400")}>
                {edgeMath.grossExpectancy > 0 ? '+' : ''}{edgeMath.grossExpectancy.toFixed(2)}
              </span>
            </div>
            <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Profit Factor</span>
              <span className={"text-3xl font-bold " + (edgeMath.profitFactor > 1.2 ? "text-emerald-400" : "text-amber-400")}>
                {edgeMath.profitFactor.toFixed(2)}
              </span>
            </div>
            <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Breakeven Win %</span>
              <span className="text-3xl font-bold text-white">
                {(edgeMath.breakEvenWinRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6">
              <h4 className="text-sm font-bold text-neutral-400 uppercase mb-6 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400"/> Drawdown & Survival</h4>
              <ul className="space-y-4">
                <li className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-neutral-300">Expected Losing Streak (100 trades)</span>
                  <span className="font-bold text-white">{edgeMath.expectedLosingStreak.toFixed(1)} trades</span>
                </li>
                <li className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-neutral-300">Prob of 5 Consecutive Losses</span>
                  <span className="font-bold text-amber-400">{edgeMath.probLoss(5).toFixed(2)}%</span>
                </li>
                <li className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-neutral-300">Prob of 10 Consecutive Losses</span>
                  <span className="font-bold text-red-400">{edgeMath.probLoss(10).toFixed(2)}%</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-neutral-300">Max Suggested Risk (Half-Kelly)</span>
                  <span className="font-bold text-indigo-400">{edgeMath.maxSuggestedRisk > 0 ? edgeMath.maxSuggestedRisk.toFixed(2) + '%' : 'N/A'}</span>
                </li>
              </ul>
            </div>

            <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6 h-[320px] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm font-bold text-neutral-400 uppercase flex items-center gap-2"><Activity className="w-4 h-4 text-indigo-400"/> Projected Monte Carlo</h4>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={edgeMath.mcData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="trade" stroke="#525252" tick={{fill: '#a3a3a3', fontSize: 12}} />
                  <YAxis stroke="#525252" tick={{fill: '#a3a3a3', fontSize: 12}} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <Line type="monotone" dataKey="p1" stroke="#3b82f6" strokeWidth={2} dot={false} opacity={0.6} />
                  <Line type="monotone" dataKey="p2" stroke="#10b981" strokeWidth={2} dot={false} opacity={0.6} />
                  <Line type="monotone" dataKey="p3" stroke="#8b5cf6" strokeWidth={2} dot={false} opacity={0.6} />
                  <Line type="monotone" dataKey="p4" stroke="#f59e0b" strokeWidth={2} dot={false} opacity={0.6} />
                  <Line type="monotone" dataKey="p5" stroke="#ef4444" strokeWidth={2} dot={false} opacity={0.6} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
