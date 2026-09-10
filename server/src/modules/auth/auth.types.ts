import { UserResponseType, UserRoleType } from "@/modules/users/users.types"
import { Request } from "express"

export type VerifyEmailType = UserResponseType

export type VerificationCodeType = {
  code: string
}

export type SiginType = UserResponseType & {
  lastLoginAt: Date | null
  emailVerified: boolean
}

export type HandleTokensType = {
  ip: string
  userAgent: string
  id: string
  email: string
  role: UserRoleType
}

export type RefreshTokenData = {
  userId: string
  tokenHash: string
  expiresAt: Date
}

export type SessionData = {
  userId: string
  sessionId: string
  refreshTokenHash: string
  userAgent: string
  ip: string
  createdAt: Date
  expiresAt: Date
}

export type TokenPair = {
  accessToken: string
  refreshToken: string
}

export type RequestWithUser = Request & {
  user: {
    id: string
    email: string
    role: UserRoleType
    sid: string
  }
}

export type UserSessionType = Omit<SessionData, "refreshTokenHash"> & {
  current: boolean
}
