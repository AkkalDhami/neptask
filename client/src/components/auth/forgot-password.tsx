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

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import {
  ForgotPasswordFormData,
  ForgotPasswordSchema,
  VerifyResetOtpFormData,
} from "@/validations/auth.validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import Link from "next/link"
import { IconRefresh } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

const OTP_LENGTH = 6

const OTP_SLOT_KEYS = Array.from(
  { length: OTP_LENGTH },
  (_, i) => `otp-slot-${i}`
)

export function ForgotPassword() {
  const { otp, setOtp } = useUserStore()

  const router = useRouter()

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const [otpCode, setOtpCode] = useState("")

  const handleOtpChange = (value: string) => {
    setOtpCode(value)
  }

  const verifyResetOtpLoading = false
  const forgotPasswordLoading = false

  const isLoading = form.formState.isSubmitting || form.formState.isLoading

  async function onSubmit(data: ForgotPasswordFormData) {
    console.log({ data })
    try {
      const res = { success: true, message: "Reset code sent" }
      if (res.success) {
        setOtp({
          email: data.email,
          type: "reset-password",
        })
        form.reset()
        toast.success(res.message || "Reset code sent")
      } else {
        toast.error(res.message || "Something went wrong.")
      }
    } catch (e) {
      const error = e as { data?: { message?: string } }
      toast.error((error?.data?.message as string) || "Something went wrong.")
    }
  }

  async function verifyResetOtpSubmit(values: VerifyResetOtpFormData) {
    console.log({ values })
    try {
      const res = { success: true, message: "Password reset otp verified" }
      if (res.success) {
        toast.success(res.message || "Password reset otp verified")
        setOtp(null)
        setOtpCode("")
        router.push("/reset-password")
      } else {
        toast.error(res.message || "Something went wrong.")
      }
    } catch (e) {
      const error = e as { data?: { message?: string } }
      toast.error((error?.data?.message as string) || "Something went wrong.")
    }
  }

  return (
    <>
      <Card className="relative w-full max-w-105 overflow-hidden border-0">
        {!(otp?.type === "reset-password" || otp?.email) ? (
          <>
            <CardHeader>
              <CardTitle>
                <h2 className="text-2xl font-medium">Forgot password?</h2>
              </CardTitle>
              <CardDescription>
                Enter your email and we&apos;ll send you instructions to reset
                your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Email *</FieldLabel>
                        <Input
                          {...field}
                          placeholder="john@example.com"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="mt-4 w-full"
                >
                  {isLoading ? (
                    <>
                      <Spinner />
                      <span className="ml-2">Sending code...</span>
                    </>
                  ) : (
                    "Send Reset Code"
                  )}
                </Button>
              </form>

              <div className="mt-3 text-muted-foreground">
                Remembered your password?{" "}
                <Link href="/signin" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>
                <h2 className="text-2xl font-medium">Email Verification</h2>
              </CardTitle>
              <CardDescription>
                A reset code has been sent to{" "}
                <strong className="text-primary font-medium">{`<${otp.email}>`}</strong>.
              </CardDescription>
              <CardDescription>
                Please enter the code below to verify your identity and reset
                your password.
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
                onClick={() =>
                  verifyResetOtpSubmit({
                    email:
                      otp.type === "reset-password"
                        ? (otp.email as string)
                        : "",
                    otp: otpCode,
                  })
                }
                disabled={
                  otpCode.length !== 6 ||
                  !(otp.email as string)?.trim() ||
                  verifyResetOtpLoading
                }
                className="mt-4 w-full rounded-md bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-zinc-400 sm:h-10"
              >
                {verifyResetOtpLoading ? (
                  <>
                    <Spinner /> <span>Verifying...</span>
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-muted-foreground">
                Did you not receive the email?{" "}
                <Button
                  onClick={() =>
                    onSubmit({
                      email:
                        otp.type === "reset-password"
                          ? (otp.email as string)
                          : "",
                    })
                  }
                  disabled={isLoading || verifyResetOtpLoading}
                  variant={"link"}
                  className="flex items-center justify-center gap-1 text-primary hover:underline"
                >
                  Resend code
                  <IconRefresh
                    className={cn(
                      "size-4",
                      forgotPasswordLoading && "animate-spin"
                    )}
                  />
                </Button>
              </div>

              <div className="mt-1 text-muted-foreground">
                Remembered your password?{" "}
                <Link href="/signin" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </>
  )
}
