import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Res,
  Get,
  UseGuards,
  Req,
  Delete,
  Param,
} from "@nestjs/common"
import { AuthService } from "./auth.service"
import { VerificationCodeDto, VerifyEmailDto } from "./dtos/verify-email.dto"
import { SiginType, VerificationCodeType, VerifyEmailType } from "./auth.types"
import type { RequestWithUser, UserSessionType } from "./auth.types"
import { SignupUserDto } from "./dtos/signup.dto"
import { ApiResponse } from "@/shared/interfaces"
import { UserResponseType } from "@/modules/users/users.types"
import { SigninUserDto } from "./dtos/signin.dto"
import { IpAddress } from "@/shared/decorators/ip.decorator"
import { UserAgent } from "@/shared/decorators/user-agent.decorator"
import type { Request, Response } from "express"
import { clearAuthCookies, setAuthCookies } from "./utils/cookie.util"
import { AuthGuard } from "./auth.guard"

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  @HttpCode(HttpStatus.CREATED)
  async signupUser(
    @Body() data: SignupUserDto
  ): Promise<ApiResponse<UserResponseType>> {
    const result = await this.authService.signupUser(data)
    return {
      message:
        "User registered successfully. Please check your email for verification.",
      data: result,
    }
  }

  @Post("verification-code")
  @HttpCode(HttpStatus.OK)
  async getVerificationCode(
    @Body() data: VerificationCodeDto
  ): Promise<ApiResponse<VerificationCodeType>> {
    const result = await this.authService.getVerificationCode(data.email)
    return {
      message: "Verification code sent successfully!",
      data: result,
    }
  }

  @Post("verify-email")
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body() data: VerifyEmailDto
  ): Promise<ApiResponse<VerifyEmailType>> {
    const result = await this.authService.verifyUser(data)
    return {
      message: "Email verified successfully!",
      data: result,
    }
  }

  @Post("signin")
  @HttpCode(HttpStatus.OK)
  async signinUser(
    @Body() data: SigninUserDto,
    @IpAddress() ip: string,
    @UserAgent() userAgent: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<ApiResponse<SiginType>> {
    const result = await this.authService.signinUser(data, ip, userAgent)
    setAuthCookies(res, {
      sid: result.tokens.sessionId,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    })
    return {
      message: "User signed in successfully!",
      data: result.user,
    }
  }

  @Get("/refresh")
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<ApiResponse<void>> {
    const cookies = req.cookies as Record<string, string> | undefined
    const refreshToken = cookies?.refresh_token as string
    const accessToken = cookies?.access_token as string

    const result = await this.authService.refreshTokens(
      accessToken,
      refreshToken
    )

    setAuthCookies(res, {
      sid: result.sessionId,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    })

    return {
      message: "Refresh tokens successfully.",
    }
  }

  @UseGuards(AuthGuard)
  @Get("profile")
  @HttpCode(HttpStatus.OK)
  async getProfile(
    @Req() req: RequestWithUser
  ): Promise<ApiResponse<UserResponseType>> {
    const user = req?.user
    const result = await this.authService.getProfile(user.id, user.sid)
    return {
      message: "User profile fetched successfully!",
      data: result,
    }
  }

  @UseGuards(AuthGuard)
  @Get("sessions")
  @HttpCode(HttpStatus.OK)
  async getUserSessions(
    @Req() req: RequestWithUser
  ): Promise<ApiResponse<UserSessionType[]>> {
    const user = req?.user
    const result = await this.authService.getUserSessions(user.id, user.sid)
    result.forEach((session) => {
      if (!session) return
      session.current = session.sessionId === user.sid
    })
    return {
      message: "User sessions fetched successfully!",
      data: result as unknown as UserSessionType[],
    }
  }

  @UseGuards(AuthGuard)
  @Delete("sessions")
  @HttpCode(HttpStatus.OK)
  async deleteAllSessions(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response
  ): Promise<ApiResponse<UserSessionType[]>> {
    const user = req?.user
    await this.authService.deleteAllSessions(user.id)
    clearAuthCookies(res)
    return {
      message: "User sessions deleted successfully!",
    }
  }

  @UseGuards(AuthGuard)
  @Delete("sessions/:sessionId")
  @HttpCode(HttpStatus.OK)
  async deleteSession(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
    @Param("sessionId") sessionId: string
  ): Promise<ApiResponse<UserSessionType[]>> {
    const user = req?.user
    await this.authService.deleteSession(user.id, sessionId)

    if (user.sid === sessionId) {
      clearAuthCookies(res)
    }

    return {
      message: "User session deleted successfully!",
    }
  }

  @UseGuards(AuthGuard)
  @Get("logout")
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response
  ): Promise<ApiResponse<void>> {
    const user = req?.user
    await this.authService.logout(user.id, user.sid)
    clearAuthCookies(res)
    return {
      message: "User logged out successfully!",
    }
  }
}
