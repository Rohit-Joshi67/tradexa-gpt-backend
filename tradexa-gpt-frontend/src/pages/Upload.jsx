import { useState } from 'react'
import { apiErrorMessage } from '../api/client'
import { uploadCsv } from '../api/files'

export default function Upload() {
  const [file, setFile] = useState(null)
  const [broker, setBroker] = useState('GENERIC')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    if (!file) return
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const result = await uploadCsv(file, broker)
      setMessage(`Imported ${result.fileName} (${result.fileSize} bytes).`)
      setFile(null)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Import</div>
          <h1>CSV upload</h1>
        </div>
      </div>
      <form className="card stack" style={{ width: 'min(760px, calc(100% - 32px))', margin: '0 auto' }} onSubmit={onSubmit}>
        {error ? <div className="alert">{error}</div> : null}
        {message ? <div className="alert" style={{ background: '#ecfdf5', color: '#166534' }}>{message}</div> : null}
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Select Broker / Format</label>
          <select 
            value={broker} 
            onChange={(e) => setBroker(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
          >
            <option value="GENERIC">Generic Format (Pre-paired Entry/Exit)</option>
            <option value="DHAN">Dhan (Raw Executions)</option>
          </select>
        </div>

        <label className="dropzone">
          <strong>Drop a CSV or click to choose</strong>
          <p className="neutral">
            {broker === 'GENERIC' 
              ? 'Headers: Symbol, Side, Quantity, EntryPrice, ExitPrice, EntryTime, ExitTime, Pnl'
              : 'Headers: Date, Time, Name, Buy/Sell, Order, Exchange, Segment, Quantity/Lot, Trade Price, Trade Value, Status'}
          </p>
          <input
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <p>{file ? file.name : 'No file selected'}</p>
        </label>
        <button className="primary-btn" disabled={!file || loading} type="submit">
          {loading ? 'Uploading...' : 'Upload journal'}
        </button>
      </form>
    </main>
  )
}

