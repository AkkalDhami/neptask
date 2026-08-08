import { VerifyEmail } from "@/components/auth/verify-email"

export default function page() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <VerifyEmail />
    </div>
  )
}
