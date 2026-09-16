import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getMarketHours, getSummary, getSymbols } from '../api/analytics'
import EmptyState from '../components/EmptyState'
import { formatMoney, formatNumber, formatPercent, pnlClass } from '../utils/format'

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

  return (
    <main className="page">
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
      </section>

      <section className="grid-2">
        <article className="card">
          <div className="card-title"><h3>Market hours</h3></div>
          {hours.length === 0 ? (
            <EmptyState icon="🕒" title="No hourly profile yet" body="Trades with entry times will bucket into sessions." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={hours}>
                <CartesianGrid stroke="#eef2f0" vertical={false} />
                <XAxis dataKey="hourLabel" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalPnl" fill="#0f766e" radius={[8, 8, 0, 0]} />
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
    </main>
  )
}
