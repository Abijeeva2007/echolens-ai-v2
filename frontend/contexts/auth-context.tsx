"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useRouter } from "next/navigation"

import { api, type UserProfile } from "@/lib/api"
import { clearToken, getToken, setToken } from "@/lib/auth-storage"

type AuthContextValue = {
  user: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setUser(null)
      return
    }

    try {
      const profile = await api.me(token)
      setUser(profile)
    } catch {
      clearToken()
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refreshUser().finally(() => setLoading(false))
  }, [refreshUser])

  const login = useCallback(
    async (email: string, password: string) => {
      const { access_token } = await api.login({ email, password })
      setToken(access_token)
      await refreshUser()
      router.push("/dashboard")
    },
    [refreshUser, router]
  )

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      await api.register({ username, email, password })
      router.push("/login")
    },
    [router]
  )

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
    router.push("/login")
  }, [router])

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading, login, register, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
