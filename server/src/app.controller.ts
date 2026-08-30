import { Controller, Get, Redirect } from "@nestjs/common"
import { AppService } from "./app.service"
import { APP_VERSION } from "./shared/constants"

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Get()
  @Redirect(`/api/v${APP_VERSION}/health`, 302)
  redirectToHealth() {}
}
