export type OtpType = "reset-password" | "verify-email"

export type VerifyEmailType = {
  email: string
  code: string
}
