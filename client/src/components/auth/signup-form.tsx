"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { IconEye, IconEyeOff } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

import {
  SignupFormSchema,
  SignupFormSchemaType,
} from "@/validations/auth.validation"
import Link from "next/link"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/features/auth/hooks"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/stores/user.store"

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const router = useRouter()
  const { signup, isSignupPending } = useAuth()

  const { setOtp } = useUserStore()

  const form = useForm<SignupFormSchemaType>({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form

  const onSubmit = async (data: SignupFormSchemaType) => {
    try {
      const res = await signup(data)
      if (res.success) {
        toast.success(res.message || "Signup successful")
        setOtp({
          email: data.email ?? res.data?.email,
          type: "verify-email",
        })
        router.push("/verify-email")
      } else {
        toast.error(res.message || "Signup failed")
      }

      reset()
    } catch (error) {
      toast.error((error as Error).message || "Signup failed")
      console.error(error)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-md space-y-4 rounded-md bg-card p-4 sm:p-5"
    >
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-medium">Create an account</h2>
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="text-primary underline-offset-2 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>

      <FieldGroup className="grid gap-4">
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">Name</FieldLabel>

          <Input
            id="name"
            placeholder="Enter your name"
            aria-invalid={!!errors.name}
            {...register("name")}
          />

          {errors.name && <FieldError errors={[errors.name]} />}
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>

          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />

          {errors.email && <FieldError errors={[errors.email]} />}
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>

          <InputGroup>
            <InputGroupInput
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />

            <InputGroupAddon align="inline-end">
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="flex items-center"
              >
                {showPassword ? (
                  <IconEye className="size-4" />
                ) : (
                  <IconEyeOff className="size-4" />
                )}
              </button>
            </InputGroupAddon>
          </InputGroup>

          {errors.password && <FieldError errors={[errors.password]} />}
        </Field>

        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>

          <InputGroup>
            <InputGroupInput
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />

            <InputGroupAddon align="inline-end">
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="flex items-center"
              >
                {showConfirmPassword ? (
                  <IconEye className="size-4" />
                ) : (
                  <IconEyeOff className="size-4" />
                )}
              </button>
            </InputGroupAddon>
          </InputGroup>

          {errors.confirmPassword && (
            <FieldError errors={[errors.confirmPassword]} />
          )}
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        disabled={isSubmitting || isSignupPending}
        className={"mt-2 w-full"}
      >
        {isSubmitting || isSignupPending ? (
          <>
            <Spinner /> Creating...
          </>
        ) : (
          "Create an Account"
        )}
      </Button>
    </form>
  )
}
