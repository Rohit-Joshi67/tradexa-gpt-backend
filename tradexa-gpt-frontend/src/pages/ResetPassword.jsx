import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowRight, Lock, AlertTriangle } from 'lucide-react'
import { apiErrorMessage } from '../api/client'
import { resetPassword } from '../api/auth'
import AuthLayout from '../components/ui/AuthLayout'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(token, password)
      navigate('/login', { replace: true, state: { notice: 'Password updated. Please sign in with your new password.' } })
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout
        title="Invalid reset link."
        subtitle="This password reset link is missing or malformed."
        footer={
          <Link to="/forgot-password" className="text-[var(--color-profit)] font-semibold hover:underline">
            Request a new one
          </Link>
        }
      >
        <div className="alert alert-error !flex !gap-3 items-start">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <span>No reset token found in the URL.</span>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Choose a new password."
      subtitle="Min 10 characters, with at least one letter and one number."
      footer={
        <Link to="/login" className="text-[var(--color-profit)] font-semibold hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <div className="alert alert-error">{error}</div>}
        <div>
          <label className="label" htmlFor="rp-password">New password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-faint)]" />
            <input
              id="rp-password"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field !pl-11"
            />
          </div>
        </div>
        <button className="btn btn-profit btn-lg w-full" disabled={loading} type="submit">
          {loading ? 'Updating…' : <>Update password <ArrowRight size={17} /></>}
        </button>
      </form>
    </AuthLayout>
  )
}
