import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { apiErrorMessage } from '../api/client'
import { verifyEmail } from '../api/auth'
import AuthLayout from '../components/ui/AuthLayout'

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
    <AuthLayout
      title={state === 'verifying' ? 'Verifying your email…' : state === 'success' ? 'Email verified.' : 'Verification failed.'}
      subtitle={state === 'verifying' ? 'One moment while we confirm your address.' : state === 'success' ? 'Your account is ready to trade with a clear ledger.' : 'Something went wrong with this link.'}
    >
      {state === 'verifying' && (
        <div className="flex items-center gap-3 text-[var(--color-muted)]">
          <Loader2 size={20} className="animate-spin text-[var(--color-profit)]" />
          <span className="text-[14px]">Confirming your email address…</span>
        </div>
      )}
      {state === 'success' && (
        <div className="space-y-4">
          <div className="alert alert-ok !flex !gap-3 items-start">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <span>Your email is verified. You can sign in now.</span>
          </div>
          <Link to="/login" className="btn btn-profit btn-lg w-full">
            Sign in
          </Link>
        </div>
      )}
      {state === 'error' && (
        <div className="space-y-4">
          <div className="alert alert-error !flex !gap-3 items-start">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
          <Link to="/login" className="btn btn-line w-full">
            Back to sign in
          </Link>
        </div>
      )}
    </AuthLayout>
  )
}
