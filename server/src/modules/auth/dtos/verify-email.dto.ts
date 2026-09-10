import { OTP_CODE_LENGTH } from "@/modules/otp/otp.constants"
import { IsEmail, IsNotEmpty, MaxLength } from "class-validator"

export class VerifyEmailDto {
  @IsNotEmpty()
  @MaxLength(OTP_CODE_LENGTH)
  code!: string

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(128)
  email!: string
}

export class VerificationCodeDto {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(128)
  email!: string
}
