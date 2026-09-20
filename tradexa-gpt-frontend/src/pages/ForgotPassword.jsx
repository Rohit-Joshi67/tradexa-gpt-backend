import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Mail, CheckCircle2 } from 'lucide-react'
import { apiErrorMessage } from '../api/client'
import { forgotPassword } from '../api/auth'
import AuthLayout from '../components/ui/AuthLayout'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword(email.trim())
      setDone(true)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Reset your password."
      subtitle="Enter your account email and we'll send you a reset link."
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className="text-[var(--color-profit)] font-semibold hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {done ? (
        <div className="alert alert-ok !flex !gap-3 items-start">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          <span>If an account exists for this email, a reset link has been sent. Check your inbox.</span>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <div className="alert alert-error">{error}</div>}
          <div>
            <label className="label" htmlFor="fp-email">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-faint)]" />
              <input
                id="fp-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field !pl-11"
              />
            </div>
          </div>
          <button className="btn btn-profit btn-lg w-full" disabled={loading} type="submit">
            {loading ? 'Sending…' : <>Send reset link <ArrowRight size={17} /></>}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
