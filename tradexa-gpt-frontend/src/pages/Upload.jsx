import { useState } from 'react'
import { apiErrorMessage } from '../api/client'
import { uploadCsv } from '../api/files'

export default function Upload() {
  const [file, setFile] = useState(null)
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
      const result = await uploadCsv(file)
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
        <label className="dropzone">
          <strong>Drop a CSV or click to choose</strong>
          <p className="neutral">Headers: Symbol, Side, Quantity, EntryPrice, ExitPrice, EntryTime, ExitTime, Pnl</p>
          <input
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <p>{file ? file.name : 'No file selected'}</p>
        </label>
        <button className="primary-btn" disabled={!file || loading} type="submit">
          {loading ? 'Uploading…' : 'Upload journal'}
        </button>
      </form>
    </main>
  )
}
