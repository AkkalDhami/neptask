import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { Request } from "express"

import { RedisService } from "@/redis/redis.service"
import { JwtTokenService } from "@/modules/jwt/jwt.service"
import { JwtPayload } from "@/modules/jwt/jwt.interface"
import { LoggerService } from "@/shared/logger/logger.service"
import { SessionData } from "./auth.types"

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtTokenService,
    private readonly redisService: RedisService,
    private readonly logger: LoggerService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const currentUserAgent = request.headers["user-agent"]
    const currentIp = request.ip || "unknown"

    const token =
      (request.cookies as Record<string, string> | undefined)?.access_token ||
      this.extractToken(request)

    if (!token) {
      throw new UnauthorizedException("Missing access token.")
    }

    let payload: JwtPayload

    try {
      payload = this.jwtService.verifyAccessToken(token)
    } catch {
      throw new UnauthorizedException("Invalid or expired token.")
    }

    const sessionKey = `session:${payload.sessionId}`

    const session = await this.redisService.get<SessionData>(sessionKey)

    if (!session) {
      throw new UnauthorizedException("Invalid or expired session.")
    }

    if (session.userId !== payload.userId) {
      throw new UnauthorizedException("Invalid or expired session.")
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException("Invalid or expired session.")
    }

    if (session.userAgent !== currentUserAgent) {
      //todo: send alert email or sms
      this.logger.warn(
        `User-Agent does not match the active session. Session ID: ${payload.sessionId}`
      )
      throw new UnauthorizedException(
        "User-Agent does not match the active session."
      )
    }

    if (session.ip !== currentIp) {
      //todo: send alert email or sms
      this.logger.warn(
        `IP does not match the active session. Session ID: ${payload.sessionId}`
      )
      throw new UnauthorizedException("IP does not match the active session.")
    }

    request["user"] = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      sid: payload.sessionId,
    }

    return true
  }

  private extractToken(request: Request): string | null {
    const bearer = request.headers.authorization

    if (bearer?.startsWith("Bearer ")) {
      return bearer.substring(7)
    }

    const cookies = request.cookies as Record<string, string> | undefined

    if (cookies?.access_token) {
      return cookies.access_token
    }

    return null
  }
}

/**
 * @description: AuthGuard is used to protect routes that require authentication.
 * usage:
 * ```
 * @UseGuards(AuthGuard)
 * ```
 */
