import { ForgotPassword } from "@/components/auth/forgot-password"

export default function page() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <ForgotPassword />
    </div>
  )
}
