import { Link, useNavigate } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function SubscriptionRequired() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen grid place-items-center p-6 relative overflow-hidden bg-[var(--color-abyss)]">
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_20%,transparent_75%)]" />
      <div className="bg-glow w-[420px] h-[320px] bg-[rgba(246,70,93,.08)] top-[8%] right-[12%]" />

      <div className="panel p-8 md:p-10 max-w-lg w-full text-center relative">
        <span className="grid place-items-center w-20 h-20 rounded-3xl bg-[var(--color-loss-dim)] border border-[rgba(246,70,93,.35)] mx-auto mb-6">
          <ShieldAlert size={38} className="text-[var(--color-loss)]" />
        </span>
        <h1 className="font-display font-bold tracking-tight text-[28px] md:text-[32px] mb-4">
          Subscription Required
        </h1>
        <p className="text-[var(--color-muted)] text-[14.5px] leading-relaxed mb-8">
          You are successfully logged in, but you don't have an active <strong className="text-[var(--color-ink)]">Tradexa Pro</strong> subscription.
          Access to the trading dashboard and analytics requires a paid account.
        </p>

        <div className="space-y-4">
          <Link to="/pricing" className="btn btn-profit btn-lg w-full">
            Upgrade to Pro
          </Link>
          <div className="flex gap-3">
            <Link to="/" className="btn btn-ghost flex-1">
              <ArrowLeft size={16} /> Home
            </Link>
            <button type="button" onClick={handleLogout} className="btn btn-danger flex-1">
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
