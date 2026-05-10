import { type UserProfile } from 'src/types/auth'

const AUTH_PROFILE_STORAGE_KEY = 'falcon-eye-auth-profiles'

type StoredProfiles = Record<string, UserProfile>

const formatDisplayName = (username: string) => {
  const normalizedUsername = username.trim()

  if (!normalizedUsername) {
    return 'Observer'
  }

  if (normalizedUsername.includes('@')) {
    return normalizedUsername.split('@')[0].replace(/[._-]+/g, ' ')
  }

  return normalizedUsername.replace(/[._-]+/g, ' ')
}

const formatEmail = (username: string) => {
  const normalizedUsername = username.trim()

  if (!normalizedUsername) {
    return 'observer@falcon-eye.local'
  }

  if (normalizedUsername.includes('@')) {
    return normalizedUsername
  }

  return `${normalizedUsername}@falcon-eye.local`
}

export function createUserProfile(username: string, createdAt = new Date().toISOString()): UserProfile {
  return {
    displayName: formatDisplayName(username),
    email: formatEmail(username),
    createdAt,
  }
}

function readStoredProfiles(): StoredProfiles {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const storedValue = window.localStorage.getItem(AUTH_PROFILE_STORAGE_KEY)

    if (!storedValue) {
      return {}
    }

    return JSON.parse(storedValue) as StoredProfiles
  } catch (error) {
    console.error('Unable to read auth profiles from localStorage:', error)
    return {}
  }
}

function storeProfiles(profiles: StoredProfiles) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(AUTH_PROFILE_STORAGE_KEY, JSON.stringify(profiles))
  } catch (error) {
    console.error('Unable to persist auth profiles to localStorage:', error)
  }
}

export function readStoredUserProfile(username: string): UserProfile | null {
  const profile = readStoredProfiles()[username]

  return profile ?? null
}

export function persistUserProfile(username: string, profile: UserProfile) {
  const profiles = readStoredProfiles()
  profiles[username] = profile
  storeProfiles(profiles)
}

export function resolveUserProfile(username: string): UserProfile {
  const existingProfile = readStoredUserProfile(username)

  if (existingProfile) {
    return existingProfile
  }

  const createdProfile = createUserProfile(username)
  persistUserProfile(username, createdProfile)

  return createdProfile
}
