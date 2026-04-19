'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export interface AuthUser {
  id: string
  username: string
}

export interface AuthSession {
  token: string
  user: AuthUser
}

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

type JwtPayload = {
  sub?: string
  username?: string
  exp?: number
}

type AuthResponse = {
  jwt: string
}

type AuthRequestBody = {
  username: string
  password: string
}

const AUTH_STORAGE_KEY = 'falcon-eye-auth-session'
const AUTH_API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function base64UrlDecode(input: string) {
  const normalizedInput = input.replace(/-/g, '+').replace(/_/g, '/')
  const paddedInput = normalizedInput.padEnd(Math.ceil(normalizedInput.length / 4) * 4, '=')

  if (typeof globalThis.atob !== 'function') {
    return ''
  }

  return globalThis.atob(paddedInput)
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1]

    if (!payload) {
      return null
    }

    return JSON.parse(base64UrlDecode(payload)) as JwtPayload
  } catch (error) {
    console.error('Unable to decode JWT payload:', error)
    return null
  }
}

function getUsernameFromToken(token: string) {
  return decodeJwt(token)?.sub ?? decodeJwt(token)?.username ?? null
}

function readStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storedSession = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!storedSession) {
      return null
    }

    const parsedSession = JSON.parse(storedSession) as AuthSession
    const username = parsedSession.user.username || getUsernameFromToken(parsedSession.token)

    if (!username) {
      return null
    }

    return {
      token: parsedSession.token,
      user: {
        id: parsedSession.user.id || username,
        username,
      },
    }
  } catch (error) {
    console.error('Unable to read auth session from localStorage:', error)
    return null
  }
}

function getAuthHeaders(token?: string) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function getNetworkErrorMessage() {
  return 'We could not connect to the sign-in service. Check your connection and try again.'
}

function getLoginErrorMessage(responseText: string) {
  if (!responseText) {
    return 'We could not sign you in. Check your username and password, then try again.'
  }

  return responseText
}

function getSignupErrorMessage(responseText: string) {
  if (!responseText) {
    return 'We could not create your account. Check your details and try again.'
  }

  return responseText
}

async function requestJwt(path: string, body: AuthRequestBody) {
  try {
    const response = await fetch(`${AUTH_API_BASE}/api/auth${path}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    })

    const responseText = await response.text()

    if (!response.ok) {
      throw new Error(getLoginErrorMessage(responseText))
    }

    if (!responseText) {
      return null
    }

    try {
      return JSON.parse(responseText) as AuthResponse
    } catch (error) {
      console.error('Unable to parse auth response:', error)
      throw new Error('We received an unexpected response from the server. Please try again.')
    }
  } catch (error) {
    if (error instanceof Error && error.message !== getNetworkErrorMessage()) {
      if (error.message === 'Failed to fetch' || error.message === 'NetworkError when attempting to fetch resource.') {
        throw new Error(getNetworkErrorMessage())
      }

      throw error
    }

    throw new Error(getNetworkErrorMessage())
  }
}

async function requestRegistration(path: string, body: AuthRequestBody) {
  try {
    const response = await fetch(`${AUTH_API_BASE}/api/auth${path}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    })

    const responseText = await response.text()

    if (!response.ok) {
      throw new Error(getSignupErrorMessage(responseText))
    }

    return responseText
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === 'Failed to fetch' || error.message === 'NetworkError when attempting to fetch resource.')
    ) {
      throw new Error(getNetworkErrorMessage())
    }

    throw error
  }
}

function buildSession(token: string, username: string): AuthSession {
  return {
    token,
    user: {
      id: username,
      username,
    },
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession())
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      if (session) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    } catch (storageError) {
      console.error('Unable to persist auth session to localStorage:', storageError)
    }
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
      const authResponse = await requestJwt('/login', { username, password })

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
      await requestRegistration('/register', { username, password })
      const loginResponse = await requestJwt('/login', { username, password })

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
