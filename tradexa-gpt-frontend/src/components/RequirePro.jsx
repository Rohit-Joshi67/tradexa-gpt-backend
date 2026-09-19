import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { usePlan } from '../context/PlanContext'

/**
 * Renders children only for PRO users. Everyone else sees a polished
 * upsell card pointing at /pricing. This is a UX hint only — real
 * enforcement lives in the backend.
 */
export default function RequirePro({ children }) {
  const { plan, loading } = usePlan()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-neutral-400">Checking your plan…</p>
      </div>
    )
  }

  if (plan === 'PRO') return children

  return (
    <div className="rounded-3xl border border-indigo-500/30 bg-indigo-500/10 p-10 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Lock className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">This is a Tradexa Pro feature</h3>
      <p className="text-neutral-400 mb-8">
        Upgrade to Tradexa Pro to unlock this and everything else — unlimited journal,
        deep analytics, and the AI copilot, all ad-free.
      </p>
      <Link
        to="/pricing"
        className="block w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-colors"
      >
        View Pro Plans
      </Link>
    </div>
  )
}
