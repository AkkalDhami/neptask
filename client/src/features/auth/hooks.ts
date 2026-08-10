import {
  SigninFormSchemaType,
  SignupFormSchemaType,
} from "@/validations/auth.validation"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import * as authApi from "./api"
import { SignInResponse } from "./types"
import { VerifyEmailType } from "@/types"

export function useAuth() {
  const queryClient = useQueryClient()
  const signinMutation = useMutation({
    mutationFn: async (data: SigninFormSchemaType) => {
      const res = await authApi.signin(data)
      return res as SignInResponse
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] })
    },
  })

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormSchemaType) => {
      const res = await authApi.signup(data)
      return res as SignInResponse
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] })
    },
  })

  const verifyEmailMutation = useMutation({
    mutationFn: async (data: VerifyEmailType) => {
      const res = await authApi.verifyEmail(data)
      return res as SignInResponse
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] })
    },
  })

  return {
    signin: signinMutation.mutateAsync,
    isSigninPending: signinMutation.isPending,

    signup: signupMutation.mutateAsync,
    isSignupPending: signupMutation.isPending,

    verifyEmail: verifyEmailMutation.mutateAsync,
    isEmailVerifying: verifyEmailMutation.isPending,
  }
}
