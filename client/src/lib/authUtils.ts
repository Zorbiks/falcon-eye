import api from 'src/lib/authAPI'
import { type JwtPayload, type AuthResponse, type AuthRequestBody, type AuthSession } from 'src/types/auth'
import { resolveUserProfile } from 'src/lib/authProfile'

export type { JwtPayload, AuthResponse, AuthRequestBody, AuthSession }

const AUTH_STORAGE_KEY = 'falcon-eye-auth-session'

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

export function readStoredSession(): AuthSession | null {
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

    const profile = resolveUserProfile(username)

    return {
      token: parsedSession.token,
      user: {
        id: parsedSession.user.id || username,
        username,
        displayName: parsedSession.user.displayName || profile.displayName,
        email: parsedSession.user.email || profile.email,
        createdAt: parsedSession.user.createdAt || profile.createdAt,
      },
    }
  } catch (error) {
    console.error('Unable to read auth session from localStorage:', error)
    return null
  }
}

export function persistSession(session: AuthSession | null): void {
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
}

export async function signInRequest(credentials: AuthRequestBody) {
  try {
    const response = await api.post<AuthResponse>('/login', credentials)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('We could not sign you in. Check your username and password, then try again.')
  }
}

export async function signUpRequest(credentials: AuthRequestBody) {
  try {
    await api.post('/register', credentials)
    const loginResponse = await api.post<AuthResponse>('/login', credentials)
    return loginResponse.data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('We could not create your account. Check your details and try again.')
  }
}

export function buildSession(token: string, username: string): AuthSession {
  const profile = resolveUserProfile(username)

  return {
    token,
    user: {
      id: username,
      username,
      displayName: profile.displayName,
      email: profile.email,
      createdAt: profile.createdAt,
    },
  }
}
