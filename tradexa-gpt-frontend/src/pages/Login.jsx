import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Mail, Lock } from 'lucide-react'
import { apiErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/ui/AuthLayout'

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
    <AuthLayout
      title="Welcome back."
      subtitle="Sign in to your journal, analytics and AI copilot."
      footer={
        <>
          New here?{' '}
          <Link to={next ? `/register?next=${encodeURIComponent(next)}` : '/register'} className="text-[var(--color-profit)] font-semibold hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <div className="alert alert-error">{error}</div>}
        {notice && <div className="alert alert-ok">{notice}</div>}
        <div>
          <label className="label" htmlFor="login-email">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-faint)]" />
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="field !pl-11"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-[7px]">
            <label className="label !mb-0" htmlFor="login-password">Password</label>
            <Link to="/forgot-password" className="text-[12.5px] font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-faint)]" />
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="field !pl-11"
            />
          </div>
        </div>
        <button className="btn btn-profit btn-lg w-full" disabled={loading} type="submit">
          {loading ? 'Signing in…' : <>Sign in <ArrowRight size={17} /></>}
        </button>
      </form>
    </AuthLayout>
  )
}
