import { Injectable, NestMiddleware } from "@nestjs/common"
import { Request, Response, NextFunction, RequestHandler } from "express"
import morgan from "morgan"
import { LoggerService } from "../logger/logger.service"

@Injectable()
export class MorganMiddleware implements NestMiddleware {
  private readonly loggerMiddleware: RequestHandler

  constructor(private readonly logger: LoggerService) {
    this.loggerMiddleware = morgan(":method :url :status :response-time ms", {
      stream: {
        write: (message: string) => {
          this.logger.info(message.trim())
        },
      },
    })
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.loggerMiddleware(req, res, next)
  }
}
