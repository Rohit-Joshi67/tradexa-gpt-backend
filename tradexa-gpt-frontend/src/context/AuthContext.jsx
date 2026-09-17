import { createContext, useContext, useMemo, useState } from 'react'
import { clearSession, getStoredSession, storeSession } from '../api/client'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredSession())

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user?.token),
      async login(email, password) {
        const session = await authApi.login(email, password)
        const next = {
          id: session.id,
          name: session.name,
          email: session.email,
          role: session.role,
          token: session.token,
          subscription: session.subscription,
        }
        storeSession(next)
        setUser(next)
        return next
      },
      async register(name, email, password) {
        return authApi.register(name, email, password)
      },
      logout() {
        clearSession()
        setUser(null)
      },
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}



