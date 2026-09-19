import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePlan } from '../context/PlanContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, authReady } = useAuth()
  const { plan, trialActive, loading: planLoading } = usePlan()

  if (!authReady || planLoading) {
    return (
      <div className="auth-screen">
        <p className="neutral">Loading Tradexa...</p>
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />
  // Server truth from /me: the journal is Pro-only once the 3-day trial ends.
  // (The legacy user.subscription string is retired — it was always null.)
  if (plan !== 'PRO' && !trialActive) return <Navigate to="/subscription-required" replace />
  return children
}
