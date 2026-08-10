import { ApiResponse } from "@/interfaces"

export interface SigninResponseData {
  id: string
  name: string
  username: string
  email: string
  role: "user" | "owner" | "admin" | "moderator" | "member"
  emailVerified: boolean
  lastLoginAt?: string | null
}

export type SignInResponse = ApiResponse<SigninResponseData>
