import { env } from "@/configs/env.config"
import { CookieOptions, Response } from "express"
import {
  ACCESS_TOKEN_EXPIRY_MS,
  REFRESH_TOKEN_EXPIRY_MS,
  SESSION_EXPIRY_MS,
} from "../auth.constants"

export const COOKIE_NAME = {
  SID: "sid",
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const

const isProduction = env.NODE_ENV === "production"

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
}

export const COOKIE_OPTIONS = {
  SID: {
    ...baseCookieOptions,
    maxAge: SESSION_EXPIRY_MS, // 7 days
  } satisfies CookieOptions,

  ACCESS_TOKEN: {
    ...baseCookieOptions,
    maxAge: ACCESS_TOKEN_EXPIRY_MS, // 15 minutes
  } satisfies CookieOptions,

  REFRESH_TOKEN: {
    ...baseCookieOptions,
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_EXPIRY_MS, // 7 days
  } satisfies CookieOptions,
} as const

export function setAuthCookies(
  res: Response,
  tokens: {
    sid: string
    accessToken: string
    refreshToken: string
  }
): void {
  res.cookie(COOKIE_NAME.SID, tokens.sid, COOKIE_OPTIONS.SID)

  res.cookie(
    COOKIE_NAME.ACCESS_TOKEN,
    tokens.accessToken,
    COOKIE_OPTIONS.ACCESS_TOKEN
  )

  res.cookie(
    COOKIE_NAME.REFRESH_TOKEN,
    tokens.refreshToken,
    COOKIE_OPTIONS.REFRESH_TOKEN
  )
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(COOKIE_NAME.SID, COOKIE_OPTIONS.SID)
  res.clearCookie(COOKIE_NAME.ACCESS_TOKEN, COOKIE_OPTIONS.ACCESS_TOKEN)
  res.clearCookie(COOKIE_NAME.REFRESH_TOKEN, COOKIE_OPTIONS.REFRESH_TOKEN)
}
