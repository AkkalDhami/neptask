import { api } from "@/lib/axios"
import { VerifyEmailType } from "@/types"
import {
  SigninFormSchemaType,
  SignupFormSchemaType,
} from "@/validations/auth.validation"
import axios from "axios"

export const signin = async (data: SigninFormSchemaType) => {
  try {
    const res = await api.post(`/auth/signin`, data)
    console.log({ r: res })
    return res.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw (
        error.response?.data ?? {
          success: false,
          statusCode: 500,
          message: "Something went wrong",
        }
      )
    }

    throw error
  }
}

export const signup = async (data: SignupFormSchemaType) => {
  try {
    const res = await api.post(`/auth/signup`, {
      name: data.name,
      email: data.email,
      password: data.password,
    })
    console.log({ r: res })
    return res.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw (
        error.response?.data ?? {
          success: false,
          statusCode: 500,
          message: "Something went wrong",
        }
      )
    }

    throw error
  }
}

export const verifyEmail = async (data: VerifyEmailType) => {
  const res = await api.post(`/auth/verify-email`, data)
  return res.data
}