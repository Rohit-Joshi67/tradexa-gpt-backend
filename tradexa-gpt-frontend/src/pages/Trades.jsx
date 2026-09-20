import { useEffect, useState } from 'react'
import { Plus, Save, X, Pencil, Trash2, Receipt } from 'lucide-react'
import { apiErrorMessage } from '../api/client'
import { createTrade, deleteTrade, getTrades, updateTrade } from '../api/trades'
import { formatMoney, fromDateTimeLocal, pnlClass, toDateTimeLocal } from '../utils/format'
import EmptyState from '../components/EmptyState'

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
        {trades.length > 0 && (
          <span className="badge badge-line tnum">{trades.length} trades</span>
        )}
      </div>

      <div className="wrap-wide space-y-6">
        <section className="panel">
          <div className="panel-head">
            <span className="panel-title">{editingId ? 'Edit trade' : 'Log a trade'}</span>
            {editingId && <span className="badge badge-gold">Editing</span>}
          </div>
          <form onSubmit={onSubmit}>
            <div className="panel-body">
              {error ? <div className="alert alert-error mb-5">{error}</div> : null}
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="label" htmlFor="trade-symbol">Symbol</label>
                  <input
                    id="trade-symbol"
                    required
                    placeholder="NIFTY"
                    value={form.symbol}
                    onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                    className="field uppercase tnum"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="trade-side">Side</label>
                  <select
                    id="trade-side"
                    value={form.side}
                    onChange={(e) => setForm({ ...form, side: e.target.value })}
                    className="field"
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="trade-qty">Quantity</label>
                  <input
                    id="trade-qty"
                    required
                    type="number"
                    min="1"
                    placeholder="1"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="field tnum"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="trade-pnl">PnL (₹)</label>
                  <input
                    id="trade-pnl"
                    required
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.pnl}
                    onChange={(e) => setForm({ ...form, pnl: e.target.value })}
                    className="field tnum"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="trade-entry-price">Entry price</label>
                  <input
                    id="trade-entry-price"
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={form.entryPrice}
                    onChange={(e) => setForm({ ...form, entryPrice: e.target.value })}
                    className="field tnum"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="trade-exit-price">Exit price</label>
                  <input
                    id="trade-exit-price"
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={form.exitPrice}
                    onChange={(e) => setForm({ ...form, exitPrice: e.target.value })}
                    className="field tnum"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="trade-entry-time">Entry time</label>
                  <input
                    id="trade-entry-time"
                    required
                    type="datetime-local"
                    value={form.entryTime}
                    onChange={(e) => setForm({ ...form, entryTime: e.target.value })}
                    className="field tnum"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="trade-exit-time">Exit time</label>
                  <input
                    id="trade-exit-time"
                    required
                    type="datetime-local"
                    value={form.exitTime}
                    onChange={(e) => setForm({ ...form, exitTime: e.target.value })}
                    className="field tnum"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 px-5 pb-5">
              <button className="btn btn-profit" disabled={saving} type="submit">
                {saving ? (
                  'Saving…'
                ) : editingId ? (
                  <><Save size={16} /> Update trade</>
                ) : (
                  <><Plus size={16} /> Add trade</>
                )}
              </button>
              {editingId ? (
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => { setEditingId(null); setForm(emptyForm) }}
                >
                  <X size={16} /> Cancel
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="panel">
          <div className="panel-head">
            <span className="panel-title">All trades</span>
          </div>
          {trades.length === 0 ? (
            <EmptyState
              icon={<Receipt size={26} />}
              title="No trades yet"
              body="Log your first trade above, or import a whole history via CSV upload."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Side</th>
                    <th>Qty</th>
                    <th>PnL</th>
                    <th><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => (
                    <tr key={trade.id}>
                      <td className="tnum">{trade.symbol}</td>
                      <td>
                        <span className={`badge ${trade.side === 'BUY' ? 'badge-buy' : 'badge-sell'}`}>
                          {trade.side}
                        </span>
                      </td>
                      <td className="tnum">{trade.quantity}</td>
                      <td className={`${pnlClass(trade.pnl)} tnum font-semibold`}>
                        {formatMoney(trade.pnl)}
                      </td>
                      <td>
                        <div className="flex gap-2 justify-end">
                          <button className="btn btn-ghost btn-sm" type="button" onClick={() => startEdit(trade)}>
                            <Pencil size={14} /> Edit
                          </button>
                          <button className="btn btn-danger btn-sm" type="button" onClick={() => onDelete(trade.id)}>
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
