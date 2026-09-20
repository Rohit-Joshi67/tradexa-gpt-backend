import { useState } from 'react'
import { Upload as UploadIcon, UploadCloud, FileText } from 'lucide-react'
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

      <div className="wrap max-w-2xl">
        <form className="panel" onSubmit={onSubmit}>
          <div className="panel-head">
            <span className="panel-title">Upload journal</span>
            <span className="badge badge-line">CSV</span>
          </div>
          <div className="panel-body space-y-5">
            {error ? <div className="alert alert-error">{error}</div> : null}
            {message ? <div className="alert alert-ok">{message}</div> : null}

            <div>
              <label className="label" htmlFor="upload-broker">Select Broker / Format</label>
              <select
                id="upload-broker"
                value={broker}
                onChange={(e) => setBroker(e.target.value)}
                className="field"
              >
                <option value="GENERIC">Generic Format (Pre-paired Entry/Exit)</option>
                <option value="DHAN">Dhan (Raw Executions)</option>
              </select>
            </div>

            <label
              htmlFor="upload-file"
              className="block border-2 border-dashed border-[var(--color-line2)] rounded-2xl p-10 text-center cursor-pointer transition-colors hover:border-[var(--color-profit-deep)] hover:bg-[rgba(14,203,129,.03)]"
            >
              <span className="grid place-items-center w-14 h-14 rounded-2xl bg-[var(--color-profit-dim)] border border-[rgba(14,203,129,.3)] mx-auto mb-4">
                {file ? (
                  <FileText size={26} className="text-[var(--color-profit)]" />
                ) : (
                  <UploadCloud size={26} className="text-[var(--color-profit)]" />
                )}
              </span>
              <strong className="block font-display font-semibold text-[16px] mb-2">
                Drop a CSV or click to choose
              </strong>
              <p className="neutral text-[13.5px] leading-relaxed mb-4">
                {broker === 'GENERIC'
                  ? 'Headers: Symbol, Side, Quantity, EntryPrice, ExitPrice, EntryTime, ExitTime, Pnl'
                  : 'Headers: Date, Time, Name, Buy/Sell, Order, Exchange, Segment, Quantity/Lot, Trade Price, Trade Value, Status'}
              </p>
              <p className={`font-mono text-[13px] ${file ? 'text-[var(--color-profit)]' : 'text-[var(--color-faint)]'}`}>
                {file ? file.name : 'No file selected'}
              </p>
              <input
                id="upload-file"
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>

            <button className="btn btn-profit btn-lg w-full" disabled={!file || loading} type="submit">
              {loading ? 'Uploading...' : <><UploadIcon size={17} /> Upload journal</>}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
