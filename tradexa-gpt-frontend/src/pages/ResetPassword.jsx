import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { apiErrorMessage } from '../api/client'
import { resetPassword } from '../api/auth'

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
      <div className="auth-screen">
        <div className="auth-card stack">
          <h1>Invalid reset link.</h1>
          <p className="neutral">This password reset link is missing or malformed.</p>
          <p>
            <Link to="/forgot-password">Request a new one</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-screen">
      <form className="auth-card stack" onSubmit={onSubmit}>
        <div className="brand">
          <span className="brand-mark">T</span>
          Tradexa GPT
        </div>
        <h1>Choose a new password.</h1>
        <p className="neutral">Min 10 characters, with at least one letter and one number.</p>
        {error ? <div className="alert">{error}</div> : null}
        <input
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="primary-btn" disabled={loading} type="submit">
          {loading ? 'Updating…' : 'Update password'}
        </button>
        <p>
          <Link to="/login">Back to sign in</Link>
        </p>
      </form>
    </div>
  )
}
