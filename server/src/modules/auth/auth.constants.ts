export const LOGIN_MAX_ATTEMPTS = 5 as const

export const LOCK_TIME = 24 * 60 * 60 // 24 hours

export const ACCESS_TOKEN_EXPIRY = 15 * 60 // 15 minutes
export const ACCESS_TOKEN_EXPIRY_MS = 15 * 60 * 1000 // 15 minutes

export const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 // 7 days
export const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export const SESSION_EXPIRY = 7 * 24 * 60 * 60 // 7 days
export const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export const RESET_PASSWORD_TOKEN_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes

export const REACTIVATION_AVAILABLE_AT_MS = 24 * 60 * 60 * 1000 // 24 hours

export const DELETE_ACCOUNT_TOKEN_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes
