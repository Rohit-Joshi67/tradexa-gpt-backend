import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiErrorMessage } from '../api/client'
import { verifyEmail } from '../api/auth'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [state, setState] = useState('verifying') // verifying | success | error
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setState('error')
      setError('This verification link is missing or malformed.')
      return
    }
    let cancelled = false
    verifyEmail(token)
      .then(() => {
        if (!cancelled) setState('success')
      })
      .catch((err) => {
        if (!cancelled) {
          setState('error')
          setError(apiErrorMessage(err))
        }
      })
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <div className="auth-screen">
      <div className="auth-card stack">
        <div className="brand">
          <span className="brand-mark">T</span>
          Tradexa GPT
        </div>
        {state === 'verifying' && (
          <>
            <h1>Verifying your email…</h1>
            <p className="neutral">One moment.</p>
          </>
        )}
        {state === 'success' && (
          <>
            <h1>Email verified.</h1>
            <p className="neutral">Your account is ready.</p>
            <p>
              <Link to="/login">Sign in</Link>
            </p>
          </>
        )}
        {state === 'error' && (
          <>
            <h1>Verification failed.</h1>
            <div className="alert">{error}</div>
            <p>
              <Link to="/login">Back to sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
