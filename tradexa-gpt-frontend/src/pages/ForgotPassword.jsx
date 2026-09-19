import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiErrorMessage } from '../api/client'
import { forgotPassword } from '../api/auth'

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
    <div className="auth-screen">
      <form className="auth-card stack" onSubmit={onSubmit}>
        <div className="brand">
          <span className="brand-mark">T</span>
          Tradexa GPT
        </div>
        <h1>Reset your password.</h1>
        <p className="neutral">Enter your account email and we'll send you a reset link.</p>
        {error ? <div className="alert">{error}</div> : null}
        {done ? (
          <div className="alert alert-success">
            If an account exists for this email, a reset link has been sent. Check your inbox.
          </div>
        ) : (
          <>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="primary-btn" disabled={loading} type="submit">
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </>
        )}
        <p>
          <Link to="/login">Back to sign in</Link>
        </p>
      </form>
    </div>
  )
}
