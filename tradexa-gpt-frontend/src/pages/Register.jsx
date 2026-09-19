import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'

function safeNext(value) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : null
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = safeNext(searchParams.get('next'))
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setLoading(true)
    try {
      const result = await register(form.name.trim(), form.email.trim(), form.password)
      if (result?.emailVerificationRequired) {
        setNotice('Account created. Please check your inbox for the verification link, then sign in.')
      } else {
        navigate(next ? `/login?next=${encodeURIComponent(next)}` : '/login', { replace: true })
      }
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
        <h1>Start a cleaner journal.</h1>
        <p className="neutral">One account. Your trades stay private to you.</p>
        {error ? <div className="alert">{error}</div> : null}
        {notice ? <div className="alert alert-success">{notice}</div> : null}
        <input
          required
          autoComplete="name"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
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
          minLength={10}
          autoComplete="new-password"
          placeholder="Password (min 10 chars, letters + numbers)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="primary-btn" disabled={loading} type="submit">
          {loading ? 'Creating…' : 'Create account'}
        </button>
        <p>
          Already have one? <Link to={next ? `/login?next=${encodeURIComponent(next)}` : '/login'}>Sign in</Link>
        </p>
      </form>
    </div>
  )
}
