import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { JwtPayload, TokenPair } from "./jwt.interface"

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow("JWT_ACCESS_SECRET"),
      expiresIn: this.configService.getOrThrow("ACCESS_TOKEN_EXPIRY"),
    })
  }

  generateRefreshToken(userId: string, sessionId: string): string {
    return this.jwtService.sign(
      { userId, sessionId },
      {
        secret: this.configService.getOrThrow("JWT_REFRESH_SECRET"),
        expiresIn: this.configService.getOrThrow("REFRESH_TOKEN_EXPIRY"),
      }
    )
  }

  generateTokenPair(payload: JwtPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(
        payload.userId,
        payload.sessionId
      ),
    }
  }

  verifyAccessToken(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token, {
      secret: this.configService.getOrThrow("JWT_ACCESS_SECRET"),
    })
  }

  verifyRefreshToken(token: string): { userId: string; sessionId: string } {
    return this.jwtService.verify<{ userId: string; sessionId: string }>(
      token,
      {
        secret: this.configService.getOrThrow("JWT_REFRESH_SECRET"),
      }
    )
  }
}
