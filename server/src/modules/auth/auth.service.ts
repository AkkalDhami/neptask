import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common"
import { UsersService } from "@/modules/users/users.service"
import { RedisService } from "@/redis/redis.service"
import { OtpService } from "@/modules/otp/otp.service"
import { JwtTokenService } from "@/modules/jwt/jwt.service"
import { TokenService } from "@/modules/token/token.service"
import { SignupUserDto } from "./dtos/signup.dto"
import { VerifyEmailDto } from "./dtos/verify-email.dto"
import { SigninUserDto } from "./dtos/signin.dto"
import {
  LOCK_TIME,
  LOGIN_MAX_ATTEMPTS,
  REFRESH_TOKEN_EXPIRY,
  SESSION_EXPIRY,
  SESSION_EXPIRY_MS,
} from "./auth.constants"
import { HandleTokensType, RefreshTokenData, SessionData } from "./auth.types"
import { UserData } from "@/modules/users/users.types"
import type { IHashingService } from "@/modules/hashing/hashing.interface"
import { HASHING_SERVICE } from "@/modules/hashing/hashing.module"

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  constructor(
    private userService: UsersService,
    private redisService: RedisService,
    private otpService: OtpService,
    private jwtService: JwtTokenService,
    private tokenService: TokenService,
    @Inject(HASHING_SERVICE)
    private readonly hashingService: IHashingService
  ) {}

  private extractUsername(email: string) {
    return email.split("@")[0]
  }

  async signupUser(signupDto: SignupUserDto) {
    const existinguser = await this.userService.findUserByEmail(signupDto.email)
    if (existinguser) {
      throw new ConflictException("User with this email already exists!")
    }

    const hashedPassword = await this.hashingService.hash(signupDto.password)

    const { code, hashCode } = this.tokenService.generateOTP(6)

    await this.otpService.checkOtpRestrictions(signupDto.email)
    await this.otpService.trackOtpRequests(signupDto.email)

    this.logger.log(`OTP sent to ${signupDto.email}: ${code}`)
    await this.otpService.sendOtp({
      email: signupDto.email,
      code,
      hashCode,
      subject: "Verify Your Email",
      name: signupDto.name,
    })

    const username = this.extractUsername(signupDto.email)

    const result = await this.userService.createUser({
      ...signupDto,
      username,
      password: hashedPassword,
    })

    return result
  }

  async verifyUser(data: VerifyEmailDto) {
    const existinguser = await this.userService.findUserByEmail(data.email)
    if (!existinguser) {
      throw new UnauthorizedException("Unauthorized, user not found!")
    }

    const hashCode = this.tokenService.generateHashedToken(data.code)

    await this.otpService.verifyOtp(hashCode, data.email)

    const result = await this.userService.verifyUser(data.email)

    return result
  }

  async getVerificationCode(email: string) {
    const existinguser = await this.userService.findUserByEmail(email)
    if (!existinguser) {
      throw new UnauthorizedException("User with this email doesnot exists!")
    }

    if (existinguser.emailVerified) {
      throw new ForbiddenException("User with this email already verified!")
    }

    const { code, hashCode } = this.tokenService.generateOTP(6)

    await this.otpService.checkOtpRestrictions(email)
    await this.otpService.trackOtpRequests(email)

    this.logger.log(`OTP sent to ${email}: ${code}`)
    await this.otpService.sendOtp({
      email: email,
      code,
      hashCode,
      subject: "Verify Your Email",
      name: existinguser.name,
    })

    return {
      code: code,
    }
  }

  async signinUser(data: SigninUserDto, ip: string, userAgent: string) {
    const existinguser = await this.userService.findUserByEmail(data.email)
    if (!existinguser) {
      throw new BadRequestException("Invalid email or password!")
    }

    if (!existinguser.emailVerified) {
      await this.getVerificationCode(data.email)
      throw new BadRequestException(
        "Email not verified. Verification code sent to your email."
      )
    }

    const isPasswordValid = await this.hashingService.compare(
      data.password,
      existinguser.password || ""
    )

    if (!isPasswordValid) {
      //! data can be stored in redis as well

      let lockUntil: Date | null = null
      const failedLoginAttempts = existinguser.failedLoginAttempts || 0
      const newFailedLoginAttempts = failedLoginAttempts + 1
      if (newFailedLoginAttempts >= LOGIN_MAX_ATTEMPTS) {
        lockUntil = new Date(new Date().getTime() + LOCK_TIME * 1000)
      }

      await this.userService.updateUserLoginAttempts({
        failedLoginAttempts: newFailedLoginAttempts,
        lockUntil,
        email: existinguser.email,
      })

      throw new BadRequestException("Invalid email or password!")
    }

    const result = await this.userService.updateUserLastLoginAt(
      existinguser.email
    )

    const tokens = await this.generateTokens({
      id: result.id,
      role: result.role,
      email: existinguser.email,
      ip,
      userAgent,
    })

    const userProfileKey = `user_profile:${result.id}`

    const userData: UserData = {
      id: result.id,
      name: result.name,
      email: result.email,
      role: result.role,
      emailVerified: result.emailVerified,
      lastLoginAt: result.lastLoginAt,
    }

    await this.redisService.hset(userProfileKey, userData)

    return {
      user: {
        id: result.id,
        name: result.name,
        username: result.username,

        email: result.email,
        role: result.role,
        emailVerified: result.emailVerified,
        lastLoginAt: result.lastLoginAt,
      },
      tokens,
    }
  }

  async generateTokens(data: HandleTokensType) {
    const sessionId = this.tokenService.generateUUID()
    const { accessToken, refreshToken } = this.jwtService.generateTokenPair({
      userId: data.id,
      sessionId,
      email: data.email,
      role: data.role,
    })

    const hashedRefreshToken =
      this.tokenService.generateHashedToken(refreshToken)

    const refreshTokenData: RefreshTokenData = {
      userId: data.id,
      tokenHash: hashedRefreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
    }

    const sessionData: SessionData = {
      userId: data.id,
      sessionId,
      refreshTokenHash: hashedRefreshToken,
      userAgent: data.userAgent,
      ip: data.ip,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + SESSION_EXPIRY_MS),
    }

    const refreshTokenKey = `refresh_token:${hashedRefreshToken}`
    const sessionKey = `session:${sessionId}`
    const userSessionsKey = `user_sessions:${data.id}`

    //* store refreshToken in redis
    await this.redisService.set(refreshTokenKey, refreshTokenData, {
      ttl: REFRESH_TOKEN_EXPIRY,
    })

    //* store session in redis
    await this.redisService.set(sessionKey, sessionData, {
      ttl: SESSION_EXPIRY,
    })

    //* store sessionId in userSessions set
    await this.redisService.sadd(userSessionsKey, sessionId)

    return {
      accessToken,
      refreshToken,
      sessionId,
    }
  }

  async getProfile(id: string, currentSid: string) {
    const user = await this.redisService.hgetall<UserData>(`user_profile:${id}`)

    if (!user) {
      throw new UnauthorizedException("User with this id doesnot exists!")
    }

    const sessions = await this.getUserSessions(id, currentSid)

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      sessions,
    }
  }

  async getUserSessions(id: string, currentSid: string) {
    const sessionIds = await this.redisService.smembers(`user_sessions:${id}`)
    const sessions = await Promise.all(
      sessionIds.map(async (sessionId) => {
        const sessionKey = `session:${sessionId}`
        return await this.redisService.get<SessionData>(sessionKey)
      })
    )

    const filteredData = sessions
      .filter(Boolean)
      .map((session: SessionData | null) => {
        return {
          sessionId: session?.sessionId,
          userAgent: session?.userAgent,
          userId: session?.userId,
          ip: session?.ip,
          createdAt: session?.createdAt,
          expiresAt: session?.expiresAt,
          current: session?.sessionId === currentSid,
        }
      })
    return filteredData
  }

  async deleteSession(userId: string, sessionId: string) {
    const sessionKey = `session:${sessionId}`
    const userSessionsKey = `user_sessions:${userId}`
    const sessionData = await this.redisService.get<SessionData>(sessionKey)

    if (!sessionData) {
      throw new UnauthorizedException("Invalid or expired session.")
    }

    if (sessionData.userId !== userId) {
      throw new UnauthorizedException("Invalid or expired session.")
    }

    const refreshTokenKey = `refresh_token:${sessionData.refreshTokenHash}`
    await this.redisService.delete(sessionKey)
    await this.redisService.delete(refreshTokenKey)
    await this.redisService.srem(userSessionsKey, sessionId)
  }

  async deleteAllSessions(userId: string) {
    const userSessionsKey = `user_sessions:${userId}`

    const sessionIds = await this.redisService.smembers(userSessionsKey)

    if (!sessionIds || sessionIds.length === 0) {
      throw new UnauthorizedException("User has no sessions.")
    }

    await Promise.all(
      sessionIds.map(async (sessionId) => {
        const sessionKey = `session:${sessionId}`

        const session = await this.redisService.get<SessionData>(sessionKey)

        const refreshTokenKey = `refresh_token:${session?.refreshTokenHash || ""}`
        await this.redisService.delete(sessionKey)
        await this.redisService.delete(refreshTokenKey)
        await this.redisService.srem(userSessionsKey, sessionId)
      })
    )

    await this.redisService.delete(userSessionsKey)
  }

  async refreshTokens(accessToken: string | null, refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException("Missing refresh token.")
    }

    const decodedRefreshToken = this.jwtService.verifyRefreshToken(refreshToken)
    if (!decodedRefreshToken) {
      throw new UnauthorizedException("Invalid or expired refresh token.")
    }

    const refreshTokenHash = this.tokenService.generateHashedToken(refreshToken)

    const refreshTokenKey = `refresh_token:${refreshTokenHash}`
    const storedToken =
      await this.redisService.get<RefreshTokenData>(refreshTokenKey)
    if (!storedToken) {
      throw new UnauthorizedException(
        "Token reuse detected. Please login again."
      )
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException("Invalid or expired refresh token.")
    }

    if (storedToken.userId !== decodedRefreshToken.userId) {
      throw new UnauthorizedException("Invalid or expired refresh token.")
    }

    const sessionKey = `session:${decodedRefreshToken.sessionId}`

    const session = await this.redisService.get<SessionData>(sessionKey)
    // console.log({ session })
    if (!session) {
      throw new UnauthorizedException("Invalid or expired session.")
    }

    if (
      session.refreshTokenHash !== refreshTokenHash ||
      session.userId !== decodedRefreshToken.userId ||
      decodedRefreshToken.sessionId !== session.sessionId
    ) {
      throw new UnauthorizedException("Invalid or expired session.")
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException("Invalid or expired session.")
    }

    if (accessToken) {
      const decodedAccess = this.jwtService.verifyAccessToken(accessToken)
      if (!decodedAccess) {
        throw new UnauthorizedException("Invalid or expired access token.")
      }
      if (
        decodedAccess.userId !== session.userId ||
        decodedAccess.sessionId !== session.sessionId
      ) {
        throw new UnauthorizedException("Invalid access token.")
      }
    }

    let user = await this.redisService.hgetall<UserData>(
      `user_profile:${session.userId}`
    )
    if (!user) {
      user = await this.userService.findUserById(session.userId)
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      this.jwtService.generateTokenPair({
        userId: user.id,
        sessionId: session.sessionId,
        email: user.email,
        role: user.role,
      })

    const newRefreshTokenHash =
      this.tokenService.generateHashedToken(newRefreshToken)

    //? rotate refreshToken in redis
    await Promise.all([
      this.redisService.delete(refreshTokenKey),
      this.redisService.delete(sessionKey),
    ])

    const refreshTokenData: RefreshTokenData = {
      userId: user.id,
      tokenHash: newRefreshTokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
    }
    const sessionData: SessionData = {
      userId: user.id,
      sessionId: session.sessionId,
      refreshTokenHash: newRefreshTokenHash,
      userAgent: session.userAgent,
      ip: session.ip,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + SESSION_EXPIRY),
    }

    const newRefreshTokenKey = `refresh_token:${newRefreshTokenHash}`
    const newSessionKey = `session:${sessionData.sessionId}`

    await Promise.all([
      this.redisService.set(newRefreshTokenKey, refreshTokenData, {
        ttl: REFRESH_TOKEN_EXPIRY,
      }),

      this.redisService.set(newSessionKey, sessionData, {
        ttl: SESSION_EXPIRY,
      }),
    ])

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      sessionId: sessionData.sessionId,
    }
  }

  async logout(userId: string, sessionId: string) {
    await this.deleteSession(userId, sessionId)
  }
}
