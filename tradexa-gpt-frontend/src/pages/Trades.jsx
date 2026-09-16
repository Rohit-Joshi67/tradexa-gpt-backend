import { useEffect, useState } from 'react'
import { apiErrorMessage } from '../api/client'
import { createTrade, deleteTrade, getTrades, updateTrade } from '../api/trades'
import { formatMoney, fromDateTimeLocal, pnlClass, toDateTimeLocal } from '../utils/format'

const emptyForm = {
  symbol: '',
  side: 'BUY',
  quantity: 1,
  entryPrice: '',
  exitPrice: '',
  entryTime: '',
  exitTime: '',
  pnl: '',
}

export default function Trades() {
  const [trades, setTrades] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const rows = await getTrades()
    setTrades(rows || [])
  }

  useEffect(() => {
    load().catch((err) => setError(apiErrorMessage(err)))
  }, [])

  function payload() {
    return {
      symbol: form.symbol.trim().toUpperCase(),
      side: form.side,
      quantity: Number(form.quantity),
      entryPrice: Number(form.entryPrice),
      exitPrice: Number(form.exitPrice),
      entryTime: fromDateTimeLocal(form.entryTime),
      exitTime: fromDateTimeLocal(form.exitTime),
      pnl: Number(form.pnl),
    }
  }

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (editingId) await updateTrade(editingId, payload())
      else await createTrade(payload())
      setForm(emptyForm)
      setEditingId(null)
      await load()
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Delete this trade?')) return
    await deleteTrade(id)
    await load()
  }

  function startEdit(trade) {
    setEditingId(trade.id)
    setForm({
      symbol: trade.symbol,
      side: trade.side,
      quantity: trade.quantity,
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      entryTime: toDateTimeLocal(trade.entryTime),
      exitTime: toDateTimeLocal(trade.exitTime),
      pnl: trade.pnl,
    })
  }

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Journal</div>
          <h1>{editingId ? 'Edit trade' : 'New trade'}</h1>
        </div>
      </div>

      <section className="card" style={{ width: 'min(1240px, calc(100% - 32px))', margin: '0 auto 16px' }}>
        {error ? <div className="alert">{error}</div> : null}
        <form className="stack" onSubmit={onSubmit}>
          <div className="form-grid">
            <input required placeholder="Symbol" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} />
            <select value={form.side} onChange={(e) => setForm({ ...form, side: e.target.value })}>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
            <input required type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <input required type="number" step="0.01" min="0.01" placeholder="Entry price" value={form.entryPrice} onChange={(e) => setForm({ ...form, entryPrice: e.target.value })} />
            <input required type="number" step="0.01" min="0.01" placeholder="Exit price" value={form.exitPrice} onChange={(e) => setForm({ ...form, exitPrice: e.target.value })} />
            <input required type="number" step="0.01" placeholder="PnL" value={form.pnl} onChange={(e) => setForm({ ...form, pnl: e.target.value })} />
            <input required type="datetime-local" value={form.entryTime} onChange={(e) => setForm({ ...form, entryTime: e.target.value })} />
            <input required type="datetime-local" value={form.exitTime} onChange={(e) => setForm({ ...form, exitTime: e.target.value })} />
          </div>
          <div className="filters">
            <button className="primary-btn" disabled={saving} type="submit">
              {saving ? 'Saving…' : editingId ? 'Update trade' : 'Add trade'}
            </button>
            {editingId ? (
              <button className="ghost-btn" type="button" onClick={() => { setEditingId(null); setForm(emptyForm) }}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="card" style={{ width: 'min(1240px, calc(100% - 32px))', margin: '0 auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Side</th>
              <th>Qty</th>
              <th>PnL</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id}>
                <td>{trade.symbol}</td>
                <td><span className={`badge ${trade.side === 'BUY' ? 'buy' : 'sell'}`}>{trade.side}</span></td>
                <td>{trade.quantity}</td>
                <td className={pnlClass(trade.pnl)}>{formatMoney(trade.pnl)}</td>
                <td>
                  <button className="ghost-btn" type="button" onClick={() => startEdit(trade)}>Edit</button>
                  <button className="danger-btn" type="button" onClick={() => onDelete(trade.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
