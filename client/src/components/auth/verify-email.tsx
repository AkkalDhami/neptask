"use client"

import { OTPField, OTPFieldInput } from "@/components/ui/otp-field"
import { useUserStore } from "@/stores/user.store"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Spinner } from "@/components/ui/spinner"
import { IconRefresh } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"
import { VerifyEmailType } from "@/types"
import { useAuth } from "@/features/auth/hooks"

const OTP_LENGTH = 6

const OTP_SLOT_KEYS = Array.from(
  { length: OTP_LENGTH },
  (_, i) => `otp-slot-${i}`
)

export function VerifyEmail() {
  const { otp } = useUserStore()

  const router = useRouter()

  const { verifyEmail, isEmailVerifying } = useAuth()

  const [otpCode, setOtpCode] = useState("")

  const handleOtpChange = (value: string) => {
    setOtpCode(value)
  }

  const verifyResetOtpLoading = false
  // console.log({ otp })
  // if (!otp?.email || otp.type !== "verify-email") {
  //   router.push("/signup")
  //   return <></>
  // }

  async function onSubmit(data: VerifyEmailType) {
    try {
      const res = await verifyEmail(data)
      if (res.success) {
        toast.success(res.message || "Verification successful")
        router.push("/signin")
        setOtpCode("")
      } else {
        toast.error(res.message || "Something went wrong.")
      }
    } catch (error) {
      toast.error((error as Error).message || "Something went wrong.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="text-2xl font-medium">Verify Your Email</h2>
        </CardTitle>
        <CardDescription>
          We have sent a verification code to your email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OTPField
          aria-label="Forgot Password OTP"
          className={"gap-4"}
          length={OTP_LENGTH}
          onValueChange={handleOtpChange}
        >
          {OTP_SLOT_KEYS.map((slotKey, index) => (
            <OTPFieldInput
              key={slotKey}
              aria-label={
                index === 0
                  ? undefined
                  : `Character ${index + 1} of ${OTP_LENGTH}`
              }
              className={"sm:size-12"}
            />
          ))}
        </OTPField>
        <Button
          type="submit"
          disabled={isEmailVerifying}
          onClick={() => onSubmit({ code: otpCode, email: otp?.email || "" })}
          className="mt-4 w-full rounded-md bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-zinc-400 sm:h-10"
        >
          {isEmailVerifying ? (
            <>
              <Spinner /> <span>Verifying...</span>
            </>
          ) : (
            "Verify Email"
          )}
        </Button>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-muted-foreground">
          Did you not receive the email?{" "}
          <Button
            variant={"link"}
            className="flex items-center justify-center gap-1 text-primary hover:underline"
          >
            Resend code
            <IconRefresh
              className={cn("size-4", verifyResetOtpLoading && "animate-spin")}
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
