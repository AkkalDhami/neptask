import { OtpType } from "@/types"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthData {
  user: {
    id: string
    name: string
    username: string
    email: string
    avatar?: string
  } | null
  otp: {
    type: OtpType
    email: string
  } | null
}

export interface AuthStore extends AuthData {
  setUser: (user: AuthData["user"]) => void

  setOtp: (otp: AuthData["otp"]) => void
}

export const useUserStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      otp: null,
      setUser: (user) => set({ user }),
      setOtp: (otp) => set({ otp }),
    }),
    {
      name: "neptask-storage",
    }
  )
)
