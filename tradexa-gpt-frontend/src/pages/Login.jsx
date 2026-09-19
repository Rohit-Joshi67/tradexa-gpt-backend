import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { apiErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'

function safeNext(value) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : null
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const next = safeNext(searchParams.get('next'))
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [notice] = useState(location.state?.notice || '')
  const [loading, setLoading] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email.trim(), form.password)
      navigate(next || '/', { replace: true })
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <form className="auth-card stack" onSubmit={onSubmit}>
        <div className="brand">
          <span className="brand-mark">T</span>
          Tradexa GPT
        </div>
        <h1>Trade with a clear ledger.</h1>
        <p className="neutral">Sign in to your journal, analytics, and CSV import.</p>
        {error ? <div className="alert">{error}</div> : null}
        {notice ? <div className="alert alert-success">{notice}</div> : null}
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          required
          autoComplete="current-password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="primary-btn" disabled={loading} type="submit">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <p>
          <Link to="/forgot-password">Forgot your password?</Link>
        </p>
        <p>
          New here? <Link to={next ? `/register?next=${encodeURIComponent(next)}` : '/register'}>Create an account</Link>
        </p>
      </form>
    </div>
  )
}
