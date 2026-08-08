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
  SigninFormSchema,
  SigninFormSchemaType,
} from "@/validations/auth.validation"
import Link from "next/link"
import { Spinner } from "@/components/ui/spinner"
import { OAuthSignin } from "./oauth-signin"
import { useAuth } from "@/features/auth/hooks"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export function SigninForm() {
  const [showPassword, setShowPassword] = useState(false)

  const { signin, isSigninPending } = useAuth()

  const router = useRouter()

  const form = useForm<SigninFormSchemaType>({
    resolver: zodResolver(SigninFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form

  const onSubmit = async (data: SigninFormSchemaType) => {
    try {
      const res = await signin(data)

      if (res.success) {
        toast.success("Signin successful")
      } else {
        toast.error(res.message || "Signin failed")
      }
      console.log({res});
      if (res.message?.toLowerCase().includes("email not verified")) {
        router.push("/verify-email")
      }
      
      reset()
    } catch (error) {
     
      toast.error((error as Error).message || "Signin failed")
      console.error(error)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-md bg-card space-y-4 rounded-md p-4 sm:p-5"
    >
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-medium">Welcome Back</h2>
        <p className="text-sm text-muted-foreground">
          Don&lsquo;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary underline-offset-2 hover:underline"
          >
            Signup
          </Link>
        </p>
      </div>

      <FieldGroup className="grid gap-4">
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="text-sm text-primary underline-offset-2 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

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
      </FieldGroup>

      <Button
        type="submit"
        disabled={isSubmitting || isSigninPending}
        className={"mt-2 w-full"}
      >
        {isSubmitting || isSigninPending ? (
          <>
            <Spinner /> Signin...
          </>
        ) : (
          "Signin"
        )}
      </Button>

      <OAuthSignin />
    </form>
  )
}
