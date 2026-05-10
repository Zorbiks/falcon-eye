export type JwtPayload = {
  sub?: string
  username?: string
  exp?: number
}

export type AuthResponse = {
  jwt: string
}

export type AuthRequestBody = {
  username: string
  password: string
}

export interface UserProfile {
  displayName: string
  email: string
  createdAt: string
}

export interface AuthUser extends UserProfile {
  id: string
  username: string
}

export interface AuthSession {
  token: string
  user: AuthUser
}
