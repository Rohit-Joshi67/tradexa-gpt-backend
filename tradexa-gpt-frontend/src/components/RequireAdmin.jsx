import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Admin-only gate. Client-side convenience — the real enforcement is the
 * server-side @PreAuthorize("hasRole('ADMIN')") on /api/v1/admin/**.
 */
export default function RequireAdmin({ children }) {
  const { user, isAuthenticated, authReady } = useAuth()

  if (!authReady) {
    return (
      <div className="auth-screen">
        <p className="neutral">Loading Tradexa...</p>
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return children
}
