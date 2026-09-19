import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { clearProfile, getStoredProfile, setAccessToken, storeProfile } from '../api/client'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Stored profile (id/name/email/role) — NO token. The access token lives in
  // memory; the refresh token lives in the backend's httpOnly cookie.
  const [user, setUser] = useState(() => getStoredProfile())
  const [authReady, setAuthReady] = useState(false)

  // On first load: if a profile exists, try a silent refresh so the session
  // survives a page reload without ever storing the token in localStorage.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const profile = getStoredProfile()
      if (profile) {
        try {
          const data = await authApi.refreshSession()
          if (!cancelled) {
            setAccessToken(data?.token)
            setUser(profile)
          }
        } catch {
          if (!cancelled) {
            clearProfile()
            setUser(null)
          }
        }
      }
      if (!cancelled) setAuthReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: authReady && Boolean(user),
      authReady,
      async login(email, password) {
        const session = await authApi.login(email, password)
        setAccessToken(session.token)
        const next = {
          id: session.id,
          name: session.name,
          email: session.email,
          role: session.role,
          subscription: session.subscription,
        }
        storeProfile(next)
        setUser(next)
        return next
      },
      async register(name, email, password) {
        return authApi.register(name, email, password)
      },
      async logout() {
        try {
          await authApi.logout()
        } catch {
          // Server-side logout is best-effort; always clear local state.
        }
        setAccessToken(null)
        clearProfile()
        setUser(null)
      },
    }),
    [user, authReady],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
