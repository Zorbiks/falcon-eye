'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  readStoredSession,
  persistSession,
  signInRequest,
  signUpRequest,
  buildSession,
  type AuthSession,
} from 'src/lib/authUtils'
import type { AuthUser } from 'src/types/auth'

export interface SignInCredentials {
  username: string
  password: string
}

export interface SignUpCredentials extends SignInCredentials {}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  signIn: (credentials: SignInCredentials) => Promise<boolean>
  signUp: (credentials: SignUpCredentials) => Promise<boolean>
  signOut: () => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession())
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    persistSession(session)
  }, [session])

  const clearError = () => setError(null)

  const signIn = async ({ username, password }: SignInCredentials) => {
    if (!username || !password) {
      setError('Username and password are required.')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const authResponse = await signInRequest({ username, password })

      if (!authResponse?.jwt) {
        throw new Error('Authentication token missing from server response.')
      }

      setSession(buildSession(authResponse.jwt, username))
      return true
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'We could not sign you in. Please try again.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async ({ username, password }: SignUpCredentials) => {
    if (!username || !password) {
      setError('Username and password are required.')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const loginResponse = await signUpRequest({ username, password })

      if (!loginResponse?.jwt) {
        throw new Error('Authentication token missing from server response.')
      }

      setSession(buildSession(loginResponse.jwt, username))
      return true
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'We could not create your account. Please try again.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    setSession(null)
    setError(null)
  }

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session),
      isLoading,
      error,
      signIn,
      signUp,
      signOut,
      clearError,
    }),
    [error, isLoading, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
