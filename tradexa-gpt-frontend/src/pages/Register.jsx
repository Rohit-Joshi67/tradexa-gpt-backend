import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.name.trim(), form.email.trim(), form.password)
      navigate('/login', { replace: true })
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
          minLength={6}
          autoComplete="new-password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="primary-btn" disabled={loading} type="submit">
          {loading ? 'Creating…' : 'Create account'}
        </button>
        <p>
          Already have one? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
