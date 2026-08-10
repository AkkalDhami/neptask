import * as z from "zod"

export const usernameSchema = z
  .string({
    error: "Username is required",
  })
  .trim()
  .min(3, {
    message: "Username must be at least 3 characters long",
  })
  .max(30, {
    message: "Username must be at most 30 characters long",
  })
  .regex(/^[a-zA-Z0-9]+(?:[_-][a-zA-Z0-9]+)*$/, {
    message:
      "Username can only contain letters, numbers, and underscores, and cannot start or end with an underscore",
  })

export const emailSchema = z
  .email({
    error: "Invalid email address",
  })
  .min(1, {
    message: "Email is required",
  })
  .max(128, {
    message: "Email must be at most 128 characters long",
  })

export const passwordSchema = z
  .string({
    error: "Password is required",
  })
  .min(6, {
    message: "Password must be at least 6 characters long",
  })
  .max(128, {
    message: "Password must be at most 128 characters long",
  })

export const SignupFormSchema = z
  .object({
    name: z
      .string({
        error: "Name is required",
      })
      .min(3, {
        message: "Name must be at least 3 characters long",
      })
      .max(100, {
        message: "Name must be at most 100 characters long",
      })
      .regex(/^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/, {
        message:
          "Name can only contain letters and spaces, and cannot start or end with a space",
      }),

    email: emailSchema,

    password: passwordSchema,

    confirmPassword: z.string({
      error: "Please confirm your password",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const SigninFormSchema = z.object({
  email: z
    .email({
      error: "Invalid email address",
    })
    .min(1, {
      message: "Email is required",
    }),
  password: z
    .string({
      error: "Password is required",
    })
    .min(1, {
      message: "Please enter your password",
    }),
})

export const ForgotPasswordSchema = z.object({
  email: emailSchema,
})

export const VerifyResetOtpSchema = z.object({
  otp: z.string({ error: "OTP must be a string" }).trim().min(1, {
    message: "OTP is required",
  }),
  email: emailSchema,
})

export const ResetPasswordSchema = z.object({
  newPassword: passwordSchema,
  confirmNewPassword: passwordSchema,
  email: emailSchema,
})

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  })

export type SignupFormSchemaType = z.infer<typeof SignupFormSchema>
export type SigninFormSchemaType = z.infer<typeof SigninFormSchema>
export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>
export type VerifyResetOtpFormData = z.infer<typeof VerifyResetOtpSchema>
export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>
