"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"

import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"

import Link from "next/link"
import React, { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Spinner } from "@/components/ui/spinner"
import toast from "react-hot-toast"
import { IconEye, IconEyeOff } from "@tabler/icons-react"
import {
  ResetPasswordFormData,
  ResetPasswordSchema,
} from "@/validations/auth.validation"

export default function Page(): React.JSX.Element {
  const [visibility, setVisibility] = useState({
    password: false,
    confirmPassword: false,
  })

  const resetPasswordLoading = false

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      email: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  })

  const toggleVisibility = (field: keyof typeof visibility) => {
    setVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const isLoading =
    form.formState.isSubmitting ||
    form.formState.isLoading ||
    resetPasswordLoading

  async function onSubmit(values: ResetPasswordFormData) {
    try {
      const res = { success: true, message: "Reset code sent" }
      if (res.success) {
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

  return (
    <Card className="relative w-full max-w-md overflow-hidden border-0">
      <CardHeader>
        <CardTitle>
          <h1 className="text-2xl font-semibold">Reset Your Password</h1>
        </CardTitle>
        <CardDescription>
          Please enter your new password and confirm it.
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

            <Controller
              name="newPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>New Password *</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      type={visibility.password ? "text" : "password"}
                      placeholder="New password"
                      autoComplete="off"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        type="button"
                        onClick={() => toggleVisibility("password")}
                        className="bg-transparent hover:bg-transparent dark:hover:bg-transparent"
                      >
                        {visibility.password ? (
                          <IconEyeOff className="size-4 text-muted-foreground" />
                        ) : (
                          <IconEye className="size-4 text-muted-foreground" />
                        )}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="confirmNewPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Confirm Password *</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      type={visibility.confirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      autoComplete="off"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        type="button"
                        onClick={() => toggleVisibility("confirmPassword")}
                        className="bg-transparent hover:bg-transparent dark:hover:bg-transparent"
                      >
                        {visibility.confirmPassword ? (
                          <IconEyeOff className="size-4 text-muted-foreground" />
                        ) : (
                          <IconEye className="size-4 text-muted-foreground" />
                        )}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <Button type="submit" disabled={isLoading} className="mt-4 w-full">
            {isLoading ? (
              <>
                <Spinner />
                <span className="ml-2">Resetting...</span>
              </>
            ) : (
              "Reset Password"
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
    </Card>
  )
}
