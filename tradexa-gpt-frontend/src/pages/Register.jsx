import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Mail, Lock, User } from 'lucide-react'
import { apiErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/ui/AuthLayout'

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
    <AuthLayout
      title="Start your edge."
      subtitle="Free account. 3-day journal trial included — no credit card."
      footer={
        <>
          Already have an account?{' '}
          <Link to={next ? `/login?next=${encodeURIComponent(next)}` : '/login'} className="text-[var(--color-profit)] font-semibold hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <div className="alert alert-error">{error}</div>}
        {notice && <div className="alert alert-ok">{notice}</div>}
        <div>
          <label className="label" htmlFor="reg-name">Full name</label>
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-faint)]" />
            <input
              id="reg-name"
              required
              autoComplete="name"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="field !pl-11"
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="reg-email">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-faint)]" />
            <input
              id="reg-email"
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
          <label className="label" htmlFor="reg-password">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-faint)]" />
            <input
              id="reg-password"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              placeholder="Min 10 chars, letters + numbers"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="field !pl-11"
            />
          </div>
        </div>
        <button className="btn btn-profit btn-lg w-full" disabled={loading} type="submit">
          {loading ? 'Creating…' : <>Create free account <ArrowRight size={17} /></>}
        </button>
        <p className="text-[12px] text-[var(--color-faint)] text-center leading-relaxed">
          By creating an account you agree to the <Link to="/terms" className="underline underline-offset-2 hover:text-[var(--color-muted)]">Terms</Link> and{' '}
          <Link to="/privacy" className="underline underline-offset-2 hover:text-[var(--color-muted)]">Privacy Policy</Link>.
        </p>
      </form>
    </AuthLayout>
  )
}
