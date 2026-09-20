import { useEffect, useState, useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, LineChart, Line } from 'recharts'
import { getMarketHours, getSummary, getSymbols } from '../api/analytics'
import EmptyState from '../components/EmptyState'
import KpiCard from '../components/KpiCard'
import { formatMoney, formatNumber, formatPercent, pnlClass } from '../utils/format'
import { Activity, AlertTriangle, TrendingUp, Sigma, AlignCenterHorizontal, Waves, Percent, Clock } from 'lucide-react'

const MC_PATH_COLORS = ['#4c8dff', '#0ecb81', '#f0b90b', '#f6465d', '#8b7cf6']

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

  const hasEdgeData = edgeMath && summary && summary.totalTrades > 0

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Edge</span>
          <h1>Statistical analytics</h1>
        </div>
      </div>

      <div className="wrap-wide space-y-6">
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4" aria-label="Distribution stats">
          <KpiCard label="Mean" value={formatMoney(summary?.meanPnl)} hint="Average P&L per trade" tone="neutral" icon={<Sigma size={17} />} />
          <KpiCard label="Median" value={formatMoney(summary?.medianPnl)} hint="Middle value of P&L" tone="neutral" icon={<AlignCenterHorizontal size={17} />} />
          <KpiCard label="Variance" value={formatNumber(summary?.variance, 2)} hint="Spread of outcomes" tone="neutral" icon={<Waves size={17} />} />
          <KpiCard label="Skewness" value={formatNumber(summary?.skewness, 2)} hint="Asymmetry of returns" tone="neutral" icon={<TrendingUp size={17} />} />
          <KpiCard label="Coeff of var" value={`${formatNumber(summary?.coefficientOfVariation, 2)}%`} hint="Risk per unit of return" tone="gold" icon={<Percent size={17} />} />
        </section>

        <section className="grid lg:grid-cols-2 gap-5">
          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">Market hours</span>
              <span className="badge badge-line">Session P&amp;L</span>
            </div>
            <div className="panel-body">
              {hours.length === 0 ? (
                <EmptyState icon={<Clock size={26} />} title="No hourly profile yet" body="Trades with entry times will bucket into sessions." />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={hours}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="hourLabel" hide />
                    <YAxis tick={{ fill: '#5b6470', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0b0e11', border: '1px solid var(--color-line)', borderRadius: 12 }}
                      labelStyle={{ color: '#9aa5b1' }}
                    />
                    <Bar dataKey="totalPnl" radius={[4, 4, 0, 0]}>
                      {hours.map((entry, index) => (
                        <Cell key={'cell-' + index} fill={entry.totalPnl < 0 ? '#f6465d' : '#0ecb81'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">By symbol</span>
              <span className="badge badge-line tnum">{symbols.length} symbols</span>
            </div>
            {symbols.length === 0 ? (
              <EmptyState icon={<Activity size={26} />} title="No symbols yet" body="Upload your trades to see per-symbol performance." />
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Win rate</th>
                      <th className="!text-right">P&amp;L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {symbols.map((row) => (
                      <tr key={row.symbol}>
                        <td>{row.symbol}</td>
                        <td className="tnum">{formatPercent(row.winRate)}</td>
                        <td className={`tnum !text-right ${pnlClass(row.totalPnl)}`}>{formatMoney(row.totalPnl)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Trading Edge Integration */}
        {hasEdgeData && (
          <section className="pt-8 mt-2 border-t border-[var(--color-line)]">
            <div className="mb-6">
              <span className="kicker">Quant</span>
              <h2 className="h-sec flex items-center gap-3 mt-3">
                <TrendingUp size={24} className="text-[var(--color-profit)]" /> Realized trading edge
              </h2>
              <p className="text-[var(--color-muted)] text-[14.5px] mt-2">Calculated using your actual trading journal data.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-5">
              <div className="panel p-6">
                <span className="text-[11.5px] font-bold text-[var(--color-faint)] uppercase tracking-[0.13em] block mb-3">Net expectancy</span>
                <span className={`stat-num tnum text-[34px] leading-none ${edgeMath.grossExpectancy > 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
                  {edgeMath.grossExpectancy > 0 ? '+' : ''}{edgeMath.grossExpectancy.toFixed(2)}
                </span>
              </div>
              <div className="panel p-6">
                <span className="text-[11.5px] font-bold text-[var(--color-faint)] uppercase tracking-[0.13em] block mb-3">Profit factor</span>
                <span className={`stat-num tnum text-[34px] leading-none ${edgeMath.profitFactor > 1.2 ? 'text-[var(--color-profit)]' : 'text-[var(--color-gold)]'}`}>
                  {edgeMath.profitFactor.toFixed(2)}
                </span>
              </div>
              <div className="panel p-6">
                <span className="text-[11.5px] font-bold text-[var(--color-faint)] uppercase tracking-[0.13em] block mb-3">Breakeven win %</span>
                <span className="stat-num tnum text-[34px] leading-none text-[var(--color-ink)]">
                  {(edgeMath.breakEvenWinRate * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              <div className="panel">
                <div className="panel-head">
                  <span className="panel-title flex items-center gap-2">
                    <AlertTriangle size={15} className="text-[var(--color-gold)]" /> Drawdown &amp; survival
                  </span>
                </div>
                <ul className="panel-body !py-2">
                  <li className="flex justify-between items-center gap-4 py-4 border-b border-[var(--color-line)]">
                    <span className="text-[var(--color-muted)] text-[14px]">Expected losing streak (100 trades)</span>
                    <span className="stat-num tnum text-[16px] text-[var(--color-ink)] whitespace-nowrap">{edgeMath.expectedLosingStreak.toFixed(1)} trades</span>
                  </li>
                  <li className="flex justify-between items-center gap-4 py-4 border-b border-[var(--color-line)]">
                    <span className="text-[var(--color-muted)] text-[14px]">Prob of 5 consecutive losses</span>
                    <span className="stat-num tnum text-[16px] text-[var(--color-gold)] whitespace-nowrap">{edgeMath.probLoss(5).toFixed(2)}%</span>
                  </li>
                  <li className="flex justify-between items-center gap-4 py-4 border-b border-[var(--color-line)]">
                    <span className="text-[var(--color-muted)] text-[14px]">Prob of 10 consecutive losses</span>
                    <span className="stat-num tnum text-[16px] text-[var(--color-loss)] whitespace-nowrap">{edgeMath.probLoss(10).toFixed(2)}%</span>
                  </li>
                  <li className="flex justify-between items-center gap-4 py-4">
                    <span className="text-[var(--color-muted)] text-[14px]">Max suggested risk (half-Kelly)</span>
                    <span className="stat-num tnum text-[16px] text-[var(--color-info)] whitespace-nowrap">
                      {edgeMath.maxSuggestedRisk > 0 ? edgeMath.maxSuggestedRisk.toFixed(2) + '%' : 'N/A'}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="panel flex flex-col min-h-[340px]">
                <div className="panel-head">
                  <span className="panel-title flex items-center gap-2">
                    <Activity size={15} className="text-[var(--color-info)]" /> Projected Monte Carlo
                  </span>
                  <span className="badge badge-line">5 paths · 100 trades</span>
                </div>
                <div className="panel-body flex-1 min-h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={edgeMath.mcData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="trade" stroke="#2a323d" tick={{ fill: '#5b6470', fontSize: 12 }} tickLine={false} />
                      <YAxis stroke="#2a323d" tick={{ fill: '#5b6470', fontSize: 12 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0b0e11', border: '1px solid var(--color-line)', borderRadius: 12 }}
                        labelStyle={{ color: '#9aa5b1' }}
                      />
                      {MC_PATH_COLORS.map((color, i) => (
                        <Line key={i} type="monotone" dataKey={`p${i + 1}`} stroke={color} strokeWidth={2} dot={false} opacity={0.6} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
