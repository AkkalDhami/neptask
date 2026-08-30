import morgan from "morgan"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "@/app.module"
import { ValidationPipe, VersioningType } from "@nestjs/common"
import { APP_VERSION } from "@/shared/constants"
import { LoggerService } from "@/shared/logger/logger.service"
import cookieParser from "cookie-parser"
import { HttpExceptionFilter } from "@/shared/filters/http-exception.filter"
import { ResponseInterceptor } from "@/shared/interceptors/response.interceptor"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  })

  app.use(cookieParser())

  app.setGlobalPrefix("api")
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: APP_VERSION,
  })

  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,POST,DELETE,OPTIONS",
    credentials: true,
  })

  app.use(morgan("dev"))

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )

  app.useGlobalFilters(new HttpExceptionFilter())

  app.useGlobalInterceptors(new ResponseInterceptor())
  await app.listen(process.env.PORT ?? 8000)

  const logger = app.get(LoggerService)
  const url = (await app.getUrl()).replace("[::1]", "localhost")
  const versioningUrl = `${url}/api/v${APP_VERSION}`

  logger.log(`🚀 Server is running at ${url}`)
  logger.info(`Health: ${versioningUrl}/health`)
  logger.info(`Liveness: ${versioningUrl}/health/live`)
  logger.info(`Readiness: ${versioningUrl}/health/ready`)
}
void bootstrap()
