import { BadRequestException, Injectable, Logger } from "@nestjs/common"
import { RedisService } from "@/redis/redis.service"
import { TooManyRequestsException } from "@/shared/exceptions/too-many-requests.exception"
import {
  OTP_CODE_LENGTH,
  OTP_COOL_DOWN,
  OTP_EXPIRES_IN,
  OTP_MAX_ATTEMPTS,
  OTP_SPAM_LOCK_TIME,
} from "./otp.constants"
import { SendOtpType } from "./otp.types"
import { generateOTP } from "@/shared/helpers/token.helper"

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name)
  constructor(private redisService: RedisService) {}

  async checkOtpRestrictions(email: string) {
    const otpLock = await this.redisService.get(`otp_lock:${email}`)
    if (otpLock) {
      throw new BadRequestException(
        "Your Account is locked due to multiple failed attempts. Please try again after 30 minutes."
      )
    }

    if (await this.redisService.get(`otp_spam_lock:${email}`)) {
      throw new TooManyRequestsException(
        "Too many otp requests. Please try again after 1 hour before requesting again."
      )
    }

    if (await this.redisService.get(`otp_cooldown:${email}`)) {
      throw new TooManyRequestsException(
        "Too many otp requests. Please try again after 1 minute before requesting new otp."
      )
    }
  }

  async trackOtpRequests(email: string) {
    try {
      const otpRequestKey = `otp_request_count:${email}`
      const otpRequestsCount = parseInt(
        (await this.redisService.get(otpRequestKey)) || "0"
      )

      if (otpRequestsCount >= OTP_MAX_ATTEMPTS) {
        await this.redisService.set(`otp_spam_lock:${email}`, "locked", {
          ttl: OTP_SPAM_LOCK_TIME, // 1 hour
        })
        throw new TooManyRequestsException(
          "Too many otp requests. Please try again after 1 hour before requesting again."
        )
      }

      await this.redisService.set(otpRequestKey, otpRequestsCount + 1, {
        ttl: OTP_SPAM_LOCK_TIME, // 1 hour
      })
    } catch (error) {
      if (error instanceof TooManyRequestsException) {
        throw error
      }
      throw new BadRequestException("Failed to track otp requests!")
    }
  }

  async sendOtp({
    name,
    email,
    templateName,
    subject,
    code,
    hashCode,
  }: SendOtpType) {
    try {
      const newOtp = generateOTP(OTP_CODE_LENGTH)
      const otpKey = `otp:${email}`
      const otpCooldownKey = `otp_cooldown:${email}`
      const otpHash = hashCode ? hashCode : newOtp.hashCode

      this.logger.log(`OTP generated successfully for ${email}`)

      await this.redisService.set(otpKey, otpHash, {
        ttl: OTP_EXPIRES_IN,
      })

      await this.redisService.set(otpCooldownKey, "locked", {
        ttl: OTP_COOL_DOWN,
      })

      try {
        // todo
        this.logger.log({
          email,
          subject,
          code: code ? code : newOtp.code,
          name,
          html:
            templateName ?? `<p>Your OTP is: ${code ? code : newOtp.code}</p>`,
        })
        // await sendEmail({
        //   email,
        //   subject,
        //   data: {
        //     code: code ? code : newOtp.code,
        //     name,
        //   },
        //   templateName,
        // })
      } catch (error) {
        await Promise.allSettled([
          this.redisService.delete(otpKey),
          this.redisService.delete(otpCooldownKey),
        ])
        throw error
      }
    } catch (error) {
      this.logger.error(`Failed to send otp for ${email}`, error)
      throw new BadRequestException("Failed to send otp!")
    }
  }

  async verifyOtp(hashCode: string, email: string) {
    const hashOtpCodeKey = await this.redisService.get(`otp:${email}`)

    if (!hashOtpCodeKey) {
      throw new BadRequestException("Invalid or expired otp")
    }

    const failedAttemptsKey = `otp_attempts:${email}`
    if (hashOtpCodeKey !== hashCode) {
      const failedAttempts =
        (await this.redisService.increment(failedAttemptsKey)) + 1

      if (failedAttempts === 1) {
        await this.redisService.expire(
          failedAttemptsKey,
          Math.floor(OTP_EXPIRES_IN / 1000)
        )
      }

      if (failedAttempts >= OTP_MAX_ATTEMPTS) {
        await this.redisService.set(`otp_lock:${email}`, "locked", {
          ttl: OTP_SPAM_LOCK_TIME,
        })
        throw new TooManyRequestsException(
          "Too many failed attempts. Please try again after 1 hour."
        )
      }
      throw new BadRequestException(
        `Incorrect OTP. ${OTP_MAX_ATTEMPTS - failedAttempts} attempts left.`
      )
    }

    await this.redisService.delete(`otp:${email}`)
    await this.redisService.delete(failedAttemptsKey)
  }
}
