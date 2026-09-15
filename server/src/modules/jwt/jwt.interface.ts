export interface JwtPayload {
  userId: string
  sessionId: string
  email: string
  role: string
  [key: string]: unknown
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}
