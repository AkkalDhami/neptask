import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { Request } from "express"

export const IpAddress = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<Request>()
    return (req.headers["cf-connecting-ip"] ||
      req.headers["x-real-ip"] ||
      req.headers["x-forwarded-for"] ||
      req.ip ||
      "unknown") as string
  }
)
