type SendOtpBase = {
  name: string
  email: string
  templateName?: string
  subject: string
}

type SendOtpWithCode = SendOtpBase & {
  code: string
  hashCode: string
}

type SendOtpWithoutCode = SendOtpBase & {
  code?: never
  hashCode?: never
}

export type SendOtpType = SendOtpWithCode | SendOtpWithoutCode
