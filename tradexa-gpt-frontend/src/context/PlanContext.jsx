import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getMe } from '../api/billing'
import { useAuth } from './AuthContext'

const PlanContext = createContext(null)

const EMPTY = {
  plan: 'FREE',
  adsEnabled: true,
  trialActive: false,
  trialEndsAt: null,
  subscription: null,
}

export function PlanProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [state, setState] = useState({ ...EMPTY, loading: true })

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }))
    try {
      const data = await getMe()
      setState({
        plan: data?.plan || 'FREE',
        adsEnabled: data?.adsEnabled !== false,
        trialActive: Boolean(data?.trialActive),
        trialEndsAt: data?.trialEndsAt ?? null,
        subscription: data?.subscription ?? null,
        loading: false,
      })
    } catch {
      // If /me fails (or the user is logged out), fall back to a safe FREE state.
      setState({ ...EMPTY, loading: false })
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      refresh()
    } else {
      setState({ ...EMPTY, loading: false })
    }
  }, [isAuthenticated, refresh])

  const value = useMemo(() => ({ ...state, refresh }), [state, refresh])
  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
}

export function usePlan() {
  const context = useContext(PlanContext)
  if (!context) throw new Error('usePlan must be used inside PlanProvider')
  return context
}
