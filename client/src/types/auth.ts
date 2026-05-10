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

export interface AuthSession {
  token: string
  user: {
    id: string
    username: string
  }
}
